// 콜아웃(정보 박스) 노드
// info / warn / success / danger 4가지 variant 를 가지며
// <div class="callout callout-{variant}" data-variant="{variant}"> 로 렌더한다.
//
// 읽기 페이지는 contentHtml 을 그대로 dangerouslySetInnerHTML 로 렌더하므로
// ReactNodeView 가 아닌 순수 renderHTML / parseHTML 로 구현해 네이티브 마크업만 남긴다.
// variant 별 좌측 아이콘은 CSS ::before 로 처리한다(globals.css 참고).

import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutVariant = "info" | "warn" | "success" | "danger";

const VARIANTS: CalloutVariant[] = ["info", "warn", "success", "danger"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      // 현재 위치를 콜아웃으로 감싼다
      setCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType;
      // 콜아웃 ↔ 일반 블록 토글
      toggleCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",

  group: "block",

  // 문단 등 블록 콘텐츠를 담는다
  content: "block+",

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info" as CalloutVariant,
        parseHTML: (element) => {
          const value = element.getAttribute("data-variant");
          return VARIANTS.includes(value as CalloutVariant) ? value : "info";
        },
        // data-variant 속성으로만 내보내고 class 는 renderHTML 에서 직접 구성
        renderHTML: (attributes) => ({ "data-variant": attributes.variant })
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.callout"
      },
      {
        tag: "div[data-variant]",
        // data-variant 만 있고 callout 클래스가 없는 다른 div 를 잘못 잡지 않도록 확인
        getAttrs: (element) =>
          (element as HTMLElement).classList.contains("callout") ? null : false
      }
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const variant = (node.attrs.variant as CalloutVariant) ?? "info";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: `callout callout-${variant}`,
        "data-variant": variant
      }),
      0
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) =>
          commands.wrapIn(this.name, attributes),
      toggleCallout:
        (attributes) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, attributes)
    };
  }
});
