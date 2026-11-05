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
