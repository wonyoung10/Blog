import { NextRequest } from "next/server";
import { corsJson, corsPreflight } from "@/lib/cors";
import { getPublicPosts } from "@/lib/posts";

// 메인 사이트 목록 페이지용 — 공개+발행된 글만, 카드에 필요한 요약 필드만 내보낸다.
// (본문 contentHtml 은 상세 API에서만 제공해 응답을 가볍게 유지)
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const posts = await getPublicPosts(query);

  const summary = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    publishedAt: post.publishedAt,
    category: post.category ? { name: post.category.name } : null,
    tags: post.tags.map(({ tag }) => ({ id: tag.id, name: tag.name }))
  }));

  return corsJson(summary);
}

export function OPTIONS() {
  return corsPreflight();
}
