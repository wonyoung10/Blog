import Link from "next/link";
import { PostEditor } from "@/components/PostEditor";

export default function WritePage() {
  return (
    <>
      <div className="border-b border-[#e1d7c8] bg-paper px-5 py-3">
        <Link href="/admin" className="text-sm font-bold text-moss hover:text-rust">
          ← 관리자 목록
        </Link>
      </div>
      <PostEditor />
    </>
  );
}
