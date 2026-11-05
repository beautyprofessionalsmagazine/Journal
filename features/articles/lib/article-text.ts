import { collapseWhitespace } from "@/shared/seo/text";

const BLOCK_NODE_TYPES = new Set([
  "paragraph",
  "heading",
  "listItem",
  "blockquote",
  "bulletList",
  "orderedList",
  "horizontalRule",
]);

type TextNode = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
  attrs?: unknown;
};

export type TiptapImageData = {
  src: string;
  alt: string;
};

function collectText(node: unknown, parts: string[]) {
  if (!node || typeof node !== "object") {
    return;
  }

  const { type, text, content } = node as TextNode;

  if (type === "text" && typeof text === "string") {
    parts.push(text);
    return;
  }

  if (type === "hardBreak") {
    parts.push(" ");
    return;
  }

  if (Array.isArray(content)) {
    for (const child of content) {
      collectText(child, parts);
    }
  }

  // Keep neighbouring blocks from fusing into one word ("end.Start").
  if (typeof type === "string" && BLOCK_NODE_TYPES.has(type)) {
    parts.push(" ");
  }
}

/**
 * Flattens a TipTap document to plain text. Used for the word count in
 * structured data and as the description fallback when an article has none.
 */
export function getTiptapPlainText(document: unknown): string {
  const parts: string[] = [];

  collectText(document, parts);

  return collapseWhitespace(parts.join(""));
}

export function countWords(text: string): number {
  const trimmed = text.trim();

  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function collectImages(node: unknown, images: TiptapImageData[]) {
  if (!node || typeof node !== "object") {
    return;
  }

  const { type, content, attrs } = node as TextNode;

  if (type === "image" && attrs && typeof attrs === "object") {
    const imageAttrs = attrs as { src?: unknown; alt?: unknown };
    const src = typeof imageAttrs.src === "string" ? imageAttrs.src.trim() : "";

    if (src) {
      images.push({
        src,
        alt: typeof imageAttrs.alt === "string" ? imageAttrs.alt.trim() : "",
      });
    }
  }

  if (Array.isArray(content)) {
    for (const child of content) {
      collectImages(child, images);
    }
  }
}

/** Finds every stored inline image, including images nested in rich-text blocks. */
export function getTiptapImages(document: unknown): TiptapImageData[] {
  const images: TiptapImageData[] = [];
  collectImages(document, images);
  return images;
}

/** Unique inline image URLs for the article's image sitemap entry. */
export function getTiptapImageUrls(document: unknown): string[] {
  return [...new Set(getTiptapImages(document).map((image) => image.src))];
}
