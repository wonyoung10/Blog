import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일을 선택하세요." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name) || ".png";
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  const url = `/uploads/${filename}`;
  const media = await prisma.media.create({
    data: {
      url,
      filename: file.name,
      mimeType: file.type,
      size: bytes.length
    }
  });

  return NextResponse.json({ ...media, url });
}
