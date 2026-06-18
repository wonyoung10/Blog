import { NextRequest } from "next/server";
import { corsJson, corsPreflight } from "@/lib/cors";
import { getPublicPostBySlug } from "@/lib/posts";

// 메인 사이트 상세 페이지용 — slug 로 공개 글 하나의 전체 내용을 내보낸다.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    return corsJson({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  return corsJson({
    id: post.id,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    contentHtml: post.contentHtml,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt,
    category: post.category ? { name: post.category.name } : null,
    tags: post.tags.map(({ tag }) => ({ id: tag.id, name: tag.name }))
  });
}

export function OPTIONS() {
  return corsPreflight();
}
