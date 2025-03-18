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
git clone https://github.com/사용자/레포지토리.git
cd 레포지토리
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
