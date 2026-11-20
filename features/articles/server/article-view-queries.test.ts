import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { it } from "node:test";
import postgres from "postgres";

// Opt-in integration coverage; never implicitly use the application's database.
const testUrl = process.env.ARTICLE_VIEWS_TEST_DATABASE_URL;

it(
  "atomically counts published views without changing manual counts or editorial dates",
  { skip: !testUrl },
  async () => {
    assert.ok(testUrl);
    assert.ok(
      ["localhost", "127.0.0.1", "[::1]"].includes(new URL(testUrl).hostname),
      "Use an isolated local test database.",
    );
    process.env.DATABASE_URL = testUrl;
    const client = postgres(testUrl);
    const { recordArticleView, saveArticleViewSettings } =
      await import("@/features/articles/server/article-view-queries");
    const { listPublishedArticles } =
      await import("@/features/articles/server/article-queries");
    const { db } = await import("@/shared/lib/db");
    const id = randomUUID();
    const draftId = randomUUID();
    const timestamp = new Date("2026-01-01T00:00:00Z");
    try {
      await client`insert into articles (id, title, slug, category, author, status, updated_at, manual_views, view_count_mode)
      values (${id}, 'View test', ${id}, 'View test', 'Tester', 'published', ${timestamp}, 500, 'manual'),
      (${draftId}, 'Draft test', ${draftId}, 'View test', 'Tester', 'draft', ${timestamp}, 0, 'actual')`;
      const counts = await Promise.all(
        Array.from({ length: 50 }, () => recordArticleView(id)),
      );
      assert.ok(counts.every((count) => count === 500));
      const [manual] = await client`select * from articles where id = ${id}`;
      assert.equal(Number(manual.views), 50);
      assert.equal(Number(manual.manual_views), 500);
      assert.equal(manual.updated_at.toISOString(), timestamp.toISOString());
      assert.equal(await recordArticleView(draftId), null);
      assert.equal(await recordArticleView(randomUUID()), null);
      const updated = await saveArticleViewSettings(id, {
        viewCountMode: "actual",
        manualViews: 500,
      });
      assert.equal(updated?.viewCountMode, "actual");
      assert.equal(updated?.views, 50);
      const [unchanged] =
        await client`select updated_at, content_json, cover_image from articles where id = ${id}`;
      assert.equal(unchanged.updated_at.toISOString(), timestamp.toISOString());
      assert.equal(unchanged.content_json, null);
      assert.equal(unchanged.cover_image, null);
      assert.equal(
        await saveArticleViewSettings(randomUUID(), {
          viewCountMode: "manual",
          manualViews: 5,
        }),
        null,
      );
      assert.equal(await recordArticleView(id), 51);
      await client`update articles set view_count_mode = 'manual', manual_views = 0 where id = ${id}`;
      assert.equal(await recordArticleView(id), 0);
      const [last] = await client`select views from articles where id = ${id}`;
      assert.equal(Number(last.views), 52);
      await assert.rejects(
        client`update articles set manual_views = -1 where id = ${id}`,
      );
      await assert.rejects(
        client`update articles set views = -1 where id = ${id}`,
      );
      await assert.rejects(
        client`update articles set manual_views = 9007199254740992 where id = ${id}`,
      );
      await client`update articles set status = 'published', views = 2 where id = ${draftId}`;
      const sorted = await listPublishedArticles({
        category: "View test",
        sort: "popular",
      });
      assert.deepEqual(
        sorted.map((article) => article.id),
        [draftId, id],
      );
    } finally {
      await client`delete from articles where id in (${id}, ${draftId})`;
      await client.end();
      await db.$client.end();
    }
  },
);
