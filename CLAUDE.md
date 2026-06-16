# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반의 **노트 앱 실습 프로젝트**(강의용). 노트 CRUD가
전부인 단순한 도메인이며, 새 기능(예: `tags`)을 단계적으로 추가하며 학습하도록
설계됨. `src/types/note.ts`에는 `// ❌ tags 필드는 아직 없음 — 강의에서 추가할 것`
같이 의도적으로 미완성으로 남긴 부분이 주석으로 표시되어 있다.

백엔드는 별도 서버 없이 **json-server**(`db.json`)로 REST API를 흉내 낸다. 실제
영속성은 `db.json` 파일에 직접 기록된다.

## 명령어

| 명령어               | 설명                                                        |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | Vite(5173) + json-server(3001) **동시 실행** (concurrently) |
| `npm run server`     | json-server만 실행 (3001)                                   |
| `npm run build`      | `tsc` 타입체크 후 Vite 프로덕션 빌드                        |
| `npm run lint`       | ESLint 검사 **+ 자동 수정** (`--fix` 포함됨)                |
| `npm run format`     | Prettier 포맷                                               |
| `npm test`           | Vitest 1회 실행                                             |
| `npm run test:watch` | Vitest watch 모드                                           |

- 단일 테스트 실행: `npx vitest run src/path/to/file.test.tsx` 또는 `-t "테스트명"`.
- 프론트와 API는 별도 프로세스다. `npm run dev` 없이 컴포넌트를 띄우면 fetch가
  실패하므로, API가 필요한 작업은 json-server가 떠 있어야 한다.

## 아키텍처

단방향 흐름: `컴포넌트 → useNotes() → NotesContext → api/notes.ts → json-server(db.json)`

- **`api/notes.ts`** — 유일한 네트워크 계층, `fetch` CRUD 순수 함수. `API_URL` 하드코딩.
- **`context/NotesContext.tsx`** — 전역 상태 단일 출처(노트·로딩·에러). `useNotes()` 훅으로만 접근(밖에서 호출 시 throw).
- **컴포넌트** — `App`이 UI 상태 소유 → `Layout`(`sidebar`/`main` slot) → `NoteList`→`NoteItem` / `NoteEditor`.

## 컴포넌트 구현 패턴

- named export 함수 컴포넌트 (default는 `App`/`main`만), 파일 1개 = 컴포넌트 1개.
- props는 바로 위 `<컴포넌트명>Props` 인터페이스로 정의 + 시그니처에서 구조분해.
- loading/error/empty/미선택 분기는 early return으로 먼저, 본문은 정상 케이스만.
- 조건부 클래스는 템플릿 리터럴 + 삼항 인라인 (classnames 라이브러리 없음).
- 위임 클릭 안의 액션 버튼은 `e.stopPropagation()`으로 부모 핸들러 차단.

## 상태 관리 방식

- 서버 데이터 = Context, UI 상태(`selectedNoteId`, `isCreating`) = `App` 로컬, 섞지 말 것.
- state 갱신은 Context 액션으로만 — 컴포넌트는 `api/notes.ts` 직접 import 금지.
- mutation은 재조회 없이 함수형 업데이트로 낙관적 갱신 (`prev` map/filter/spread).
- `NoteEditor` 폼 동기화 effect의 의존성은 의도적으로 좁힘 (`eslint-disable` 유지, 넓히면 폼 리셋 버그).

## API 호출 패턴

- 네트워크는 `api/notes.ts` async 함수로 격리, 소비처는 `import * as api`.
- 입력 타입은 `Omit`(생성)·`Partial`(수정)으로 제한, 반환은 `Promise<Note[]>`/`Promise<Note>`.
- `!res.ok` → `throw`, 성공 → `res.json()`. POST/PATCH는 JSON 헤더 + `JSON.stringify`.
- 타임스탬프는 클라이언트 생성 (`new Date().toISOString()`), 서버는 저장만.
- 에러는 `console.error`로만 처리(`alert` 금지). 초기 로드 실패는 Context `error` state, mutation 실패는 호출부 try/catch.

## 네이밍 패턴

- 컴포넌트 내부 핸들러 `handleX` ↔ props 콜백 `onX`.
- CRUD 동사는 Context·API 모두 `create`/`update`/`delete`(+ 조회 `fetch`)로 통일.
- boolean은 `is`/`-ing` (`isCreating`, `saving`), 파일명은 컴포넌트만 PascalCase·그 외 camelCase.

## 스타일 / 기타 규칙

- Tailwind v4 (JS config 없음), 색상은 `src/index.css` `@theme` 토큰만 사용 (`bg-card` 등, 원시 색상값 금지).
- strict + `noUnusedLocals`/`noUnusedParameters`로 미사용 변수는 빌드 실패. UI·주석은 한국어.

## 테스트

Vitest + Testing Library + jsdom. 전역 API(`describe`/`it`/`expect`)는
`vite.config.ts`의 `globals: true`로 활성화, 셋업은 `src/test-setup.ts`. 아직
작성된 테스트 파일은 없다 — 테스트는 컴포넌트 옆에 `*.test.tsx`로 둔다.

## 커밋 규칙

husky 훅으로 강제(`commitlint.config.cjs`). 어기면 커밋이 차단된다.

- 형식: `<type>: <제목>` + 빈 줄 + 본문 (Conventional Commits).
- type: `build`/`chore`/`ci`/`docs`/`feat`/`fix`/`init`/`perf`/`refactor`/`revert`/`style`/`test` (소문자).
- 제목: 필수, 첫 줄 전체 72자 이내, 끝에 마침표 금지.
- 본문: 필수, 빈 줄 제외 **최소 2줄** (`-m` 1회로는 부족 → `-m` 여러 번 또는 에디터).
- commit 시 pre-commit 훅이 staged 파일에 `eslint --fix` + `prettier` 자동 적용.
