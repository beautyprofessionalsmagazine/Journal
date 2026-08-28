import Image from "@tiptap/extension-image";

import {
  normalizeArticleImageAlign,
  type ArticleImageAlign,
} from "@/features/articles/types/article";

/*
 * The official TipTap image node, extended with the one attribute the editorial
 * layout needs: horizontal placement. Everything else (src, alt, title, and the
 * natural width/height we record at upload time) already ships with the
 * extension, so inline images stay plain `{ type: "image", attrs: { … } }`
 * nodes inside the existing contentJson.
 *
 * Alignment is stored as `align` and rendered as `data-align` so the editor and
 * the public article can share one CSS contract instead of inline styles.
 *
 * Pixel resize handles are deliberately left off: the extension's built-in
 * resizer writes fixed px width/height, which fights the responsive,
 * never-overflow behaviour the article column requires.
 */
export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center" as ArticleImageAlign,
        parseHTML: (element) =>
          normalizeArticleImageAlign(element.getAttribute("data-align")),
        renderHTML: (attributes) => ({
          "data-align": normalizeArticleImageAlign(attributes.align),
        }),
      },
    };
  },
}).configure({
  allowBase64: false,
  inline: false,
  // Resizing stays disabled; see the note above.
  resize: false,
});
