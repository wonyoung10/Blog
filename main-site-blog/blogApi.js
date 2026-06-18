// 블로그(Next.js) 공개 API 호출 헬퍼.
// .env 에 블로그 배포 주소를 넣어두고 쓴다:
//   VITE_BLOG_API_URL=https://블로그주소.vercel.app
const BASE = import.meta.env.VITE_BLOG_API_URL;

if (!BASE) {
  console.warn("[blogApi] VITE_BLOG_API_URL 환경변수가 없습니다. .env 를 확인하세요.");
}

// 공개 글 목록. q 를 주면 제목/부제/요약 검색.
export async function fetchPosts(q) {
  const url = new URL(`${BASE}/api/public/posts`);
  if (q) url.searchParams.set("q", q);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`목록을 불러오지 못했습니다 (${res.status})`);
  return res.json();
}

// slug 로 글 하나 전체 내용.
export async function fetchPost(slug) {
  const res = await fetch(`${BASE}/api/public/posts/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`글을 불러오지 못했습니다 (${res.status})`);
  return res.json();
}
