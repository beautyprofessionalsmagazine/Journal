import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hasActiveArticleFilters,
  parseArticleFilters,
} from "@/features/articles/server/article-filter-params";

describe("hasActiveArticleFilters", () => {
  it("treats a plain listing as unfiltered", () => {
    assert.equal(hasActiveArticleFilters(parseArticleFilters({})), false);
    assert.equal(hasActiveArticleFilters(parseArticleFilters({ sort: "latest" })), false);
  });

  it("flags a search, tag, category filter, or the popular sort", () => {
    assert.equal(hasActiveArticleFilters(parseArticleFilters({ q: "hair" })), true);
    assert.equal(hasActiveArticleFilters(parseArticleFilters({ tag: "Skin" })), true);
    assert.equal(hasActiveArticleFilters(parseArticleFilters({ category: "Beauty" })), true);
    assert.equal(hasActiveArticleFilters(parseArticleFilters({ sort: "popular" })), true);
  });

  it("ignores empty and 'all' values the filter UI leaves behind", () => {
    assert.equal(
      hasActiveArticleFilters(parseArticleFilters({ q: "  ", tag: "all", category: "all" })),
      false,
    );
  });

  it("ignores unknown parameters (tracking tags must not change indexability)", () => {
    assert.equal(
      hasActiveArticleFilters(parseArticleFilters({ utm_source: "newsletter", fbclid: "x" })),
      false,
    );
  });
});
