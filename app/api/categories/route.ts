import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as { name?: string };
  const name = data.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "카테고리 이름을 입력하세요." }, { status: 400 });
  }

  const category = await prisma.category.upsert({
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

  return NextResponse.json(category);
}
