import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countWords, getTiptapPlainText } from "@/features/articles/lib/article-text";

describe("getTiptapPlainText", () => {
  it("joins blocks with spaces so neighbouring paragraphs never fuse", () => {
    const text = getTiptapPlainText({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "End." }] },
        { type: "paragraph", content: [{ type: "text", text: "Start." }] },
      ],
    });

    assert.equal(text, "End. Start.");
  });

  it("flattens marks, lists, headings and hard breaks", () => {
    const text = getTiptapPlainText({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
            { type: "hardBreak" },
            { type: "text", text: "next" },
          ],
        },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "one" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "two" }] }] },
          ],
        },
      ],
    });

    assert.equal(text, "Title bold next one two");
  });

  it("ignores images and tolerates malformed input", () => {
    assert.equal(
      getTiptapPlainText({ type: "doc", content: [{ type: "image", attrs: { src: "https://x/y.png" } }] }),
      "",
    );
    assert.equal(getTiptapPlainText(null), "");
    assert.equal(getTiptapPlainText("not a doc"), "");
    assert.equal(getTiptapPlainText({ type: "doc", content: [null, 3, "x"] }), "");
  });
});

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    assert.equal(countWords("one two  three\nfour"), 4);
  });

  it("counts nothing for empty text", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   "), 0);
  });
});
