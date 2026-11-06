import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getArticleDates } from "@/features/articles/lib/article-dates";

describe("getArticleDates", () => {
  it("uses the creation date when a legacy published article has no publish date", () => {
    const createdAt = new Date("2026-06-01T12:00:00.000Z");
    const dates = getArticleDates({
      createdAt,
      publishedAt: null,
      updatedAt: new Date("2026-06-01T14:00:00.000Z"),
    });

    assert.equal(dates.published, createdAt);
    assert.equal(dates.modified, null);
  });

  it("shows a modification date only for a meaningful later update", () => {
    const publishedAt = new Date("2026-06-01T12:00:00.000Z");
    const updatedAt = new Date("2026-06-05T12:00:00.000Z");
    const dates = getArticleDates({
      createdAt: publishedAt,
      publishedAt,
      updatedAt,
    });

    assert.equal(dates.published, publishedAt);
    assert.equal(dates.modified, updatedAt);
  });
});
