import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "./blogApi";
import "./blog.css";

// 메인사이트.com/blog — 블로그 글 목록
export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let alive = true;
    setStatus("loading");

    fetchPosts(query)
      .then((data) => {
        if (!alive) return;
        setPosts(data);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));

    return () => {
      alive = false;
    };
  }, [query]);

  return (
    <main className="blog-wrap">
      <header className="blog-head">
        <h1>블로그</h1>
        <input
          className="blog-search"
          type="search"
          placeholder="제목, 부제목, 요약 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {status === "loading" && <p className="blog-muted">불러오는 중…</p>}
      {status === "error" && <p className="blog-muted">글을 불러오지 못했습니다.</p>}
      {status === "ready" && posts.length === 0 && (
        <p className="blog-muted">아직 공개된 글이 없습니다.</p>
      )}

      <ul className="blog-list">
        {posts.map((post) => (
          <li key={post.id} className="blog-card">
            <Link to={`/blog/${post.slug}`} className="blog-card-link">
              {post.coverImageUrl && (
                <img className="blog-card-cover" src={post.coverImageUrl} alt="" />
              )}
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  {post.category?.name && <span>{post.category.name}</span>}
                  {post.tags.map((tag) => (
                    <span key={tag.id}>#{tag.name}</span>
                  ))}
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                {post.subtitle && <p className="blog-card-sub">{post.subtitle}</p>}
                {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
