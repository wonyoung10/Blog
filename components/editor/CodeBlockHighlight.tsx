"use client";

// 코드블록 문법 강조 + 언어 선택 확장
// @tiptap/extension-code-block-lowlight 위에 ReactNodeView를 얹어
// 코드블록 우상단에 언어 선택 <select>를 띄운다.
// (lowlight / highlight.js / @tiptap/extension-code-block-lowlight 는 메인이 설치)

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps
} from "@tiptap/react";
import { createLowlight } from "lowlight";

// 자주 쓰는 언어 등록 (highlight.js 개별 언어 import)
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import yaml from "highlight.js/lib/languages/yaml";

// lowlight 인스턴스를 만들고 언어를 등록한다.
const lowlight = createLowlight();

lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
// jsx 는 javascript, tsx 는 typescript 문법으로 매핑(별도 패키지 없이 처리)
lowlight.register("jsx", javascript);
lowlight.register("tsx", typescript);
lowlight.register("python", python);
lowlight.register("bash", bash);
// shell 은 bash 와 동일하게 취급
lowlight.register("shell", bash);
lowlight.register("json", json);
lowlight.register("css", css);
lowlight.register("xml", xml);
// html 은 xml 하이라이터를 공유
lowlight.register("html", xml);
lowlight.register("sql", sql);
lowlight.register("markdown", markdown);
lowlight.register("java", java);
lowlight.register("c", c);
lowlight.register("cpp", cpp);
lowlight.register("go", go);
lowlight.register("rust", rust);
lowlight.register("yaml", yaml);

// 선택 목록에 노출할 언어 (value: lowlight 등록명, label: 표시명)
const LANGUAGES: { value: string; label: string }[] = [
  { value: "plaintext", label: "Plain" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "json", label: "JSON" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "xml", label: "XML" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "yaml", label: "YAML" }
];

// 코드블록 우상단에 언어 선택 셀렉트를 붙이는 NodeView
function CodeBlockView({ node, updateAttributes, extension }: NodeViewProps) {
  const current = (node.attrs.language as string | null) ?? "plaintext";

  return (
    <NodeViewWrapper className="code-block-node" as="div">
      <select
        className="code-block-lang"
        contentEditable={false}
        // 셀렉트가 코드 영역에 포커스를 빼앗기지 않도록 mousedown 기본동작 차단
        onMouseDown={(event) => event.stopPropagation()}
        value={current}
        onChange={(event) => updateAttributes({ language: event.target.value })}
      >
        {/* extension 옵션에 없는 언어가 들어와도 깨지지 않도록 기본 목록을 사용 */}
        {(extension?.options?.languages ?? LANGUAGES).map((lang: { value: string; label: string }) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

// 설정이 완료된 코드블록 확장
// 주의: StarterKit 의 기본 codeBlock 과 충돌하므로 StarterKit.configure({ codeBlock: false }) 필요.
export const CodeBlockHighlight = CodeBlockLowlight.extend({
  // 셀렉트 목록을 NodeView 에서 참조할 수 있도록 옵션으로 노출
  addOptions() {
    return {
      ...this.parent?.(),
      languages: LANGUAGES
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  }
}).configure({
  lowlight,
  defaultLanguage: "plaintext"
});
