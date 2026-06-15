import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Lightbox } from "@/components/Lightbox";
import { CodeHighlight } from "@/components/CodeHighlight";
import { TableOfContents } from "@/components/TableOfContents";
import { getPublicPostBySlug } from "@/lib/posts";
import { addHeadingIds } from "@/lib/toc";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.subtitle || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || post.subtitle || undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined
    }
  };
}

export default async function PostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { html: contentHtml, toc } = addHeadingIds(post.contentHtml);

  return (
    <Shell>
      <article className="mx-auto max-w-4xl px-5 py-10">
        <Link href="/" className="text-sm font-bold text-moss hover:text-rust">
          ← 목록으로
        </Link>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt="" className="mt-7 aspect-[16/8] w-full rounded-md object-cover" />
        )}
        <header className="mt-8 border-b border-[#e5ded2] pb-8">
          <div className="flex flex-wrap gap-2 text-sm font-bold text-rust">
            {post.category?.name && <span>{post.category.name}</span>}
            {post.tags.map(({ tag }) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </div>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-6xl">{post.title}</h1>
          {post.subtitle && <p className="mt-4 text-xl leading-8 text-[#53606d]">{post.subtitle}</p>}
        </header>
        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
          <div className="prose-blog min-w-0" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          <aside className="hidden lg:block">
            <TableOfContents toc={toc} />
          </aside>
        </div>
      </article>
      <Lightbox />
      <CodeHighlight />
    </Shell>
  );
}
