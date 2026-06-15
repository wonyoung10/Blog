export type TocItem = { level: number; id: string; text: string };

/**
 * 제목 텍스트를 안정적인 slug id로 변환한다.
 * - 소문자화, 공백 → "-", 특수문자 제거
 * - 한글 등 비ASCII 문자는 유지 (URL 사용 시 encodeURIComponent로 안전)
 */
function slugifyHeading(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    // 영문/숫자/한글/공백/하이픈만 남긴다 (그 외 특수문자 제거)
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized;
}

/**
 * HTML 조각에서 내부 태그를 제거하고 엔티티를 디코드해 순수 텍스트를 추출한다.
 */
function stripTags(inner: string): string {
  return inner
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * contentHtml의 각 h1/h2/h3에 안정적인 slug id를 부여하고,
 * id가 박힌 html과 목차 트리를 반환한다.
 *
 * - 기존 태그 속성은 보존한다.
 * - 이미 id가 있는 heading은 그대로 두되 목차에는 포함한다.
 * - slug 중복 시 -2, -3 … 접미사를 붙여 유일성을 보장한다.
 */
export function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  if (!html) {
    return { html: html ?? "", toc: [] };
  }

  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const ensureUniqueId = (base: string): string => {
    const candidate = base || "section";
    if (!usedIds.has(candidate)) {
      usedIds.add(candidate);
      return candidate;
    }
    let counter = 2;
    let next = `${candidate}-${counter}`;
    while (usedIds.has(next)) {
      counter += 1;
      next = `${candidate}-${counter}`;
    }
    usedIds.add(next);
    return next;
  };

  // <h1>...</h1>, <h2>...</h2>, <h3>...</h3> 매칭 (속성 포함, 대소문자 무시)
  const headingRegex = /<h([1-3])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi;

  const newHtml = html.replace(
    headingRegex,
    (match, levelStr: string, attrs: string, inner: string) => {
      const level = Number(levelStr);
      const text = stripTags(inner);

      // 기존 id 속성이 있으면 보존하고 목차에 반영
      const existingIdMatch = attrs.match(/\sid\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      let id: string;
      let nextAttrs = attrs;

      if (existingIdMatch) {
        const existingId = (existingIdMatch[2] ?? existingIdMatch[3] ?? existingIdMatch[4] ?? "").trim();
        id = ensureUniqueId(existingId || slugifyHeading(text));
        if (id !== existingId) {
          // 충돌로 변경된 경우 속성을 새 id로 교체
          nextAttrs = attrs.replace(existingIdMatch[0], ` id="${id}"`);
        }
      } else {
        id = ensureUniqueId(slugifyHeading(text));
        nextAttrs = `${attrs} id="${id}"`;
      }

      toc.push({ level, id, text });

      return `<h${level}${nextAttrs}>${inner}</h${level}>`;
    }
  );

  return { html: newHtml, toc };
}
