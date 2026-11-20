import assert from "node:assert/strict";
import { it } from "node:test";
import { articleViewSettingsSchema } from "@/features/articles/validation/article-view-validation";
import { getArticleInputFromFormData } from "@/features/articles/validation/article-validation";

it("validates view settings independently of article content and cover metadata", () => {
  const result = articleViewSettingsSchema.safeParse({
    viewCountMode: "manual",
    manualViews: "1234",
    views: 999,
    contentJson: null,
  });
  assert.equal(result.success, true);
  if (result.success)
    assert.deepEqual(result.data, {
      viewCountMode: "manual",
      manualViews: 1234,
    });
  for (const manualViews of [
    "",
    "-1",
    "1.5",
    "bad",
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.equal(
      articleViewSettingsSchema.safeParse({
        viewCountMode: "manual",
        manualViews,
      }).success,
      false,
    );
  }
});

it("an article-only save does not overwrite independently saved view settings", () => {
  const input = getArticleInputFromFormData(new FormData());
  assert.equal(input.manualViews, undefined);
  assert.equal(input.viewCountMode, undefined);
});
