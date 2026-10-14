import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getHeadingTag,
  getHeadingTagOverrides,
} from "@/features/articles/lib/article-headings";
import type { TiptapNode } from "@/features/articles/types/article";

const heading = (level: number): TiptapNode => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text: `h${level}` }],
});
const paragraph: TiptapNode = { type: "paragraph", content: [{ type: "text", text: "p" }] };

describe("getHeadingTag", () => {
  it("never renders a second <h1> inside an article body", () => {
    assert.equal(getHeadingTag(1), "h2");
  });

  it("maps the editor's levels straight through", () => {
    assert.equal(getHeadingTag(2), "h2");
    assert.equal(getHeadingTag(3), "h3");
    assert.equal(getHeadingTag(6), "h6");
  });
});

describe("getHeadingTagOverrides", () => {
  it("promotes h3 sections that open the article so the outline never skips a level", () => {
    const overrides = getHeadingTagOverrides([heading(3), paragraph, heading(3), paragraph]);

    assert.deepEqual([...overrides.entries()], [
      [0, "h2"],
      [2, "h2"],
    ]);
  });

  it("stops promoting once a real h2 has appeared", () => {
    const overrides = getHeadingTagOverrides([heading(3), heading(2), heading(3)]);

    assert.deepEqual([...overrides.entries()], [[0, "h2"]]);
  });

  it("leaves a well-formed outline alone", () => {
    assert.equal(getHeadingTagOverrides([heading(2), heading(3), heading(3), heading(2)]).size, 0);
  });

  it("ignores documents without headings", () => {
    assert.equal(getHeadingTagOverrides([paragraph, paragraph]).size, 0);
  });
});
