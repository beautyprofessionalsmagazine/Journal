import assert from "node:assert/strict";
import { it } from "node:test";
import { isArticleViewRequest } from "@/features/articles/server/article-view-request";

it("accepts same-origin tracking and rejects cross-origin, form, and prefetch requests", () => {
  const request = (headers: Record<string, string>) =>
    new Request("https://journal.example/api/articles/id/views", {
      method: "POST",
      headers,
    });
  const valid = {
    "x-article-view": "1",
    origin: "https://journal.example",
    "sec-fetch-site": "same-origin",
  };
  assert.equal(isArticleViewRequest(request(valid)), true);
  assert.equal(isArticleViewRequest(request({ "x-article-view": "1" })), true);
  assert.equal(isArticleViewRequest(request({})), false);
  assert.equal(
    isArticleViewRequest(request({ ...valid, origin: "https://evil.example" })),
    false,
  );
  assert.equal(
    isArticleViewRequest(request({ ...valid, "sec-fetch-site": "same-site" })),
    false,
  );
  assert.equal(
    isArticleViewRequest(request({ ...valid, purpose: "prefetch" })),
    false,
  );
  assert.equal(
    isArticleViewRequest(
      request({ ...valid, "sec-purpose": "prefetch;prerender" }),
    ),
    false,
  );
});

it("uses the incoming host when Next constructs an internal localhost URL", () => {
  const request = (origin: string, host = "127.0.0.1:3000") =>
    new Request("http://localhost:3000/api/articles/id/views", {
      method: "POST",
      headers: {
        "x-article-view": "1",
        "sec-fetch-site": "same-origin",
        host,
        origin,
      },
    });
  assert.equal(isArticleViewRequest(request("http://127.0.0.1:3000")), true);
  assert.equal(
    isArticleViewRequest(request("https://journal.example", "journal.example")),
    true,
  );
  assert.equal(isArticleViewRequest(request("http://127.0.0.1:3001")), false);
  assert.equal(isArticleViewRequest(request("https://evil.example")), false);
  assert.equal(isArticleViewRequest(request("null")), false);
  assert.equal(isArticleViewRequest(request("invalid origin")), false);
});
