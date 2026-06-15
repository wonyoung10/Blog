import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/PostEditor";
import { postInclude } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export default async function EditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: postInclude
  });

  if (!post) {
    notFound();
  }

  return (
    <>
      <div className="border-b border-[#e1d7c8] bg-paper px-5 py-3">
        <Link href="/admin" className="text-sm font-bold text-moss hover:text-rust">
          ← 관리자 목록
        </Link>
      </div>
      <PostEditor post={post} />
    </>
  );
}
