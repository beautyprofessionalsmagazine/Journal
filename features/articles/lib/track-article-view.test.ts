import assert from "node:assert/strict";
import { it, type TestContext } from "node:test";
import { trackArticleView } from "@/features/articles/lib/track-article-view";

function browser(t: TestContext, visibility = "visible") {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const document = Object.assign(new EventTarget(), {
    visibilityState: visibility,
  });
  const window = Object.assign(new EventTarget(), { setTimeout, clearTimeout });
  for (const [name, value] of Object.entries({ document, window })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ views: 11 }),
  );
  return { document, window, fetchMock };
}

it("cancels Strict Mode rehearsal and counts once despite visibility changes", async (t) => {
  const { document, fetchMock } = browser(t);
  const counts: number[] = [];
  trackArticleView("article-id", (count) => counts.push(count))();
  const cleanup = trackArticleView("article-id", (count) => counts.push(count));
  t.mock.timers.tick(1);
  document.dispatchEvent(new Event("visibilitychange"));
  document.dispatchEvent(new Event("visibilitychange"));
  await new Promise(setImmediate);
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.deepEqual(counts, [11]);
  cleanup();
});

it("waits for visibility, counts back/forward restores, and cleans up", (t) => {
  const { document, window, fetchMock } = browser(t, "hidden");
  const cleanup = trackArticleView("article-id", () => {});
  t.mock.timers.tick(1);
  assert.equal(fetchMock.mock.callCount(), 0);
  document.visibilityState = "visible";
  document.dispatchEvent(new Event("visibilitychange"));
  window.dispatchEvent(
    Object.assign(new Event("pageshow"), { persisted: false }),
  );
  assert.equal(fetchMock.mock.callCount(), 1);
  window.dispatchEvent(
    Object.assign(new Event("pageshow"), { persisted: true }),
  );
  assert.equal(fetchMock.mock.callCount(), 2);
  cleanup();
  window.dispatchEvent(
    Object.assign(new Event("pageshow"), { persisted: true }),
  );
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(fetchMock.mock.callCount(), 2);
});

it("does not retry a failed request or publish a late result after leaving", async (t) => {
  const { document, fetchMock } = browser(t);
  fetchMock.mock.mockImplementationOnce(async () => {
    throw new Error("offline");
  });
  const counts: number[] = [];
  const cleanup = trackArticleView("article-id", (count) => counts.push(count));
  t.mock.timers.tick(1);
  await new Promise(setImmediate);
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(fetchMock.mock.callCount(), 1);
  cleanup();
  const nextCleanup = trackArticleView("other-article", (count) =>
    counts.push(count),
  );
  t.mock.timers.tick(1);
  nextCleanup();
  await new Promise(setImmediate);
  assert.deepEqual(counts, []);
});
