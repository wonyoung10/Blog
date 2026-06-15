"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

type TableOfContentsProps = {
  toc: TocItem[];
};

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) {
      return;
    }

    const elements = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    // 화면에 보이는 heading 중 가장 위쪽 것을 현재 섹션으로 표시
    const visible = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry);
          } else {
            visible.delete(entry.target.id);
          }
        }

        if (visible.size > 0) {
          // 문서 순서상 가장 먼저 나오는 보이는 항목 선택
          let topId = "";
          let topPos = Infinity;
          for (const [id, entry] of visible) {
            const top = entry.boundingClientRect.top;
            if (top < topPos) {
              topPos = top;
              topId = id;
            }
          }
          if (topId) {
            setActiveId(topId);
          }
        }
      },
      {
        // 헤더 높이를 고려해 상단 근처에서 활성화되도록 조정
        rootMargin: "-10% 0px -70% 0px",
        threshold: [0, 1]
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    // 주소창에 앵커 반영 (스크롤 점프 없이)
    if (typeof history !== "undefined" && history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <nav aria-label="목차" className="toc-nav hidden lg:block">
      <div className="sticky top-24">
        <p className="toc-title">목차</p>
        <ul className="toc-list">
          {toc.map((item, index) => (
            <li
              key={`${item.id}-${index}`}
              data-level={item.level}
              className="toc-item"
            >
              <a
                href={`#${encodeURIComponent(item.id)}`}
                onClick={(event) => handleClick(event, item.id)}
                className={`toc-link${activeId === item.id ? " toc-link-active" : ""}`}
                aria-current={activeId === item.id ? "true" : undefined}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
