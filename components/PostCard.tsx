import Link from "next/link";
import { PostWithRelations } from "@/lib/posts";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

export function PostCard({ post }: { post: PostWithRelations }) {
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="grid gap-4 border-b border-[#e4dbce] py-8 md:grid-cols-[220px_1fr]">
      <Link
        href={`/posts/${post.slug}`}
        className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-md bg-[#e9e2d6]"
      >
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-[#7d7469]">No image</span>
        )}
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-rust">
          {post.category?.name && <span>{post.category.name}</span>}
          <span>{dateFormatter.format(date)}</span>
        </div>
        <h2 className="mt-2 text-2xl font-black leading-tight text-ink">
          <Link href={`/posts/${post.slug}`} className="hover:text-moss">
            {post.title}
          </Link>
        </h2>
        {post.subtitle && <p className="mt-2 text-base text-[#53606d]">{post.subtitle}</p>}
        {post.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#53606d]">{post.excerpt}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <span key={tag.id} className="rounded bg-[#e7efe5] px-2 py-1 text-xs font-semibold text-moss">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
