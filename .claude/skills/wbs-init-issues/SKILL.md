---
name: wbs-init-issues
description: WBS 과제 저장소에 한국어 라벨 24개와 초기 GitHub 이슈 트리(에픽 9 + 서브이슈 13)를 한 번에 등록합니다. 수강생이 저장소를 fork한 직후 "이슈 세팅", "이슈 초기화", "wbs 이슈 만들어줘" 같은 요청을 했을 때 사용합니다. 멀티세션(claude-squad) 병렬 작업이 바로 가능한 형태로 라벨·본문·체크리스트까지 맞춰둡니다.
---

# wbs-init-issues

WBS 과제의 **이슈·라벨 뼈대를 한 번에** 구축한다. Fork된 저장소는 Issues 탭이 OFF로 시작하기 때문에 먼저 켜고, 한국어 라벨 세트를 만든 뒤, 에픽/서브이슈를 생성하고, 에픽 본문에 서브이슈 체크박스로 연결한다.

**자동 실행 금지.** 각 스텝은 수강생에게 "실행할까요?"로 승인받고 진행.

## 전제

- `gh auth status`로 GitHub CLI가 로그인돼 있음
- 현재 저장소가 이미 GitHub 원격에 올라가 있음 (`gh repo view` 성공)
- 저장소 루트에 `SPEC.md`, `USER_JOURNEY.md`, `CLAUDE.md` 존재 (WBS 과제 템플릿이 맞는지 간단 확인)

전제 실패 시 진행하지 않고 수강생에게 원인을 알려준다.

## 절차

### 1. 저장소 상태 점검

병렬 Bash로 수집:

```bash
gh repo view --json nameWithOwner,isFork,hasIssuesEnabled --jq '.'
gh issue list --state all --limit 30 --json number,title --jq 'length'
gh label list --limit 100 --json name --jq '[.[].name] | map(select(startswith("에픽:") or startswith("타입:") or startswith("영역:") or startswith("상태:"))) | length'
```

결과로 표시:
- 포크 여부 / Issues 탭 상태
- 이미 있는 이슈 개수
- 한국어 라벨 존재 개수(0이면 완전 새 저장소, 24면 이미 세팅됨)

**이미 어느 정도 세팅이 돼 있으면**, "덮어쓰지 않고 빠진 것만 채울까요?"로 물은 뒤 **멱등 모드**로 진행한다(생성 실패는 무시).

### 2. Issues 탭 활성화 (포크 전용)

`hasIssuesEnabled: false`이면:

```bash
gh api -X PATCH "repos/$(gh repo view --json nameWithOwner --jq .nameWithOwner)" -F has_issues=true --jq '.has_issues'
```

→ `true` 반환 확인.

### 3. 한국어 라벨 24개 생성

이미 있으면 skip되도록 `|| true`. 한 번에 하나씩 결과를 보여주면서 진행(대량 실패 방지).

```bash
# 에픽 9개 (N.0 번호와 1:1 매핑)
gh label create "에픽:1.0 부트스트랩"  --color "C2E0C6" --description "Next.js/Chakra/Supabase/Drizzle 초기 세팅" || true
gh label create "에픽:2.0 CI"          --color "C2E0C6" --description "GitHub Actions db-migrate 워크플로우" || true
gh label create "에픽:3.0 데이터"      --color "C2E0C6" --description "쿼리·Server Action 골격" || true
gh label create "에픽:4.0 목록 뷰"     --color "C2E0C6" --description "A/E — 목록·계층" || true
gh label create "에픽:5.0 CRUD"        --color "C2E0C6" --description "B/C/D — 생성·수정·삭제" || true
gh label create "에픽:6.0 CSV"         --color "C2E0C6" --description "F — Import/Export" || true
gh label create "에픽:7.0 간트"        --color "C2E0C6" --description "G — 간트 뷰" || true
gh label create "에픽:8.0 지남 표시"   --color "C2E0C6" --description "H — Overdue" || true
gh label create "에픽:9.0 배포"        --color "C2E0C6" --description "Supabase Cloud/Vercel" || true

# 타입 6개 (이슈 제목의 [타입] 접두와 정합)
gh label create "타입:기능 구현"       --color "0E8A16" --description "새 기능 개발 (feat)" || true
gh label create "타입:세팅"            --color "FBCA04" --description "설정·스캐폴딩 (setup)" || true
gh label create "타입:DB"              --color "5319E7" --description "스키마·마이그레이션 (db)" || true
gh label create "타입:CI/CD"           --color "BFDADC" --description "GitHub Actions·Vercel" || true
gh label create "타입:마감 작업"       --color "FEF2C0" --description "잔손질·시각 폴리싱 (polish)" || true
gh label create "타입:문서"            --color "1D76DB" --description "문서 작업 (docs)" || true

# 영역 6개
gh label create "영역:UI"              --color "6B8BFF" --description "React/Chakra 컴포넌트" || true
gh label create "영역:DB"              --color "B799FF" --description "Drizzle 스키마·쿼리" || true
gh label create "영역:CSV"             --color "AEDF8F" --description "CSV Import/Export" || true
gh label create "영역:간트"            --color "D93F0B" --description "간트 뷰" || true
gh label create "영역:배포"            --color "006B75" --description "Vercel·Supabase Cloud" || true
gh label create "영역:CI"              --color "79C9D4" --description "GitHub Actions" || true

# 상태 3개 (운영용)
gh label create "상태:진행 중"         --color "F9D0C4" --description "현재 작업 중. 에픽 클레임 시 부착" || true
gh label create "상태:후속 조치"       --color "E99695" --description "PR 리뷰에서 파생된 별도 이슈" || true
gh label create "상태:블록됨"          --color "B60205" --description "선행 이슈 대기" || true
```

### 4. 에픽 9개 생성 (#1~#9 예상)

각 에픽은 본문 파일을 `mktemp -d`에 만들어 `--body-file`로 전달한다(셸 이스케이프 안전). 본문 템플릿은 이 파일의 하단 부록에 있다. **생성 순서는 고정**(1.0 → 9.0) — 그래야 이슈 번호가 예측 가능해진다.

각 에픽 커맨드:
```bash
gh issue create \
  --title "[<타입>] N.0 <제목>" \
  --body-file "$T/eN0.md" \
  --label "에픽:N.0 <이름>" --label "타입:<타입>" --label "영역:<영역(옵션)>"
```

라벨 매핑(플랜 §8.B-4):
| 에픽 | 타입 | 영역 |
|---|---|---|
| 1.0 | 세팅 | — |
| 2.0 | CI/CD | CI |
| 3.0 | 기능 구현 | DB |
| 4.0 | 기능 구현 | UI |
| 5.0 | 기능 구현 | UI |
| 6.0 | 기능 구현 | CSV |
| 7.0 | 기능 구현 | 간트 |
| 8.0 | 마감 작업 | UI |
| 9.0 | CI/CD | 배포 |

**멱등성**: 생성 전 `gh issue list --search 'in:title "N.0"' --state all --json number` 로 중복 검사. 이미 있으면 skip.

### 5. 초기 서브이슈 13개 생성 (1.x, 2.x, 3.x, 9.x)

> **4.0~8.0의 서브이슈는 이번에 만들지 않는다.** 플랜 §2 "생성 시점" 규칙 — 직전 에픽이 머지된 뒤에 해당 에픽 세션이 별도로 등록한다.

생성 대상과 라벨:

| 서브 | 제목 | 타입 | 영역 |
|---|---|---|---|
| 1.1 | Next.js 14 App Router + TypeScript 스캐폴드 | 세팅 | — |
| 1.2 | Chakra UI v3 Provider 연결 | 세팅 | UI |
| 1.3 | Supabase client/server 모듈 분리 | 세팅 | DB |
| 1.4 | Drizzle 클라이언트 + drizzle.config.ts + npm 스크립트 | 세팅 | DB |
| 1.5 | tasks 스키마 정의 + drizzle-kit generate/migrate | DB | DB |
| 2.1 | .github/workflows/db-migrate.yml 작성 | CI/CD | CI |
| 2.2 | README 배포 섹션 secret 안내 정합성 점검 | 문서 | — |
| 3.1 | Task 트리 조회 쿼리 (lib/tasks/queries.ts) | 기능 구현 | DB |
| 3.2 | Task CRUD Server Action 시그니처 골격 | 기능 구현 | DB |
| 9.1 | Supabase Cloud 프로젝트 생성 + URL 수집 | CI/CD | 배포 |
| 9.2 | GitHub Actions production secret 등록 + db-migrate 검증 | CI/CD | CI |
| 9.3 | Vercel 프로젝트 연결 + env 등록 + vercel --prod | CI/CD | 배포 |
| 9.4 | README 상단에 공개 URL 기재 | 문서 | — |

각 서브 본문은 부록 템플릿 사용. **부모 에픽 번호는 1~9(에픽 생성 직후 수집한 번호)로 동적 치환**한다.

### 6. 에픽 본문 백필 (서브이슈 체크박스 연결)

각 에픽(이번 배치에선 1.0/2.0/3.0/9.0)의 본문을 `gh issue edit $EPIC --body-file ...`로 덮어 씌워, "## 포함 서브이슈" 섹션에 서브이슈 번호를 체크박스 리스트로 넣는다. GitHub이 task list로 자동 집계한다.

**4.0/5.0/6.0/7.0/8.0**은 서브가 아직 없으므로 "(직전 에픽 머지 후 등록 예정)" 한 줄만 남긴다.

### 7. 마무리 안내

완료되면 다음 한 단락을 출력하고 스킬 종료:

> ✅ WBS 이슈 초기화 완료
> - 라벨 24종, 에픽 9개, 초기 서브이슈 13개 등록됨
> - 다음 단계: `cs`(claude-squad)로 `epic-1.0-bootstrap` 인스턴스를 만들고 이슈 #1의 서브이슈 #__(1.1)부터 순차 진행
> - 4.0~8.0의 서브이슈는 각 에픽 클레임 시점에 별도로 등록됩니다

그리고 수강생에게 `cs` TUI 기동 안내(플랜 §10-4 복붙) 제공.

---

## 규칙

- **멱등성 필수**: 라벨·이슈 모두 이미 존재하면 중복 생성하지 않고 skip한다. `|| true` 또는 사전 검사.
- **한 번에 하나 승인**: 대량 삽입이라도 사용자가 "진행해"라고 할 때만 이어간다. 라벨 24개 일괄 생성은 한 번의 승인으로 간주해도 된다(실패해도 복구 쉬움).
- **4.0~8.0의 서브이슈는 이번에 만들지 않는다** — 이 원칙을 깨면 스펙 진화에 따라 낡은 이슈가 쌓인다.
- **이슈 번호는 동적으로 수집** — fork마다 번호가 다를 수 있다. 제목으로 찾고 번호를 캐시해서 크로스 링크에 사용.
- **한국어로 대화** — 라벨 이름·이슈 제목·본문 모두 한국어.
- 스킬은 **파일을 쓰지 않는다** — 오직 `gh` CLI로 GitHub에만 변경을 가한다.

---

## 부록 A — 에픽 본문 템플릿 (예시: Epic 1.0)

```markdown
## 목적
Next.js 14 + Chakra UI v3 + Supabase + Drizzle ORM 기반 WBS 앱의 뼈대를 만든다. 이후 모든 에픽(2.0~9.0)의 선행 조건.

## 포함 서브이슈
- [ ] #__ [setup] 1.1 Next.js 14 App Router + TypeScript 스캐폴드
- [ ] #__ [setup] 1.2 Chakra UI v3 Provider 연결
- [ ] #__ [setup] 1.3 Supabase client/server 모듈 분리
- [ ] #__ [setup] 1.4 Drizzle 클라이언트 + drizzle.config.ts + npm 스크립트
- [ ] #__ [db] 1.5 tasks 스키마 정의 + drizzle-kit generate/migrate

## 완료 조건 (DoD)
- [ ] 1.1~1.5 모든 서브이슈 머지됨
- [ ] 로컬에서 `supabase start` → `npm run db:migrate` → `npm run dev` 흐름이 에러 없이 동작
- [ ] `npm run build && npm run lint` 통과

## 파일 소유 (플랜 §3-3)
주: <해당 에픽 소유 파일 나열>
공유: <조심해야 할 공유 파일>

## 참고
- 스펙: SPEC.md §__
- 플랜: `iridescent-puzzling-hammock.md` (§3 멀티세션, §10 claude-squad)
```

## 부록 B — 서브이슈 본문 템플릿

```markdown
## 스펙
- SPEC.md §__
- 관련 시나리오: J__

## 할 일
<1~5줄로 무엇을 할지>

## 완료 조건 (DoD)
- [ ] 대응 J 시나리오 수동 회귀 통과 (구현 에픽인 경우)
- [ ] `npm run build && npm run lint` 성공
- [ ] 파일 수정 ≤ 10, 라인 ≤ 300 (초과 시 분리, 플랜 §2 사이즈 캡)

## 파일 소유 (§3-3)
주: ...
공유: ...

## 부모 에픽
#<에픽 번호>
```

---

## 부록 C — 병렬 처리 매트릭스 (이슈 등록 직후 기준)

| 단계 | 병렬 가능 에픽 | 동시 세션 | 차단 해제 |
|---|---|---|---|
| T1 (지금) | 1.0 | 1 | — |
| T2 (1.5 머지 후) | 2.0, 3.0 | 2 | Epic 1.0 완료 |
| T3 (3.2 머지 후) | 4.0, 5.0, 6.0, 7.0 | 4 | Epic 3.0 완료 |
| T4 (4.0+7.0 머지 후) | 8.0 | 1 | Epic 4.0+7.0 완료 |
| T5 (전 에픽 후) | 9.0 | 1 | 이전 모두 완료 |

**T3 주의**: 4.0/5.0/6.0/7.0은 모두 `app/page.tsx`에 훅을 추가. 컴포넌트 본체는 병렬 가능하지만 `app/page.tsx` 수정은 직렬화(보통 4.0 우선 머지 후 나머지 rebase).

**T5 최적화**: 9.1(Supabase Cloud 프로젝트 생성)은 외부 설정이라 Epic 1.0 완료 시점부터 언제든 수강생이 병행 가능.
