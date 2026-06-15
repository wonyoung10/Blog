/**
 * 본문 평문에서 앞부분을 잘라 요약을 만든다.
 * - 연속 공백/개행을 단일 공백으로 정규화
 * - max 이내에서 문장 경계(. ! ? 。 ! ?)를 우선, 없으면 단어 경계로 자른다
 * - 잘렸을 때만 말줄임(…)을 붙인다
 * 순수 함수.
 */
export function buildExcerpt(plainText: string, max = 160): string {
  const normalized = (plainText ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  const window = normalized.slice(0, max);

  // 문장 경계 우선
  const sentenceMatch = window.match(/^[\s\S]*[.!?。！？]/);
  if (sentenceMatch && sentenceMatch[0].trim().length >= max * 0.5) {
    return sentenceMatch[0].trim();
  }

  // 단어 경계로 후퇴
  const lastSpace = window.lastIndexOf(" ");
  const sliced = lastSpace > max * 0.5 ? window.slice(0, lastSpace) : window;

  return `${sliced.trim()}…`;
}
