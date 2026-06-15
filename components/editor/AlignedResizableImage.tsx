"use client";

// 정렬·캡션·드래그 리사이즈·alt 를 모두 지원하는 이미지 확장.
// 기존 PostEditor 의 인라인 AlignedImage 를 대체한다.
//
// 핵심 제약: 저장되는 renderHTML 출력 구조는 기존과 동일해야 한다.
//   figure.image-figure[data-align][style=margin] > img[data-align][data-caption]( + figcaption.image-caption)
// 읽기 페이지(Lightbox)가 이 구조에 의존하므로 절대 바꾸지 않는다.
// 편집 화면에서만 ReactNodeView 로 드래그 핸들을 띄우고, width 속성만 새로 추가한다.

import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useRef, useState } from "react";

// 정렬값에 따른 figure margin (기존 규칙 유지)
function marginFor(align: string) {
  return align === "center" ? "1rem auto" : align === "right" ? "1rem 0 1rem auto" : "1rem auto 1rem 0";
}

// 편집 화면 전용 NodeView: 이미지 + 우하단 드래그 핸들 + 캡션 미리보기
function ImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, caption, textAlign, width } = node.attrs as {
    src: string;
    alt: string | null;
    caption: string;
    textAlign: string;
    width: string | null;
  };
  const align = textAlign === "center" || textAlign === "right" ? textAlign : "left";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function onResizeStart(event: React.PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const img = wrapperRef.current?.querySelector("img");
    const startWidth = img?.getBoundingClientRect().width ?? 0;
    const containerWidth = wrapperRef.current?.parentElement?.getBoundingClientRect().width ?? startWidth;
    setDragging(true);

    function onMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX;
      // 우하단 핸들: 오른쪽으로 끌면 커짐. 최소 80px, 최대 컨테이너 너비.
      const next = Math.max(80, Math.min(startWidth + delta, containerWidth));
      updateAttributes({ width: `${Math.round(next)}px` });
    }

    function onUp() {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <NodeViewWrapper
      className="image-node"
      style={{ display: "table", margin: marginFor(align), maxWidth: "100%" }}
      data-align={align}
    >
      <div
        ref={wrapperRef}
        className={`image-node-frame${selected ? " is-selected" : ""}${dragging ? " is-dragging" : ""}`}
        style={{ width: width ?? "auto", maxWidth: "100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} draggable={false} style={{ width: "100%", display: "block" }} />
        {/* 우하단 드래그 핸들 (선택 시 노출) */}
        <span
          className="image-resize-handle"
          onPointerDown={onResizeStart}
          contentEditable={false}
          aria-hidden="true"
        />
      </div>
      {caption ? <figcaption className="image-caption">{caption}</figcaption> : null}
    </NodeViewWrapper>
  );
}

export const AlignedResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: "left",
        parseHTML: (element) =>
          element.getAttribute("data-align") || element.closest("figure")?.getAttribute("data-align") || "left",
        renderHTML: () => ({})
      },
      caption: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-caption") ||
          element.closest("figure")?.querySelector("figcaption")?.textContent ||
          "",
        renderHTML: () => ({})
      },
      width: {
        default: null,
        // img 의 width(px/%) 또는 인라인 style 의 width 에서 복원
        parseHTML: (element) => {
          const attr = element.getAttribute("width");
          if (attr) return /^\d+$/.test(attr) ? `${attr}px` : attr;
          const styleWidth = (element as HTMLElement).style?.width;
          return styleWidth || null;
        },
        renderHTML: () => ({})
      }
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },

  renderHTML({ HTMLAttributes, node }) {
    const align = node.attrs.textAlign === "center" || node.attrs.textAlign === "right" ? node.attrs.textAlign : "left";
    const caption = (node.attrs.caption as string) ?? "";
    const width = (node.attrs.width as string | null) ?? null;
    const margin = marginFor(align);

    const imgAttrs = { ...HTMLAttributes };
    delete imgAttrs.textAlign;
    delete imgAttrs.caption;
    delete imgAttrs.width;

    const imgStyle = width ? `width:${width};max-width:100%;` : "max-width:100%;";
    const img = ["img", mergeAttributes(imgAttrs, { "data-align": align, "data-caption": caption, style: imgStyle })];
    // figure 너비를 이미지에 맞춰 캡션이 이미지 폭을 따르도록 width 를 figure 에도 반영
    const figureWidth = width ? `width:${width};` : "";
    const figureAttrs = {
      "data-align": align,
      class: "image-figure",
      style: `display:table;margin:${margin};max-width:100%;${figureWidth}`
    };

    if (!caption) {
      return ["figure", figureAttrs, img];
    }
    return ["figure", figureAttrs, img, ["figcaption", { class: "image-caption" }, caption]];
  }
});
