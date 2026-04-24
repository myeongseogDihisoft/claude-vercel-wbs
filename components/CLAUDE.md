# components/CLAUDE.md — 프론트엔드 · UI 규칙

`components/` 아래 파일을 편집할 때 자동으로 로드되는 컨텍스트.
공통 규칙은 루트 `CLAUDE.md` 참조.

---

## UI 라이브러리: Chakra UI v3 단독

- **v2와 API가 다르다.** 컴포넌트 이름·prop이 불확실하면 반드시 `chakra-ui` MCP를 먼저 조회한다.
  ```
  # 예시
  mcp__chakra-ui__get_component_example (component: "Stack")
  mcp__chakra-ui__get_component_props   (component: "Button")
  ```
- Tailwind 클래스, shadcn/ui, MUI, Radix 등 다른 UI 라이브러리를 끌어오지 않는다.
- 전역 테마는 `app/providers.tsx`의 `ChakraProvider`에서만 변경한다.

---

## 파일·컴포넌트 네이밍

| 대상 | 규칙 | 예시 |
|---|---|---|
| 파일명 | kebab-case | `task-row.tsx`, `gantt-bar.tsx` |
| 컴포넌트명 | PascalCase | `TaskRow`, `GanttBar` |
| 커스텀 훅 파일 | `useXxx.ts` | `useTaskTree.ts` |

---

## 커밋 분리 원칙 (프론트엔드 전용)

UI 변경은 반드시 서버 로직·DB 스키마 변경과 별도 커밋으로 분리한다.

```
# 좋은 예
feat: #7 TaskRow 상태 뱃지 컴포넌트 추가          ← UI 커밋
feat: #7 Task 상태 업데이트 Server Action 추가     ← 서버 커밋 (별도)

# 나쁜 예
feat: #7 TaskRow 뱃지 + Server Action + schema    ← 레이어 혼합 금지
```

---

## USER_JOURNEY 연계

- 컴포넌트 변경 후 수동 검증은 `USER_JOURNEY.md`의 관련 시나리오 ID를 기준으로 수행한다.
- Playwright MCP(`mcp__playwright__*`)로 브라우저 검증 시 시나리오 ID를 결과에 명시한다.
  예: "J4 통과 — Task 생성 후 목록에 즉시 표시됨"
