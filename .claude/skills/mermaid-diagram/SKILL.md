---
name: mermaid-diagram
description: >-
  이 notes-app 프로젝트의 src/ 구조를 Mermaid 다이어그램으로 시각화해 단일 HTML로 만들고
  브라우저로 띄운다. 사용자가 "구조 시각화", "아키텍처 그려줘", "컴포넌트 의존성/관계도",
  "mermaid", "다이어그램", "데이터/상태 흐름도" 등을 요청하면 — 명시적으로 'mermaid'를
  말하지 않아도 — 이 스킬을 사용한다. 항상 (1) 컴포넌트·모듈 의존성 그래프와
  (2) 상태 흐름도 두 가지를 모두 포함하고, 결과를 docs/architecture/index.html에 저장한 뒤
  macOS `open`으로 브라우저를 띄운다.
---

# mermaid-diagram

이 노트 앱(`ccwork`) 전용 아키텍처 시각화 스킬. `src/`를 실제로 분석해
**의존성 그래프 + 상태 흐름도**를 Mermaid로 그리고, 하나의 HTML로 묶어 브라우저로 연다.

핵심은 "지금 코드 상태를 그대로 비추는 거울"이다. 아래 구조 지식은 출발점일 뿐,
파일이 추가/삭제됐을 수 있으니 **매번 `src/`를 다시 읽어 검증**하고 그린다.

## 절차

### 1. src/ 분석
- `src/`의 `*.tsx`/`*.ts`를 훑고 각 파일의 `import` 구문에서 **내부 모듈 의존성**만 추출
  (상대경로 `./`, `../`만; `react` 등 외부 패키지는 노드로 그리지 않는다).
- 파일을 레이어로 분류한다:
  - **entry** — `main.tsx`, `App.tsx`
  - **components** — `components/*.tsx`
  - **context** — `context/*.tsx` (`useNotes()` 훅 포함)
  - **api** — `api/*.ts`
  - **types** — `types/*.ts`
- 외부 백엔드(`json-server` / `db.json`)는 흐름의 종착점으로 다이어그램에 포함하되,
  파일 노드가 아니라 별도 표시(점선·다른 색)로 둔다.

### 2. 다이어그램 작성 (항상 둘 다)

**(A) 컴포넌트·모듈 의존성 그래프** — `graph LR`
- 엣지 방향은 **"A가 B를 import/사용" → `A --> B`**.
- `subgraph`로 레이어를 묶고, `classDef`로 레이어별 색을 준다.
- 의존성은 실제 코드 기준으로만 그린다. 추측으로 엣지를 추가하지 말 것
  (예: 컴포넌트는 `api/notes.ts`를 직접 import 하지 않는다 — `useNotes()`를 통한다.
   이런 규칙 위반이 그래프에 나타나면 코드가 바뀐 것이므로 그대로 반영).

**(B) 상태 흐름도** — `flowchart TD`
- 읽기 흐름과 쓰기 흐름을 라벨로 구분한다:
  - 초기 로드: `NotesProvider` 마운트 → `api.fetchNotes()` → `notes` state → 컴포넌트 렌더
  - mutation: 컴포넌트 핸들러 → context 액션(`createNote`/`updateNote`/`deleteNote`)
    → `api.*` → 성공 시 **함수형 낙관적 갱신**(`setNotes(prev => ...)`) → 리렌더
  - UI 상태(`selectedNoteId`, `isCreating`)는 `App` 로컬 → props로 하향 전달임을 표시
    (서버 상태 = Context와 섞이지 않는다는 점이 드러나게).
- 실선 = 데이터/호출 흐름, 점선 = props/이벤트 전달 식으로 시각적으로 구분.

작성한 Mermaid 정의가 문법적으로 유효한지 스스로 검토한다(노드 id 중복, 한글 라벨은
`["..."]`로 감싸기, `subgraph` 종료 `end` 누락 주의).

### 3. HTML 생성 → docs/architecture/index.html
- `docs/architecture/` 디렉토리가 없으면 만든다.
- 아래 템플릿을 사용한다. Mermaid는 v11 ESM CDN, `startOnLoad: true`.
- 각 다이어그램은 `<pre class="mermaid">` 블록에 넣고, 제목·간단한 범례·생성 정보를 곁들인다.
- UI 텍스트는 한국어(프로젝트 규칙).

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ccwork 아키텍처</title>
<style>
  :root { color-scheme: light; }
  body { font-family: 'Pretendard Variable', system-ui, sans-serif; margin: 0;
         background: hsl(0 0% 94%); color: hsl(220 35% 14%); line-height: 1.6; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
  h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
  .meta { color: hsl(0 0% 42%); font-size: 0.85rem; margin-bottom: 2rem; }
  section { background: #fff; border: 1px solid hsl(0 0% 88%); border-radius: 1rem;
            padding: 1.5rem 1.75rem; margin-bottom: 1.75rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  h2 { font-size: 1.15rem; margin: 0 0 0.75rem; }
  .legend { font-size: 0.8rem; color: hsl(0 0% 42%); margin-bottom: 1rem; }
  .mermaid { display: flex; justify-content: center; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>📐 ccwork 아키텍처</h1>
    <p class="meta">React 19 + TS 노트 앱 · src/ 분석 기준 · 생성일 __DATE__</p>

    <section>
      <h2>1. 컴포넌트·모듈 의존성</h2>
      <p class="legend">화살표 A → B = "A가 B를 import/사용". 색은 레이어 구분.</p>
      <pre class="mermaid">
__DEPENDENCY_GRAPH__
      </pre>
    </section>

    <section>
      <h2>2. 상태 흐름</h2>
      <p class="legend">실선 = 데이터·호출 흐름, 점선 = props/이벤트 전달.</p>
      <pre class="mermaid">
__STATE_FLOW__
      </pre>
    </section>
  </div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default', flowchart: { curve: 'basis' } });
  </script>
</body>
</html>
```

`__DATE__`는 시스템의 현재 날짜로, `__DEPENDENCY_GRAPH__`/`__STATE_FLOW__`는 실제 분석한
Mermaid 정의로 치환한다.

### 4. 브라우저로 열기
- macOS: `open docs/architecture/index.html`
- 폴백(다른 OS): Linux `xdg-open`, Windows `start`.
- 연 다음, 생성한 다이어그램에 어떤 노드/흐름이 담겼는지 1~2줄로 요약해 보고한다.

## 색상 컨벤션 (classDef 예시)

```
classDef entry fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b;
classDef comp  fill:#dbeafe,stroke:#3b82f6,color:#0c2d6b;
classDef ctx   fill:#dcfce7,stroke:#22c55e,color:#14532d;
classDef api   fill:#ffedd5,stroke:#f97316,color:#7c2d12;
classDef types fill:#f1f5f9,stroke:#94a3b8,color:#334155;
classDef ext   fill:#fef9c3,stroke:#eab308,color:#713f12,stroke-dasharray:4 3;
```

레이어가 늘면 색을 추가하되, 한 다이어그램에 너무 많은 색을 쓰지 말고 의미 단위로만 구분한다.
