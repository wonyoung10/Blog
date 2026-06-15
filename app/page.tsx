import { PostCard } from "@/components/PostCard";
import { SearchBox } from "@/components/SearchBox";
import { Shell } from "@/components/Shell";
import { getPublicPosts } from "@/lib/posts";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const posts = await getPublicPosts(q);

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="grid gap-8 border-b border-[#e5ded2] pb-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-rust">Published journal</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-ink md:text-6xl">
              생각을 쓰고, 다듬고, 바로 공개하는 블로그.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#53606d]">
              관리자에서 작성한 글이 이곳에 공개됩니다. 검색, 카테고리, 태그, 대표 이미지를 갖춘 작고 단단한 글쓰기 공간입니다.
            </p>
          </div>
          <div className="rounded-md border border-[#e1d7c8] bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-[#53606d]">공개 글 검색</p>
            <div className="mt-3">
              <SearchBox placeholder="제목, 부제목, 요약 검색" />
            </div>
          </div>
        </section>

        <section className="py-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-md border border-dashed border-[#d7cec0] bg-white p-10 text-center text-[#53606d]">
              아직 공개된 글이 없습니다.
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}
