// types > next-auth.d.ts
// next-auth 데이터 타입에 커스텀 데이터를 추가해 확장한다.

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
