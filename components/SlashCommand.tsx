"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  CheckSquare,
  ChevronRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Info,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table as TableIcon,
  Youtube as YoutubeIcon
} from "lucide-react";
import { SlashMenuList, type SlashItem, type SlashMenuRef } from "./SlashMenuList";

export type SlashCommandOptions = {
  onImage: () => void;
  onYoutube: () => void;
};

type RawItem = {
  title: string;
  subtitle: string;
  keywords: string;
  icon: SlashItem["icon"];
  run: (ctx: { editor: Editor; range: Range; options: SlashCommandOptions }) => void;
};

const rawItems: RawItem[] = [
  {
    title: "제목 1",
    subtitle: "가장 큰 제목",
    keywords: "h1 heading title 제목",
    icon: Heading1,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run()
  },
  {
    title: "제목 2",
    subtitle: "중간 제목",
    keywords: "h2 heading 제목",
    icon: Heading2,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
  },
  {
    title: "제목 3",
    subtitle: "작은 제목",
    keywords: "h3 heading 제목",
    icon: Heading3,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run()
  },
  {
    title: "글머리 목록",
    subtitle: "• 점 목록",
    keywords: "bullet list ul 목록",
    icon: List,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run()
  },
  {
    title: "번호 목록",
    subtitle: "1. 번호 목록",
    keywords: "ordered list ol number 번호 목록",
    icon: ListOrdered,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run()
  },
  {
    title: "인용구",
    subtitle: "인용 블록",
    keywords: "quote blockquote 인용",
    icon: Quote,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run()
  },
  {
    title: "코드 블록",
    subtitle: "코드 영역",
    keywords: "code codeblock 코드",
    icon: Code,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
  },
  {
    title: "체크리스트",
    subtitle: "할 일 목록",
    keywords: "todo task checklist checkbox 체크 할일 할 일",
    icon: CheckSquare,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run()
  },
  {
    title: "콜아웃",
    subtitle: "정보 강조 박스",
    keywords: "callout note info 콜아웃 정보 강조 박스",
    icon: Info,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCallout({ variant: "info" }).run()
  },
  {
    title: "토글",
    subtitle: "접고 펼치는 블록",
    keywords: "toggle details fold collapse 토글 접기",
    icon: ChevronRight,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setToggle().run()
  },
  {
    title: "구분선",
    subtitle: "가로 구분선",
    keywords: "divider hr rule 구분선",
    icon: Minus,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run()
  },
  {
    title: "표",
    subtitle: "3×3 표 삽입",
    keywords: "table 표",
    icon: TableIcon,
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  },
  {
    title: "이미지",
    subtitle: "사진 업로드",
    keywords: "image photo picture 이미지 사진",
    icon: ImagePlus,
    run: ({ editor, range, options }) => {
      editor.chain().focus().deleteRange(range).run();
      options.onImage();
    }
  },
  {
    title: "유튜브",
    subtitle: "동영상 임베드",
    keywords: "youtube video 유튜브 동영상",
    icon: YoutubeIcon,
    run: ({ editor, range, options }) => {
      editor.chain().focus().deleteRange(range).run();
      options.onYoutube();
    }
  }
];

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onImage: () => {},
      onYoutube: () => {}
    };
  },

  addProseMirrorPlugins() {
    const extensionOptions = this.options;

    return [
      Suggestion<RawItem>({
        editor: this.editor,
        char: "/",
        // 빈 줄 또는 공백 뒤에서만 트리거 (URL 등의 슬래시는 무시)
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const before = $from.nodeBefore;
          const textBefore = before?.isText ? before.text ?? "" : "";
          return textBefore === "" || /\s$/.test(textBefore);
        },
        items: ({ query }) => {
          const q = query.toLowerCase().trim();
          if (q === "") return rawItems;
          return rawItems.filter(
            (item) => item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
          );
        },
        command: ({ editor, range, props }) => {
          props.run({ editor, range, options: extensionOptions });
        },
        render: () => {
          let component: ReactRenderer<SlashMenuRef> | null = null;
          let popup: TippyInstance[] | null = null;

          const toItems = (raw: RawItem[], editor: Editor, range: Range): SlashItem[] =>
            raw.map((item) => ({
              title: item.title,
              subtitle: item.subtitle,
              icon: item.icon,
              command: () => item.run({ editor, range, options: extensionOptions })
            }));

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenuList, {
                props: { items: toItems(props.items, props.editor, props.range) },
                editor: props.editor
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start"
              });
            },
            onUpdate: (props) => {
              component?.updateProps({ items: toItems(props.items, props.editor, props.range) });
              if (props.clientRect) {
                popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
              }
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
              popup = null;
              component = null;
            }
          };
        }
      })
    ];
  }
});
