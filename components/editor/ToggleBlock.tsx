// 토글(접기) 블록
// <details><summary>제목</summary>내용</details> 구조로 렌더/파싱한다.
// 읽기 페이지(contentHtml dangerouslySetInnerHTML)에서 네이티브 details 로 접고 펴지므로
// 순수 renderHTML / parseHTML 로 구현한다.
//
// 두 개의 노드로 구성:
//  - detailsSummary: <summary> (제목 줄, 인라인 텍스트)
//  - toggleBlock(=details): <details>, 첫 자식은 summary, 그 뒤는 본문 블록
// export 는 ToggleBlock 배열로 묶어 한 번에 등록한다.

import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggleBlock: {
      // 비어 있는 토글 블록을 삽입한다
      setToggle: () => ReturnType;
    };
  }
}

// 토글 제목(summary)
const DetailsSummary = Node.create({
  name: "detailsSummary",

  content: "inline*",

  defining: true,

  // 토글 안에서만 의미가 있으므로 단독으로 선택/삭제되지 않게 한다
  selectable: false,

  parseHTML() {
    return [{ tag: "summary" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["summary", mergeAttributes(HTMLAttributes), 0];
  }
});

// 토글 본문 컨테이너(details)
const DetailsNode = Node.create({
  name: "toggleBlock",

  group: "block",

  // 첫 줄은 summary, 그 뒤로 블록 본문
  content: "detailsSummary block+",

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      // 작성 중에는 펼친 상태(open)를 기본값으로 둔다
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute("open"),
        renderHTML: (attributes) => (attributes.open ? { open: "open" } : {})
      }
    };
  },

  parseHTML() {
    return [{ tag: "details" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["details", mergeAttributes(HTMLAttributes, { class: "toggle-block" }), 0];
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { open: true },
              content: [
                {
                  type: "detailsSummary",
                  content: [{ type: "text", text: "토글 제목" }]
                },
                {
                  type: "paragraph"
                }
              ]
            })
            .run()
    };
  }
});

// 메인은 ...ToggleBlock 로 펼쳐 등록한다.
export const ToggleBlock = [DetailsSummary, DetailsNode];
