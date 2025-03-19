# 🚀 Getting Started

## ✅ 요약

| 파일/설정            | 설명                                      |
|--------------------|-----------------------------------------|
| `.env.local`       | DB, NextAuth 환경 변수 설정                      |
| PostgreSQL 테이블     | `users`, `news` 테이블 구조 설정               |
| 예제 데이터         | `news`에 몇 가지 역할 기반 접근 제어 데이터 제공 |
| 서버 실행            | `npm run dev` 으로 실행 가능                         |


## 1️⃣ 프로젝트 클론 & 의존성 설치

```bash
git clone https://github.com/louis-cho/NextAuth.js-with-Credential
cd NextAuth.js-with-Credential
git checkout develop
git pull origin develop
npm install
```

---

## 2️⃣ `.env.local` 파일 설정

루트 디렉토리에 `.env.local` 파일을 생성 후, 다음과 같이 설정하세요:

```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=1234

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="MmUyoMFZAEEW4ArbcZUxZ1AZmOfvL7/ZhOyMbV0+z6k=" # Added by `npx auth`. Read more: https://cli.authjs.dev
```

---

## 3️⃣ PostgreSQL 테이블 생성

**PostgreSQL 접속 후 아래 테이블 생성 쿼리 실행:**

```sql
CREATE TABLE public.news (
	id serial4 NOT NULL,
	title text NOT NULL,
	content text NOT NULL,
	allowed_roles _text NULL,
	allowed_user_ids _int4 NULL,
	CONSTRAINT news_pkey PRIMARY KEY (id)
);

CREATE TABLE public.users (
	id serial4 NOT NULL,
	name text NULL,
	email text NOT NULL,
	password text NOT NULL,
	role text DEFAULT 'viewer'::text NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

---

## 4️⃣ 예제 데이터 (news)

```sql
INSERT INTO news (title, content, allowed_roles, allowed_user_ids)
VALUES 
('Public News 1', 'Anyone can read this news.', ARRAY['user', 'admin'], NULL),
('Admin Exclusive', 'Only admins can see this news.', ARRAY['admin'], NULL),
('User Specific News', 'Only user ID 2 has access to this.', NULL, ARRAY[2]),
('General Update', 'Open for all registered users.', ARRAY['user', 'admin'], NULL),
('Secret News', 'Exclusive for admin role.', ARRAY['admin'], NULL),
('Targeted User News', 'Only user ID 5 can read.', NULL, ARRAY[5]),
('Mixed Access News', 'Admins and user ID 3 can access.', ARRAY['admin'], ARRAY[3]);
```

---

## 5️⃣ 서버 실행

```bash
npm run dev
```
---

# NextAuth.js 인증 구현 가이드

### 주요 항목

- 프로젝트 설정 및 환경 변수 구성
- 데이터베이스 연결 설정
- NextAuth.js 설정 및 API 작성
- 타입 커스터마이징 및 Next.js 페이지 구성
- 사용자 인증 Flow와 NextAuth.js 내부 Flow
- 각 설정 옵션(Providers, Callbacks, Session, Pages, Events, Database, Secret)에 대한 상세 설명 및 코드 예제

---

## 1. 프로젝트 설정

### 1.1. 프로젝트 생성 및 모듈 설치
- **프로젝트 생성**: `next-auth-app`이라는 이름으로 Next.js 프로젝트 생성
- **추가 모듈 설치**:  
  - `next-auth`
  - `pg` 및 `@types/pg`  
  - 기타 프로젝트 필요 라이브러리

### 1.2. 환경 변수 설정 (.env 또는 .env.local)
환경 변수 파일에는 데이터베이스 연결 정보와 인증에 필요한 시크릿 키를 저장합니다.  
예시:
```dotenv
DATABASE_URL=postgresql://postgres:1234@localhost:5432/postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=1234

AUTH_SECRET="MmUyoMFZAEEW4ArbcZUxZ1AZmOfvL7/ZhOyMbV0+z6k="
```
- **AUTH_SECRET**: `$ npx auth secret` 명령어로 생성할 수 있으며, JWT 암호화 및 서명에 사용됩니다.

---

## 2. 데이터베이스 연결 및 설정

### 2.1. DB 연결 파일 (lib/db.ts)
PostgreSQL 연결을 위해 `pg` 라이브러리의 `Pool`을 사용하여 커넥션 풀을 구성합니다.
```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

export default pool;
```
**설명:**
- **Pool**: DB 연결을 관리합니다.
- **환경 변수**: 연결 정보를 외부에 노출하지 않고 안전하게 관리할 수 있습니다.

---

## 3. NextAuth.js 설정 및 API 작성

NextAuth.js는 API 라우트를 통해 인증 관련 요청을 처리합니다.  
파일 `/pages/api/auth/[...nextauth].ts`는 Catch-All Route로, `/api/auth/` 하위의 모든 요청(예: `/signin`, `/signout`, `/session`, `/callback/...`)을 처리합니다.

### 3.1. API Route 예제 및 CredentialsProvider 활용

```typescript
// pages/api/auth/[...nextauth].ts
import pool from "@/lib/db";
import { pbkdf2Config } from "@/types/pbkdf2Config";
import { pbkdf2Sync } from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    // 로그인 유지 여부에 따라 1년 또는 30분 등으로 조정할 수 있습니다.
    maxAge: 365 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
        keepSigned: { label: 'Keep Signed In', type: 'text' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials) return null;
        const { email, password, keepSigned } = credentials;
        const client = await pool.connect();

        try {
          // 사용자를 email 기준으로 조회합니다.
          const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
          if (userResult.rows.length === 0) return null;

          const user = userResult.rows[0];
          // DB에 저장된 비밀번호 해시 (알고리즘, 반복횟수, salt, 해시 값)
          const [algo, iterations, salt, storedHash] = user.password.split(':');

          // 입력한 비밀번호를 동일한 방식으로 해싱합니다.
          const hash = pbkdf2Sync(password, salt, parseInt(iterations, 10), pbkdf2Config.keylen, algo).toString('base64');
          if (hash !== storedHash) return null;

          // 로그인 성공 시 반환할 사용자 정보
          return {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            keepSigned: keepSigned === 'true',
          };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        } finally {
          client.release();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.keepSigned = user.keepSigned;

        // 세션 만료 시간 설정: 로그인 유지 여부에 따라 1년 또는 30분으로 설정
        const now = new Date();
        const expireDate = new Date(
          user.keepSigned
            ? now.getTime() + 365 * 24 * 60 * 60 * 1000
            : now.getTime() + 30 * 60 * 1000
        );
        token.expireAt = expireDate.toISOString();
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.keepSigned = token.keepSigned;
      session.user.expireAt = token.expireAt;
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  }
});
```

**설명:**
- **CredentialsProvider**: OAuth 외에도 로컬 아이디/비밀번호 인증을 위해 사용합니다.
- **pbkdf2Sync**: Node.js 내장 함수를 사용해 입력된 비밀번호를 해싱하고, DB의 해시와 비교합니다.
- **JWT 콜백**: 사용자 정보를 JWT에 포함하여 세션 유지 및 만료 시간을 제어합니다.
- **Catch-All Route**: `[...nextauth].ts` 파일은 `/api/auth/` 하위의 모든 요청을 처리합니다.

---
> **참고:**  
> NextAuth.js는 OAuth 인증을 간편하게 구현하기 위해 개발된 라이브러리입니다. Credentials 기반 인증은 보안상의 복잡성을 고려하여 사용이 제한적일 수 있으므로, 가능하다면 OAuth 제공자를 우선적으로 고려하는 것이 좋습니다.
---

## 4. 타입 커스터마이징

NextAuth.js 기본 타입에 추가 데이터를 포함하기 위해 타입 확장을 진행합니다.

```typescript
// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      keepSigned: boolean;
    };
  }

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
  }
}
```

**설명:**
- **타입 확장**: 클라이언트와 서버 간 일관된 데이터 구조를 위해 세션, 사용자, JWT에 추가 정보를 포함합니다.

---

## 5. Next.js 페이지 구성

### 5.1. _app.tsx에서 SessionProvider 사용

앱 전체에서 로그인 상태와 세션 정보를 손쉽게 사용할 수 있도록 `SessionProvider`를 적용합니다.

```typescript
// pages/_app.tsx
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

**설명:**
- **SessionProvider**: 전역 상태로 세션을 관리하여, 각 컴포넌트에서 로그인 정보를 쉽게 접근할 수 있도록 합니다.

### 5.2. 에러 페이지 구성

로그인 실패나 기타 에러 발생 시 사용자에게 친숙한 메시지를 보여주기 위해 커스텀 에러 페이지를 작성합니다.

```tsx
// pages/error.tsx
"use client"

import { useSearchParams } from "next/navigation"
import "@/styles/globals.css"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    AccessDenied: "You do not have permission to access this page.",
    Configuration: "There is a server configuration issue.",
    SessionExpired: "Session Invalid or Expired. Please sign in again.",
    default: "Something went wrong. Please try again.",
  }

  const message = error
    ? errorMessages[error] || errorMessages["default"]
    : errorMessages["default"]

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-500 to-yellow-500">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Oops!</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <a
          href="/signin"
          className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition"
        >
          Go to Sign In
        </a>
      </div>
    </main>
  )
}
```

**설명:**
- **useSearchParams**: URL의 쿼리 스트링에서 에러 코드를 읽어와, 이에 맞는 메시지를 출력합니다.

---

## 6. 인증 Flow

### 6.1. 사용자 인증 Flow

사용자 측면에서 인증 과정은 다음과 같이 진행됩니다:

1. **로그인 페이지 방문**  
   사용자는 `/signin` 또는 `/login` 페이지를 방문하여 로그인 폼을 확인합니다.

2. **자격 증명 입력**  
   사용자는 이메일(ID), 비밀번호, (선택적으로) 로그인 유지 여부(Keep Signed In)를 입력합니다.

3. **인증 요청 전송**  
   폼 제출 시, Next.js의 API 라우트(예: `/api/auth/signin`)를 통해 서버에 인증 요청을 보냅니다.

4. **서버 검증 및 응답**  
   서버는 데이터베이스에서 사용자를 조회한 후, 입력된 비밀번호를 해싱하여 저장된 해시와 비교합니다.  
   - 인증 성공 시, 사용자 정보가 JWT 토큰에 포함되어 반환됩니다.
   - 인증 실패 시, 에러 페이지로 리다이렉트됩니다.

5. **세션 관리**  
   인증 성공 후, `SessionProvider`를 통해 앱 전역에서 세션이 유지되며, UI는 로그인 상태(예: 사용자 이름, 권한 등)를 반영합니다.

6. **로그아웃 및 세션 만료**  
   사용자가 로그아웃하거나 세션이 만료되면, 다시 로그인 페이지로 리다이렉트됩니다.

### 6.2. NextAuth.js 내부 Flow

NextAuth.js 내부에서는 다음과 같은 순서로 인증 요청을 처리합니다:

1. **초기 설정**  
   API 라우트(`/api/auth/[...nextauth].ts`)에서 설정 파일을 로드하고, `secret`, `session`, `providers`, `callbacks`, `pages` 등의 옵션을 초기화합니다.

2. **Provider 선택 및 인증**  
   클라이언트에서 특정 Provider(예: CredentialsProvider)를 선택하여 로그인 요청을 보냅니다.  
   Provider의 `authorize` 함수가 호출되어 사용자 자격 증명을 검증합니다.

3. **JWT 생성 및 콜백 실행**  
   인증이 성공하면, NextAuth.js는 사용자 정보를 포함한 JWT 토큰을 생성합니다.  
   `jwt` 콜백 함수가 실행되어 추가 정보(예: id, role, 만료 시간 등)를 토큰에 삽입합니다.

4. **세션 생성**  
   클라이언트가 `session` 콜백을 통해 세션 정보를 요청하면, JWT 토큰의 정보를 기반으로 세션 객체가 구성되어 전달됩니다.

5. **커스텀 페이지 및 에러 처리**  
   로그인 실패, 권한 부족 등 상황에서는 설정된 커스텀 페이지(예: `/error`)로 리다이렉트되어 사용자에게 적절한 에러 메시지를 보여줍니다.

**정리:**
- **사용자 Flow**: 로그인 페이지에서 자격 증명을 입력하고, 서버의 검증 후 세션이 유지되는 과정을 중심으로 합니다.
- **NextAuth.js Flow**: 내부적으로 Provider 설정, 콜백 처리, JWT 및 세션 생성을 통해 인증 요청을 처리합니다.
- **CredentialsProvider를 쓰는 경우**: NextAuth.js는 기본적으로 외부 제공자 (Google, GitHub 등) 를 활용하는 것을 원칙으로 하나, CredentialProvider를 구현하는 경우 직접 개발자가 보안 조치를 취해야 합니다.