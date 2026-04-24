# app/CLAUDE.md — Next.js 라우트 · 서버 로직 · 환경변수 규칙

`app/` 아래 파일을 편집할 때 자동으로 로드되는 컨텍스트.
공통 규칙은 루트 `CLAUDE.md` 참조.

---

## 풀스택 Next.js — 별도 백엔드 서버 없음

이 프로젝트는 Next.js 하나가 프론트엔드와 백엔드를 모두 담당한다.
Express·Fastify·NestJS 등 별도 Node 서버를 세우지 않는다.

| 레이어 | 위치 | 주의 |
|---|---|---|
| 페이지 UI | `app/**/page.tsx` | Server Component 기본. `'use client'`는 최소화 |
| API 엔드포인트 | `app/api/**/route.ts` | Route Handler |
| 서버 뮤테이션 | `lib/db/actions/*.ts` | Server Action (`'use server'`) |
| 공유 레이아웃 | `app/layout.tsx` | ChakraProvider 등 전역 Provider |

---

## Server / Client Component 경계

- **기본값은 Server Component.** `'use client'`는 브라우저 API·이벤트 핸들러·상태가 필요할 때만 붙인다.
- 클라이언트 컴포넌트에서 DB(`lib/db/`)에 직접 접근하지 않는다 — 반드시 Server Action 또는 Route Handler를 경유한다.
- `'use server'` 파일은 `lib/db/actions/` 또는 컴포넌트 파일 내 인라인 function에만 사용한다.

---

## 환경변수

| 변수 | 접두사 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` | Supabase REST/Auth 엔드포인트 (브라우저 노출 가능) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` | Supabase anon 키 (브라우저 노출 가능) |
| `DATABASE_URL` | 없음 | Drizzle 런타임 쿼리용 Postgres 접속 문자열 (서버 전용) |

- 클라이언트에서 쓰는 값에만 `NEXT_PUBLIC_` 접두사를 붙인다.
- `DATABASE_URL`은 절대 `NEXT_PUBLIC_`을 달지 않는다 — 서버 번들에만 포함된다.
- service role key는 클라이언트 코드에 절대 노출하지 않는다.

---

## MCP 활용

- **`context7`** — Next.js / Supabase / Drizzle API가 불확실하면 먼저 질의. 추측보다 문서 인용 우선.
- **`playwright`** — 로컬/배포 환경 브라우저 검증. USER_JOURNEY.md 시나리오 ID를 기준으로 결과 보고.

---

## 커밋 분리 원칙 (서버 로직 전용)

서버 로직·Route Handler·Server Action 변경은 UI 변경 및 DB 스키마 변경과 별도 커밋으로 분리한다.

```
# 좋은 예
feat: #3 Task 목록 조회 Server Action 추가         ← 서버 커밋
feat: #3 TaskList 컴포넌트 Server Action 연결      ← UI 커밋 (별도)

# 나쁜 예
feat: #3 Server Action + TaskList UI + schema     ← 레이어 혼합 금지
```

---

## 배포 체크리스트

배포 전에 반드시 확인:

- [ ] 원격 Supabase 프로젝트 생성됨
- [ ] GitHub **Settings → Secrets → Actions**의 `production` environment에 `PRODUCTION_DATABASE_URL` (port 5432) 등록
- [ ] `main` 브랜치 push 후 `db-migrate` 워크플로우 성공 (Actions 탭 초록 체크)
- [ ] Vercel **Production** 환경변수
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `DATABASE_URL` — Transaction pooler (port **6543**)
- [ ] `vercel --prod` 배포 성공 후 URL 접속 시 Task 목록 로드 확인
