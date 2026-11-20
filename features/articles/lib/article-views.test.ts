import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDisplayedArticleViews } from "@/features/articles/lib/article-views";

describe("article display count", () => {
  it("uses exactly the selected source, including a manual zero", () => {
    assert.equal(
      getDisplayedArticleViews({
        views: 9,
        manualViews: 100,
        viewCountMode: "actual",
      }),
      9,
    );
    assert.equal(
      getDisplayedArticleViews({
        views: 9,
        manualViews: 100,
        viewCountMode: "manual",
      }),
      100,
    );
    assert.equal(
      getDisplayedArticleViews({
        views: 9,
        manualViews: 0,
        viewCountMode: "manual",
      }),
      0,
    );
  });
});
