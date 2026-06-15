import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postInclude, uniqueSlug } from "@/lib/posts";
import { slugify } from "@/lib/slug";
import { postInputSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const posts = await prisma.post.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query } },
            { subtitle: { contains: query } },
            { slug: { contains: query } }
          ]
        }
      : undefined,
    include: postInclude,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const parsed = postInputSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." }, { status: 400 });
  }

  const input = parsed.data;
  const slug = await uniqueSlug(input.slug || input.title);
  const category = input.categoryName
    ? {
        connectOrCreate: {
          where: { slug: slugify(input.categoryName) },
          create: {
            name: input.categoryName,
            slug: slugify(input.categoryName)
          }
        }
      }
    : undefined;
  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

  const post = await prisma.post.create({
    data: {
      title: input.title,
      subtitle: input.subtitle || null,
      slug,
      contentJson: JSON.stringify(input.contentJson),
      contentHtml: input.contentHtml,
      excerpt: input.excerpt || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      visibility: input.visibility,
      category,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      scheduledAt,
      publishedAt,
      tags: {
        create: input.tagNames.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { slug: slugify(name) },
              create: {
                name,
                slug: slugify(name)
              }
            }
          }
        }))
      }
    },
    include: postInclude
  });

  return NextResponse.json(post, { status: 201 });
}
