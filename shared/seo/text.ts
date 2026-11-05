/** Longest meta description worth emitting; search engines truncate beyond it. */
export const META_DESCRIPTION_MAX = 160;

/**
 * A page <title> plus the " | Brand" template should stay below this to avoid
 * mid-brand truncation in search results.
 */
export const TITLE_WITH_BRAND_MAX = 65;

export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Words that end in a period without ending a sentence. */
const ABBREVIATION = /^(?:[A-Za-z]|dr|mr|mrs|ms|prof|st|vs|etc|inc|ltd|co|no|e\.g|i\.e|u\.s)$/i;

/**
 * The index just after the last complete sentence in `text`, or -1. A period
 * only counts when whitespace follows it inside `text` and the word before it
 * is not an abbreviation or an initial.
 */
function lastSentenceEnd(text: string): number {
  let end = -1;

  for (const match of text.matchAll(/[.!?]["')\]’”]*(?=\s)/g)) {
    const before = text.slice(0, match.index).match(/(\S+)$/)?.[1] ?? "";

    if (match[0].startsWith(".") && ABBREVIATION.test(before)) {
      continue;
    }

    end = match.index + match[0].length;
  }

  return end;
}

/**
 * Shortens text to at most `maxLength` characters. It prefers to stop after a
 * complete sentence (so a search snippet reads as finished prose) and otherwise
 * cuts on a word boundary and ends in an ellipsis. Whitespace, including the
 * stray line breaks editors paste into descriptions, is collapsed first.
 */
export function clampText(text: string, maxLength = META_DESCRIPTION_MAX): string {
  const collapsed = collapseWhitespace(text);

  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  // Looking one character past the limit lets a sentence that ends exactly at
  // the limit count, because whitespace follows it.
  const sentenceEnd = lastSentenceEnd(collapsed.slice(0, maxLength + 1));

  if (sentenceEnd >= maxLength * 0.55 && sentenceEnd <= maxLength) {
    return collapsed.slice(0, sentenceEnd);
  }

  const budget = maxLength - 1;
  const slice = collapsed.slice(0, budget);
  const lastSpace = slice.lastIndexOf(" ");
  // Only back up to a word boundary when that keeps most of the budget;
  // otherwise a single very long token would collapse the text to nothing.
  const cut = lastSpace > budget * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.replace(/[\s,;:.–—-]+$/u, "")}…`;
}

/**
 * Article bylines in the database read like "By Jane Doe | ISSN 3144-0541":
 * the publication's ISSN is appended to the author field, and some editors
 * type a leading "By". Structured data wants only the person's name.
 */
export function getAuthorName(rawAuthor: string | null | undefined): string {
  if (!rawAuthor) {
    return "";
  }

  const beforeSeparator = rawAuthor.split("|")[0] ?? "";
  const withoutIssn = beforeSeparator.replace(
    /\bISSN\s*:?\s*\d{4}-\d{3}[\dXx]\b/gi,
    "",
  );

  return collapseWhitespace(withoutIssn.replace(/^\s*by\s+/i, ""));
}

/** Whether `<title>` should carry the brand suffix, or stand alone. */
export function fitsBrandTemplate(title: string, brandName: string): boolean {
  return `${title} | ${brandName}`.length <= TITLE_WITH_BRAND_MAX;
}
