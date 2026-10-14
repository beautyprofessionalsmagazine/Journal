import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeSlug } from "@/features/articles/validation/article-validation";

describe("normalizeSlug", () => {
  it("drops apostrophes instead of turning them into hyphens", () => {
    assert.equal(
      normalizeSlug("An Author's Methodology for Men's Haircut Design"),
      "an-authors-methodology-for-mens-haircut-design",
    );
  });

  it("handles typographic apostrophes the same way", () => {
    assert.equal(normalizeSlug("Beautiful Hair Doesn’t Start With a Haircut"), "beautiful-hair-doesnt-start-with-a-haircut");
    assert.equal(normalizeSlug("Anastasia Huk‘s Method"), "anastasia-huks-method");
  });

  it("collapses punctuation and symbols into single hyphens", () => {
    assert.equal(normalizeSlug("The #1 Career Growth Tool!"), "the-1-career-growth-tool");
    assert.equal(normalizeSlug("TV & Movies: A  Guide"), "tv-movies-a-guide");
  });

  it("trims leading and trailing separators", () => {
    assert.equal(normalizeSlug("  --Hello World--  "), "hello-world");
  });

  it("leaves the slugs already published untouched", () => {
    for (const slug of [
      "an-author-s-methodology-for-men-s-haircut-design-based-on-head-anatomy-and-hair-growth-patterns",
      "beautiful-hair-doesn-t-start-with-a-haircut",
      "why-beauty-competitions-have-become-the-1-career-growth-tool-in-the-industry",
    ]) {
      assert.equal(normalizeSlug(slug), slug);
    }
  });
});
