import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPostCategory, buildPostScalarData, buildPostTags } from "@/lib/post-write";
import { getAllPosts, postInclude, uniqueSlug } from "@/lib/posts";
import { postInputSchema } from "@/lib/validation";

// 메인 사이트에서 /api/posts 를 fetch 할 수 있도록 CORS 허용 오리진 목록.
const ALLOWED_ORIGINS = [
  "https://ieumnaru.co.kr",
  "https://www.ieumnaru.co.kr"
];

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin"
    };
  }
  return {};
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const posts = await getAllPosts(query);

  return NextResponse.json(posts, { headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const parsed = postInputSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." }, { status: 400 });
  }

  const input = parsed.data;
  const slug = await uniqueSlug(input.slug || input.title);
  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

  const post = await prisma.post.create({
    data: {
      ...buildPostScalarData(input, { slug, scheduledAt, publishedAt }),
      category: buildPostCategory(input.categoryName),
      tags: buildPostTags(input.tagNames)
    },
    include: postInclude
  });

  return NextResponse.json(post, { status: 201 });
}
