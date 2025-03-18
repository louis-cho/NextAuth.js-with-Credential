import pool from "@/lib/db"; // PostgreSQL DB Pool 연결
import { pbkdf2Config } from "@/types/pbkdf2Config"; // pbkdf2 해싱 설정값
import { pbkdf2Sync } from "crypto"; // Node.js 내장 pbkdf2 해시 함수
import NextAuth from "next-auth"; // NextAuth 메인 모듈
import CredentialsProvider from "next-auth/providers/credentials"; // Credentials (ID/PW) Provider

export default NextAuth({
    // 세션 서명에 사용할 시크릿 키 (필수)
    secret: process.env.NEXTAUTH_SECRET,

    // 세션 관리 설정
    session: {
        strategy: 'jwt', // 세션은 JWT로 관리 (서버-DB 세션 아님)
        maxAge: 365 * 24 * 60 * 60 // 30 * 60, // 세션 최대 유효 시간: 30분 (초 단위)
    },

    // Provider 설정 - 여기선 CredentialsProvider (로컬 ID/PW 로그인)
    providers: [
        CredentialsProvider({
            name: 'Credentials', // Provider 이름
            credentials: {
                email: { label: 'ID', type: 'text' }, // 로그인 폼 필드
                password: { label: 'Password', type: 'password' },
                keepSigned: { label: 'Keep Signed In', type: 'text' }, // 선택적 "로그인 유지" 체크박스
            },
            // 로그인 시 호출되는 핵심 함수 (ID/PW 검증)
            async authorize(credentials: Record<string, string> | undefined) {
                if (!credentials)
                    return null; // credentials 없으면 로그인 실패

                const { email, password, keepSigned } = credentials; // 클라이언트 입력값

                // PostgreSQL 연결
                const client = await pool.connect();

                try {
                    // DB에서 사용자 정보 조회 (email 기준)
                    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
                    if (userResult.rows.length === 0) return null; // 유저 없으면 실패

                    const user = userResult.rows[0];

                    // DB에 저장된 비밀번호 해시 파싱
                    const [algo, iterations, salt, storedHash] = user.password.split(':');

                    // 입력한 비밀번호를 같은 방식으로 해싱
                    const hash = pbkdf2Sync(password, salt, parseInt(iterations, 10), pbkdf2Config.keylen, algo).toString('base64');

                    if (hash !== storedHash) return null; // 해시 불일치 → 로그인 실패

                    // 로그인 성공 → 세션에 저장할 정보 반환
                    return {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        email: user.email,
                        keepSigned: keepSigned === 'true', // keepSigned 값 boolean으로 변환
                    };
                } catch (err) {
                    console.error('Auth error:', err); // 에러 로그
                    return null;
                } finally {
                    client.release(); // DB 커넥션 해제
                }
            },
        }),
    ],

    // JWT, Session 콜백 (세션/토큰에 사용자 정보 추가)
    callbacks: {
        // jwt 토큰 생성 시 호출
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.keepSigned = user.keepSigned;

                const now = new Date();
                const expireDate = new Date(
                    user.keepSigned
                        ? now.getTime() + 365 * 24 * 60 * 60 * 1000 // 1년
                        : now.getTime() + 30 * 60 * 1000 // 30분
                );
                token.expireAt = expireDate.toISOString();

                console.log("JWT Token >> " + JSON.stringify(token));
            }
            return token;
        },

        // 클라이언트에서 세션을 가져올 때 호출
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.keepSigned = token.keepSigned;
            session.user.expireAt = token.expireAt;

            console.log("Session >> " + JSON.stringify(session));
            return session;
        }
    },

    pages: {
        signIn: '/signin',
        error: '/error', // 로그인 에러도 포함한 모든 에러 시 여기로 이동
    }
});
