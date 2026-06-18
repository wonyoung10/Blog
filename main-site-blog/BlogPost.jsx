import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPost } from "./blogApi";
import "./blog.css";

// 메인사이트.com/blog/:slug — 블로그 글 상세
export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  useEffect(() => {
    let alive = true;
    setStatus("loading");

    fetchPost(slug)
      .then((data) => {
        if (!alive) return;
        if (!data) {
          setStatus("notfound");
          return;
        }
        setPost(data);
        setStatus("ready");
        // 간단한 탭 제목 갱신 (SEO 보조)
        document.title = data.seoTitle || data.title;
      })
      .catch(() => alive && setStatus("error"));

    return () => {
      alive = false;
    };
  }, [slug]);

  if (status === "loading") return <main className="blog-wrap"><p className="blog-muted">불러오는 중…</p></main>;
  if (status === "notfound") return <main className="blog-wrap"><p className="blog-muted">글을 찾을 수 없습니다.</p></main>;
  if (status === "error") return <main className="blog-wrap"><p className="blog-muted">글을 불러오지 못했습니다.</p></main>;

  return (
    <main className="blog-wrap">
      <article className="blog-article">
        <Link to="/blog" className="blog-back">← 목록으로</Link>

        {post.coverImageUrl && (
          <img className="blog-article-cover" src={post.coverImageUrl} alt="" />
        )}

        <header className="blog-article-head">
          <div className="blog-card-meta">
            {post.category?.name && <span>{post.category.name}</span>}
            {post.tags.map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </div>
          <h1 className="blog-article-title">{post.title}</h1>
          {post.subtitle && <p className="blog-article-sub">{post.subtitle}</p>}
        </header>

        {/* contentHtml 은 블로그에서 정제해 만든 HTML — 그대로 렌더 */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
