import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ArticleInput } from "@/features/articles/types/article";
import { validateArticleInput } from "@/features/articles/validation/article-validation";

function validInput(overrides: Partial<ArticleInput> = {}): ArticleInput {
  return {
    title: "A precise editorial headline",
    slug: "a-precise-editorial-headline",
    category: "Beauty",
    author: "Editorial Author",
    description: "A concise summary of the article for readers and search results.",
    coverImage: "https://cdn.example.com/cover.jpg",
    coverImageAlt: "A beauty professional preparing tools at a studio table",
    coverImageSettings: null,
    tags: [],
    status: "published",
    publishedAt: new Date("2026-10-01T12:00:00.000Z"),
    contentJson: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "A complete article introduction." }],
        },
      ],
    },
    ...overrides,
  };
}

describe("article publishing SEO guardrails", () => {
  it("blocks a published article when an inline image has no alt text", () => {
    const result = validateArticleInput(
      validInput({
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Intro" }] },
            {
              type: "image",
              attrs: { src: "https://cdn.example.com/body.jpg", alt: "" },
            },
          ],
        },
      }),
    );

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(
        result.error.flatten().fieldErrors.contentJson?.[0] ?? "",
        /alt text.*1 missing/i,
      );
    }
  });

  it("lets a draft keep incomplete image metadata while it is being edited", () => {
    const result = validateArticleInput(
      validInput({
        status: "draft",
        description: null,
        coverImage: null,
        coverImageAlt: null,
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Draft" }] },
            {
              type: "image",
              attrs: { src: "https://cdn.example.com/body.jpg", alt: "" },
            },
          ],
        },
      }),
    );

    assert.equal(result.success, true);
  });

  it("blocks future-dated content from being published immediately", () => {
    const result = validateArticleInput(
      validInput({ publishedAt: new Date("2099-01-01T00:00:00.000Z") }),
    );

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(
        result.error.flatten().fieldErrors.publishedAt?.[0] ?? "",
        /cannot be in the future/i,
      );
    }
  });
});

describe("article view settings", () => {
  it("accepts either mode and a zero or large manual count", () => {
    for (const viewCountMode of ["actual", "manual"] as const) {
      for (const manualViews of [0, "0", " 1234 ", 3_000_000_000, Number.MAX_SAFE_INTEGER]) {
        const result = validateArticleInput(validInput({ viewCountMode, manualViews }));
        assert.equal(result.success, true);
        if (result.success) assert.equal(result.data.manualViews, Number(manualViews));
      }
    }
  });

  it("rejects blank, fractional, negative, non-numeric and unsafe counts", () => {
    for (const manualViews of ["", " ", "1e3", "0x10", "1.5", "-1", -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      const result = validateArticleInput(validInput({ manualViews }));
      assert.equal(result.success, false, String(manualViews));
      if (!result.success) assert.ok(result.error.flatten().fieldErrors.manualViews);
    }
    const result = validateArticleInput({ ...validInput(), viewCountMode: "invalid" } as unknown as ArticleInput);
    assert.equal(result.success, false);
  });

  it("does not accept an actual counter from admin input", () => {
    const result = validateArticleInput({ ...validInput(), views: 999 } as ArticleInput);
    assert.equal(result.success, true);
    if (result.success) assert.equal("views" in result.data, false);
  });
});
