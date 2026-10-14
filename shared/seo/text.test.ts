import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  META_DESCRIPTION_MAX,
  clampText,
  collapseWhitespace,
  fitsBrandTemplate,
  getAuthorName,
} from "@/shared/seo/text";

describe("clampText", () => {
  it("leaves short text alone and collapses stray whitespace", () => {
    assert.equal(clampText("A short  line\r\nwith a break."), "A short line with a break.");
  });

  it("cuts long text on a word boundary within the limit and ends with an ellipsis", () => {
    const text = "word ".repeat(80).trim();
    const clamped = clampText(text);

    assert.ok(clamped.length <= META_DESCRIPTION_MAX);
    assert.ok(clamped.endsWith("…"));
    assert.ok(!clamped.slice(0, -1).endsWith(" "));
    // Never ends mid-word: the last token before the ellipsis is a whole "word".
    assert.match(clamped, /(^| )word…$/);
  });

  it("still cuts a single very long token instead of returning nothing", () => {
    const clamped = clampText("x".repeat(400), 50);

    assert.equal(clamped.length, 50);
    assert.ok(clamped.endsWith("…"));
  });

  it("prefers to stop after a complete sentence, with no ellipsis", () => {
    const first = "The sterile minimalism and manufactured flawlessness of recent seasons are giving way to something richer, deeper, and more interesting.";
    const clamped = clampText(`${first} Fall 2026 brings four looks that define the season for working professionals everywhere.`);

    assert.equal(clamped, first);
    assert.ok(clamped.length <= META_DESCRIPTION_MAX);
  });

  it("does not treat abbreviations or initials as the end of a sentence", () => {
    const text = `${"A long opening clause that keeps going and going ".repeat(2)}said Dr. Smith about the U.S. market, and the rest of this very long quote keeps running past the limit.`;
    const clamped = clampText(text);

    assert.ok(!/(Dr|U\.S)\.$/.test(clamped), clamped);
    assert.ok(clamped.length <= META_DESCRIPTION_MAX);
  });

  it("ignores a sentence end too early to keep most of the text", () => {
    const clamped = clampText(`Short. ${"filler ".repeat(60)}`);

    assert.ok(clamped.endsWith("…"));
    assert.ok(clamped.length > 100);
  });

  it("does not leave dangling punctuation before the ellipsis", () => {
    const clamped = clampText(`${"alpha ".repeat(20)}beta, gamma, delta`, 130);

    assert.doesNotMatch(clamped, /[,;:.\-]…$/);
  });
});

describe("getAuthorName", () => {
  it("strips the ISSN the editors append to every byline", () => {
    assert.equal(getAuthorName("Sergei Andreev | ISSN 3144-0541"), "Sergei Andreev");
  });

  it("strips a typed 'By' prefix", () => {
    assert.equal(getAuthorName("By Valeriia Kizchuk | ISSN 3144-0541"), "Valeriia Kizchuk");
  });

  it("keeps a plain name unchanged", () => {
    assert.equal(getAuthorName("Alina Isakova"), "Alina Isakova");
  });

  it("removes an ISSN that is not behind a separator", () => {
    assert.equal(getAuthorName("Jane Doe ISSN 3144-0541"), "Jane Doe");
  });

  it("does not eat names that merely start with 'By'", () => {
    assert.equal(getAuthorName("Byron Hale"), "Byron Hale");
  });

  it("returns an empty string for empty input", () => {
    assert.equal(getAuthorName(""), "");
    assert.equal(getAuthorName(null), "");
    assert.equal(getAuthorName(undefined), "");
  });
});

describe("fitsBrandTemplate", () => {
  it("accepts a title that stays short with the brand suffix", () => {
    assert.equal(fitsBrandTemplate("Subscribe", "Beauty Professionals Magazine"), true);
  });

  it("rejects a title that would be truncated mid-brand", () => {
    assert.equal(
      fitsBrandTemplate(
        "Rebuilding the Skin Barrier After Inflammatory Conditions",
        "Beauty Professionals Magazine",
      ),
      false,
    );
  });
});

describe("collapseWhitespace", () => {
  it("trims and normalizes every kind of whitespace", () => {
    assert.equal(collapseWhitespace("  a\t\tb\n\nc  "), "a b c");
  });
});
