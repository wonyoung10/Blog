"use client";

// 읽기 페이지의 코드블록을 클라이언트에서 문법 강조한다.
// 에디터는 lowlight 데코레이션으로 강조하지만 저장된 HTML(getHTML)에는 색이 없으므로,
// 발행된 글에서는 이 컴포넌트가 highlight.js 로 다시 칠한다.

import { useEffect } from "react";
import hljs from "highlight.js/lib/core";

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

// 에디터(CodeBlockHighlight)와 동일한 언어 집합을 등록
const REGISTER: Record<string, Parameters<typeof hljs.registerLanguage>[1]> = {
  javascript,
  typescript,
  jsx: javascript,
  tsx: typescript,
  python,
  bash,
  shell: bash,
  json,
  css,
  xml,
  html: xml,
  sql,
  markdown,
  java,
  c,
  cpp,
  go,
  rust,
  yaml
};

let registered = false;
function ensureRegistered() {
  if (registered) return;
  for (const [name, lang] of Object.entries(REGISTER)) {
    hljs.registerLanguage(name, lang);
  }
  registered = true;
}

export function CodeHighlight() {
  useEffect(() => {
    ensureRegistered();
    document.querySelectorAll<HTMLElement>(".prose-blog pre code").forEach((el) => {
      if (el.dataset.highlighted) return;
      hljs.highlightElement(el);
    });
  }, []);

  return null;
}
