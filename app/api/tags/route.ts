import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: "asc"
    }
  });

  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as { name?: string };
  const name = data.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "태그 이름을 입력하세요." }, { status: 400 });
  }

  const tag = await prisma.tag.upsert({
    where: {
      slug: slugify(name)
    },
    update: {
      name
    },
    create: {
      name,
      slug: slugify(name)
    }
  });

  return NextResponse.json(tag);
}
