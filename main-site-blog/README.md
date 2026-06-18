# 메인 사이트 블로그 연동 (Vite + React)

이 폴더의 파일들을 **메인 사이트 repo** 의 `src/` 안으로 복사해서 쓰세요.
글 데이터는 이 블로그(Next.js)의 공개 API에서 가져오고, 화면은 메인 사이트 도메인에서 그려집니다.

```
[블로그 = 글쓰기 + API]  ──fetch──▶  [메인사이트.com/blog = 화면 표시]
```

## 파일

| 파일 | 역할 |
|------|------|
| `blogApi.js` | 블로그 공개 API 호출 (목록/상세) |
| `BlogList.jsx` | `메인사이트.com/blog` — 글 목록 |
| `BlogPost.jsx` | `메인사이트.com/blog/:slug` — 글 상세 |
| `blog.css` | 최소 스타일 (자유롭게 수정) |

## 설치 1 — 의존성

react-router-dom 이 없다면:

```bash
npm install react-router-dom
```

## 설치 2 — 환경변수

메인 사이트 repo 의 `.env` 에 블로그 배포 주소를 추가:

```
VITE_BLOG_API_URL=https://블로그주소.vercel.app
```

> 로컬 개발 중이면 `VITE_BLOG_API_URL=http://localhost:3000` 로 두면 됩니다.
> (Vite 환경변수는 반드시 `VITE_` 로 시작해야 코드에서 읽힙니다.)

## 설치 3 — 라우트 등록

메인 사이트의 라우터에 두 경로를 추가하세요. 예 (`App.jsx`):

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BlogList from "./BlogList";
import BlogPost from "./BlogPost";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ...기존 메인 사이트 라우트들... */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </BrowserRouter>
  );
}
```

이미 `<BrowserRouter>` 가 있다면 `<Route>` 두 줄만 추가하면 됩니다.

## 동작 확인

1. 이 블로그를 먼저 배포(또는 `npm run dev` 로 로컬 실행)
2. 블로그 관리자에서 글을 **공개(PUBLISHED)** 상태로 작성
3. 메인 사이트에서 `/blog` 접속 → 글 목록, 클릭 → 상세

## 참고 / 주의

- **공개+발행된 글만** 나옵니다. 임시저장/비공개 글은 API에 노출되지 않습니다.
- `contentHtml` 은 블로그에서 정제한 HTML이라 `dangerouslySetInnerHTML` 로 렌더합니다.
  외부 사용자가 쓰는 글이 아니라 **본인이 관리자에서 쓰는 글**이므로 안전합니다.
- **SEO 한계**: Vite React 는 브라우저에서 렌더(CSR)라 검색 노출이 SSR보다 약합니다.
  신뢰도가 핵심 목표라면 추후 메인 사이트를 SSR(예: 메인도 Next.js, 또는 prerender)로
  올리는 걸 고려하세요. 지금 구조로도 동작/링크 공유는 문제없습니다.
```
