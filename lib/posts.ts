import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export const postInclude = {
  category: true,
  tags: {
    include: {
      tag: true
    }
  }
} satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

export async function getPublicPosts(query?: string) {
  const now = new Date();

  return prisma.post.findMany({
    where: {
      visibility: "PUBLIC",
      AND: [
        {
          OR: [
            { status: "PUBLISHED" },
            {
              status: "SCHEDULED",
              scheduledAt: {
                lte: now
              }
            }
          ]
        },
        ...(query
          ? [
              {
                OR: [
                  { title: { contains: query } },
                  { subtitle: { contains: query } },
                  { excerpt: { contains: query } }
                ]
              }
            ]
          : [])
      ]
    },
    include: postInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });
}

export async function getAllPosts(query?: string) {
  return prisma.post.findMany({
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
}

export async function getPublicPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: postInclude
  });

  if (!post || post.visibility !== "PUBLIC") {
    return null;
  }

  if (post.status === "PUBLISHED") {
    return post;
  }

  if (post.status === "SCHEDULED" && post.scheduledAt && post.scheduledAt <= new Date()) {
    return post;
  }

  return null;
}

export async function uniqueSlug(base: string, currentPostId?: string) {
  const root = slugify(base);
  let next = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: next } });
    if (!existing || existing.id === currentPostId) {
      return next;
    }
    next = `${root}-${counter}`;
    counter += 1;
  }
}
