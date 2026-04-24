# CLAUDE.md

이 문서는 **Claude Code 에이전트**가 이 저장소에서 작업할 때 반드시 따라야 하는 프로젝트 지침이다. 수강생(사용자)을 위한 안내는 `README.md`에 있다.

> **컨텍스트 분리**: 디렉토리별 상세 규칙은 해당 폴더의 `CLAUDE.md`에 있다.
> Claude Code가 해당 폴더의 파일을 열면 자동으로 로드된다.
> - `components/CLAUDE.md` — Chakra UI · 컴포넌트 규칙
> - `lib/db/CLAUDE.md` — Drizzle · 스키마 · 마이그레이션
> - `app/CLAUDE.md` — Server/Client 경계 · Route Handler · 환경변수

---

## 1. 프로젝트 목적

교육용 WBS(Work Breakdown Structure) 과제. 수강생(코드 초심자)이 **스스로 타이핑하지 않고 Claude Code에게 지시**해서, Next.js 기반 WBS 앱을 만들고 로컬 Supabase(Docker)로 개발한 뒤 Vercel + 원격 Supabase로 배포해 공개 URL을 획득하는 것이 목표다.

Claude의 역할은 코드를 빠르게 만들어 주는 것이 아니라 **수강생이 각 단계를 이해할 수 있도록 결과를 설명하는 것**이다. 따라서:

- 한 번의 응답에 너무 많은 파일을 동시에 생성·수정하지 않는다.
- 변경을 적용하기 전에 의도를 한국어 한두 문장으로 먼저 설명한다.
- 수강생에게 "왜 이 파일을 건드렸는지"가 보이도록 한다.

---

## 1-A. 첫 프롬프트 시작 규약 (반드시 따를 것)

수강생이 이 저장소를 **클론한 뒤 처음 말을 걸어왔을 때**, Claude는 수강생의 요구와 관계없이 아래 2-스텝 체크를 먼저 제안하고 각 단계에서 승인을 받는다.

> "이 세션이 처음인가?" 판단 단서: 대화 초반이며 아직 `supabase status`/`npm run dev`/`ls` 등 상태 확인 결과가 없음.

### 스텝 1 — 환경 점검

Bash로 병렬 실행:

- `docker info`
- `supabase --version`
- `node -v`

결과 요약을 한두 줄로 보여주고 판단:
- **모두 ✅** → 스텝 2로 진행
- **하나라도 ❌** → `/setup-dev-environment` 스킬 호출 제안 → 완료 후 스텝 2로

### 스텝 2 — 로컬 서버 기동 제안

> "로컬 개발 서버(Supabase 컨테이너 + Next.js)를 기동할까요? `/dev-server` 스킬이 다 해줍니다."

- 승인 → `/dev-server` 호출 → 완료 후 본 요청으로
- 거절 → 그대로 본 요청으로

### 예외

- 첫 메시지가 환경/실행과 무관한 문서 질문이면 위 스텝을 건너뛴다.
- "셋업은 됐어", "바로 시작해" 등 명시적 거절이면 따른다.

---

## 1-B. 제품 스펙 · 사용자 여정 문서 (중요)

| 파일 | 역할 |
|---|---|
| `SPEC.md` | 제품 스펙의 단일 진실 원천. 기술 용어·구현 상세는 담지 않는다. |
| `USER_JOURNEY.md` | Given/When/Then 시나리오. 테스트·수동 검증의 근거. |

### Claude의 행동 규칙

1. **기능 구현·변경 요청이 들어오면 먼저 `SPEC.md`를 읽는다.**
   - 요청이 정의와 충돌 → 구현 멈추고 사용자에게 확인
   - 요청이 정의에 없음 → "`SPEC.md`에 먼저 추가한 뒤 구현할까요?"로 확인

2. 테스트 작성 시 `USER_JOURNEY.md` 시나리오를 출발점으로 삼는다.

3. Playwright MCP 검증 시 `USER_JOURNEY.md` 하단 "수동 회귀 체크리스트"를 기본 순서로 사용. 결과 보고 시 시나리오 ID(예: "J13 통과, J15 실패")로 지칭한다.

4. 두 문서는 한국어 자연어로 유지한다. SQL·필드명·컴포넌트 이름 등 구현 어휘는 이 `CLAUDE.md` 또는 코드 주석으로.

5. `SPEC.md`의 "9. 범위 밖" 섹션은 §5 금기사항의 "과제 범위 밖 기능" 기준으로 작동한다.

---

## 2. 기술 스택 (고정 — 대체 금지)

| 레이어 | 기술 |
|---|---|
| 풀스택 프레임워크 | Next.js 14+ (App Router, TypeScript) |
| DB / Auth | Supabase (로컬: Docker, 원격: Cloud) |
| ORM | Drizzle ORM |
| UI | **Chakra UI v3** 단독 (다른 UI 라이브러리 혼용 금지) |
| 런타임 | Node.js 20+ |
| 패키지 매니저 | **npm** 단독 (pnpm·yarn·bun 혼용 금지) |
| 배포 | Vercel |

이 프로젝트에는 **별도의 백엔드 서버가 없다.** DB 쿼리·비즈니스 로직·외부 API 호출은 Server Component / Server Action / Route Handler 안에서만 수행한다.

---

## 3. 디렉토리 컨벤션

| 경로 | 용도 |
|---|---|
| `app/` | Next.js App Router 엔트리. 상세 규칙 → `app/CLAUDE.md` |
| `components/` | Chakra UI 기반 React 컴포넌트. 상세 규칙 → `components/CLAUDE.md` |
| `lib/supabase/` | Supabase client·server 모듈 분리 |
| `lib/db/` | Drizzle schema·client. 상세 규칙 → `lib/db/CLAUDE.md` |
| `drizzle/` | drizzle-kit 생성 마이그레이션 SQL — **git 커밋 필수, 손 편집 금지** |
| `supabase/` | Supabase CLI 설정(`config.toml`). `migrations/` 폴더는 사용하지 않는다 |
| `.github/workflows/` | CI/CD. 프로덕션 마이그레이션은 여기서만 실행 |

파일명: kebab-case (`task-row.tsx`) / 컴포넌트명: PascalCase (`TaskRow`) / 훅: `useXxx.ts`

---

## 4. 커밋 규칙 (엄수)

### 원자성 — 가장 중요

**레이어를 섞지 않는다.** 아래 변경 유형은 각각 별도 커밋이다:

| 변경 유형 | 포함 경로 예시 | 별도 커밋 이유 |
|---|---|---|
| UI / 프론트엔드 | `components/`, `app/page.tsx` 등 | 백엔드와 리뷰 포인트가 다름 |
| 서버 로직 / API | `app/api/`, `lib/db/actions/` | 프론트와 독립적으로 검증 가능 |
| DB 스키마 | `lib/db/schema.ts` + `drizzle/*.sql` + `drizzle/meta/*` | 항상 단독 커밋. 다른 변경과 절대 묶지 않는다 |
| 설정 / 인프라 | `.github/`, `drizzle.config.ts`, `package.json` | 기능 커밋과 분리 |
| 문서 | `*.md` | 코드 커밋과 분리 |

**Issue 단위**: 하나의 GitHub Issue = 최대 하나의 커밋. 여러 Issue를 한 커밋에 섞지 않는다.

**예외(묶기 허용)**: 합계 ≤5파일 AND ≤150라인이고 논리적으로 불가분한 경우에만 허용. 이 경우에도 사용자에게 먼저 알리고 승인받는다.

### 메시지 형식

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Issue 번호 참조: `feat: #3 Task 생성 모달`
- PR 본문에는 반드시 `Closes #N` 포함 (자동 이슈 종료)

### 주석

꼭 필요할 때만. 코드로 드러나지 않는 "왜"만 남기고, "무엇을 하는지"는 쓰지 않는다.

---

## 5. 금기사항 (Do NOT)

- ❌ service role key를 클라이언트(브라우저 번들) 코드에 쓰지 않는다
- ❌ `.env.local`, `.env`, `supabase/.temp/`를 커밋하지 않는다
- ❌ 원격 Supabase DB에 로컬에서 직접 `drizzle-kit migrate`를 쏘지 않는다 — GitHub Actions 경유
- ❌ Supabase SQL Editor/대시보드에서 스키마를 직접 손대지 않는다
- ❌ `drizzle-kit push` 사용 금지 — 항상 `generate` + `migrate` 조합
- ❌ `supabase migration new`, `supabase db push`, `supabase db reset` 사용 금지
- ❌ Transaction pooler(6543)로 마이그레이션 실행 금지
- ❌ Chakra UI 이외 UI 라이브러리(Tailwind, shadcn, MUI 등) 혼용 금지
- ❌ `SPEC.md`의 "9. 범위 밖" 기능을 사용자 확인 없이 추가하지 않는다
- ❌ 별도 백엔드 서버(Express/Fastify/NestJS 등)를 세우지 않는다
- ❌ 여러 레이어(프론트+백+DB)를 한 커밋에 묶지 않는다

---

## 6. 파일 인덱스 (빠른 참조)

### 문서

| 파일 | 대상 | 요약 |
|---|---|---|
| `README.md` | 수강생 | 과제 안내 + 실습 가이드 + 배포 절차 |
| `SPEC.md` | 모두 | 사용자 관점 기능 스펙 |
| `USER_JOURNEY.md` | 테스터/Claude | Given/When/Then 시나리오 |
| `CLAUDE.md` (이 파일) | Claude Code | 공통 규칙 |
| `components/CLAUDE.md` | Claude Code | 프론트엔드/UI 규칙 |
| `lib/db/CLAUDE.md` | Claude Code | DB/Drizzle 규칙 |
| `app/CLAUDE.md` | Claude Code | 라우트/서버 규칙 |

### 내장 스킬

| 명령 | 언제 사용 |
|---|---|
| `/setup-dev-environment` | 로컬 의존성 진단 + 설치/로그인 가이드 |
| `/dev-server` | Supabase 컨테이너 + Next.js 개발 서버 기동 |

### CI/CD

- `db-migrate.yml` — `main` 브랜치 push 시 `drizzle-kit migrate`를 `PRODUCTION_DATABASE_URL`에 실행
