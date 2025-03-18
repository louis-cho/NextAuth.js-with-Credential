import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const expireAt = token?.expireAt ? new Date(token.expireAt).getTime() : null;
  const now = Date.now();

  if (expireAt && expireAt < now) {
    console.log("강제 로그아웃 처리합니다.");
    // 토큰 만료 → 강제 로그아웃 처리
    const redirectUrl = new URL(`/signin?error=SessionExpired`, req.url);
    const res = NextResponse.redirect(redirectUrl);

    // 세션 쿠키 강제 삭제
    res.cookies.set("next-auth.session-token", "", { expires: new Date(0), path: "/" });
    res.cookies.set("__Secure-next-auth.session-token", "", { expires: new Date(0), path: "/" });
    return res;
  }


  // 1️⃣ 로그인 필요 페이지 (관리자/유저)
  const protectedRoutes = ["/admin", "/user", "/dashboard", "/news"]

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // 로그인 안 했으면 signin으로
      return NextResponse.redirect(new URL("/error?error=SessionExpired", req.url))
    }
  }

  // 2️⃣ 관리자만 접근 가능한 경로
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/error?error=AccessDenied", req.url))
    }
  }

  // 3️⃣ 특정 news 예시 (단, Middleware에서는 세부 데이터 접근 어려움. DB 조회 필요시 서버 컴포넌트에서 해야 함)
  // ex: /news/43 은 'a' 유저만 → 이건 서버 컴포넌트에서 처리해야 효율적임

  return NextResponse.next()
}

// 4️⃣ 정적 파일, API 등 제외
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
