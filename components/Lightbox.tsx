"use client";

import { useEffect, useState } from "react";

type Active = { src: string; caption: string } | null;

// 읽기 페이지의 본문 이미지를 클릭하면 전체 화면으로 확대해 보여준다.
export function Lightbox() {
  const [active, setActive] = useState<Active>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const img = target.closest<HTMLImageElement>(".prose-blog img");
      if (!img) return;
      event.preventDefault();
      const figcaption = img.closest("figure")?.querySelector("figcaption");
      setActive({ src: img.currentSrc || img.src, caption: figcaption?.textContent ?? "" });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="lightbox-overlay" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
      <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active.src} alt={active.caption} className="lightbox-img" />
        {active.caption && <figcaption className="lightbox-caption">{active.caption}</figcaption>}
      </figure>
      <button type="button" className="lightbox-close" aria-label="닫기" onClick={() => setActive(null)}>
        ✕
      </button>
    </div>
  );
}
