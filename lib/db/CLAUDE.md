# lib/db/CLAUDE.md — Drizzle · 스키마 · 마이그레이션 규칙

`lib/db/` 또는 `drizzle/` 아래 파일을 편집할 때 자동으로 로드되는 컨텍스트.
공통 규칙은 루트 `CLAUDE.md` 참조.

---

## 단일 진실 원천

**Drizzle TypeScript DSL(`lib/db/schema.ts`)이 스키마의 유일한 원본이다.**
- 수동으로 SQL을 작성해 `drizzle/` 폴더에 넣지 않는다.
- `drizzle-kit generate`가 만든 파일만 커밋한다.
- Supabase SQL Editor/대시보드에서 스키마를 직접 건드리지 않는다.

---

## 데이터 모델 (MVP)

```ts
import { pgTable, uuid, text, integer, date, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tasks = pgTable(
  'tasks',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    parentId:    uuid('parent_id').references((): any => tasks.id, { onDelete: 'cascade' }),
    title:       text('title').notNull(),
    description: text('description'),
    assignee:    text('assignee'),
    status:      text('status').notNull().default('todo'),   // 'todo' | 'doing' | 'done'
    progress:    integer('progress').notNull().default(0),   // 0~100
    startDate:   date('start_date'),
    dueDate:     date('due_date'),                           // Task 목표 기한. 과제 제출 데드라인 아님.
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusCheck:   check('tasks_status_check',   sql`${t.status} in ('todo','doing','done')`),
    progressCheck: check('tasks_progress_check', sql`${t.progress} between 0 and 100`),
  })
);
```

- `due_date`/`dueDate` 이름을 `deadline`, `target_date` 등으로 바꾸지 않는다.
- MVP 단계에서 RLS는 사용하지 않는다. 필요해지면 사용자에게 먼저 확인한다.

---

## 스키마 변경 순서 (반드시 이 순서)

1. `lib/db/schema.ts` 수정
2. `npm run db:generate` → `drizzle/` 폴더에 SQL 마이그레이션 생성
3. 생성된 SQL 눈으로 리뷰 — 의도와 다르면 스키마를 고쳐 재생성
4. `npm run db:migrate` → 로컬 DB에 적용
5. 앱 코드 타입 오류 수정 및 기능 검증
6. `lib/db/schema.ts` + `drizzle/*.sql` + `drizzle/meta/*` 를 **단독 커밋**으로 푸시

> **DB 스키마 커밋은 UI·서버 로직 변경과 절대 묶지 않는다.**

---

## `drizzle.config.ts` 구조

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
```

---

## DATABASE_URL 3종류 — 절대 혼용 금지

| 용도 | 연결 종류 | 포트 | 사용 위치 |
|---|---|---|---|
| 로컬 개발 | `supabase status`의 DB URL | 54322 | `.env.local` |
| 마이그레이션 | Direct 또는 Session pooler | **5432** | GitHub Actions `PRODUCTION_DATABASE_URL` |
| Vercel 런타임 쿼리 | Transaction pooler | **6543** | Vercel env `DATABASE_URL` |

Transaction pooler(6543)로 `drizzle-kit migrate`를 실행하면 prepared statement 충돌로 실패한다.

로컬 연결 정보 확인: `supabase status`

---

## Supabase CLI 사용 범위

`supabase start` / `stop` / `status` — **로컬 컨테이너 기동 용도로만** 사용한다.

사용 금지 명령:
- `supabase migration new`
- `supabase db push`
- `supabase db reset`
- `drizzle-kit push`

로컬 DB 초기화 절차: `supabase stop` → `supabase start` → `npm run db:migrate`

---

## 프로덕션 마이그레이션

사람이 로컬에서 원격 DB에 직접 마이그레이션을 쏘지 않는다.
`main` 브랜치 push → `.github/workflows/db-migrate.yml`이 `PRODUCTION_DATABASE_URL`(port 5432)로 자동 실행.
