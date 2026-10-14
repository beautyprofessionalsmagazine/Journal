import type { TiptapNode } from "@/features/articles/types/article";

export type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * The page's single <h1> is the article title, so a heading inside the body is
 * never allowed to be one. A stored level-1 heading (legacy content) becomes an
 * <h2>; its look is unchanged because styling is chosen from the authored level.
 */
export function getHeadingTag(level: number): HeadingTag {
  switch (level) {
    case 3:
      return "h3";
    case 4:
      return "h4";
    case 5:
      return "h5";
    case 6:
      return "h6";
    default:
      return "h2";
  }
}

export function getHeadingLevel(node: TiptapNode): number {
  const level = node.attrs?.level;

  return typeof level === "number" && level >= 1 && level <= 6 ? level : 2;
}

/**
 * Keeps the document outline valid when an article opens its sections with
 * level-3 headings: every `h3` that appears before the first `h2` is rendered
 * as an `h2`, so the outline never skips a level (h1 -> h3). Only the HTML tag
 * changes; the visual style still follows the authored level, so nothing looks
 * different.
 *
 * Returns the tag to use for the top-level node at each index that needs one.
 */
export function getHeadingTagOverrides(
  nodes: readonly TiptapNode[],
): Map<number, HeadingTag> {
  const overrides = new Map<number, HeadingTag>();
  let sawSectionHeading = false;

  nodes.forEach((node, index) => {
    if (node.type !== "heading") {
      return;
    }

    const level = getHeadingLevel(node);

    if (level <= 2) {
      sawSectionHeading = true;
      return;
    }

    if (level === 3 && !sawSectionHeading) {
      overrides.set(index, "h2");
    }
  });

  return overrides;
}
