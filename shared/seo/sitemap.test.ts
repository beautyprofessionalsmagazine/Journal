import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISALLOWED_PATHS, buildRobots } from "@/shared/seo/robots";
import { SITE_URL } from "@/shared/seo/site";
import { buildSitemapEntries, type SitemapInput } from "@/shared/seo/sitemap";

const older = new Date("2026-08-01T00:00:00.000Z");
const newer = new Date("2026-10-01T00:00:00.000Z");

const input: SitemapInput = {
  staticPages: [{ path: "/subscribe" }, { path: "/where-to-find" }],
  categories: [
    { name: "Beauty", href: "/category/beauty" },
    { name: "Runway", href: "/category/runway" },
    { name: "Shopping", href: "/shopping" },
  ],
  articles: [
    { slug: "newest", category: "Beauty", updatedAt: newer, imageUrls: ["/img/a.webp"] },
    { slug: "oldest", category: "Shopping", updatedAt: older, imageUrls: [] },
  ],
  lookbooks: [
    { issueYear: 2026, issueMonth: 9, updatedAt: newer },
    { issueYear: 2026, issueMonth: 8, updatedAt: older },
  ],
};

function urls(entries: ReturnType<typeof buildSitemapEntries>) {
  return entries.map((entry) => entry.url);
}

describe("buildSitemapEntries", () => {
  const entries = buildSitemapEntries(input);

  it("lists only absolute URLs on the canonical origin, each exactly once", () => {
    const all = urls(entries);

    assert.equal(new Set(all).size, all.length);
    for (const url of all) {
      assert.ok(url.startsWith(SITE_URL), url);
    }
  });

  it("includes the home page, the listing, every article and the static pages", () => {
    const all = urls(entries);

    for (const expected of [
      `${SITE_URL}/`,
      `${SITE_URL}/articles`,
      `${SITE_URL}/articles/newest`,
      `${SITE_URL}/articles/oldest`,
      `${SITE_URL}/subscribe`,
      `${SITE_URL}/where-to-find`,
    ]) {
      assert.ok(all.includes(expected), `missing ${expected}`);
    }
  });

  it("omits sections that have no published article", () => {
    const all = urls(entries);

    assert.ok(all.includes(`${SITE_URL}/category/beauty`));
    assert.ok(all.includes(`${SITE_URL}/shopping`));
    assert.ok(!all.includes(`${SITE_URL}/category/runway`));
  });

  it("dates the home page and listing from the newest article", () => {
    const home = entries.find((entry) => entry.url === `${SITE_URL}/`);
    const listing = entries.find((entry) => entry.url === `${SITE_URL}/articles`);

    assert.deepEqual(home?.lastModified, newer);
    assert.deepEqual(listing?.lastModified, newer);
  });

  it("dates each section from its own newest article", () => {
    const shopping = entries.find((entry) => entry.url === `${SITE_URL}/shopping`);

    assert.deepEqual(shopping?.lastModified, older);
  });

  it("does not invent a date for static pages", () => {
    const subscribe = entries.find((entry) => entry.url === `${SITE_URL}/subscribe`);

    assert.equal(subscribe?.lastModified, undefined);
  });

  it("attaches absolute image URLs only to articles that have covers", () => {
    const withImage = entries.find((entry) => entry.url === `${SITE_URL}/articles/newest`);
    const withoutImage = entries.find((entry) => entry.url === `${SITE_URL}/articles/oldest`);

    assert.deepEqual(withImage?.images, [`${SITE_URL}/img/a.webp`]);
    assert.equal(withoutImage?.images, undefined);
  });

  it("lists /lookbook for the newest edition and a canonical URL for each older one", () => {
    const all = urls(entries);

    assert.ok(all.includes(`${SITE_URL}/lookbook`));
    assert.ok(all.includes(`${SITE_URL}/lookbook?year=2026&month=8`));
    // The newest edition's parameter URL canonicalizes to /lookbook: never listed twice.
    assert.ok(!all.includes(`${SITE_URL}/lookbook?year=2026&month=9`));
  });

  it("leaves the Lookbook out entirely until an edition exists", () => {
    const none = buildSitemapEntries({ ...input, lookbooks: [] });

    assert.ok(!urls(none).some((url) => url.includes("/lookbook")));
  });

  it("still returns the static skeleton when there are no articles", () => {
    const empty = buildSitemapEntries({ ...input, articles: [], lookbooks: [] });

    assert.deepEqual(urls(empty), [
      `${SITE_URL}/`,
      `${SITE_URL}/articles`,
      `${SITE_URL}/subscribe`,
      `${SITE_URL}/where-to-find`,
    ]);
  });
});

describe("buildRobots", () => {
  const robots = buildRobots();
  const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];

  it("allows the public site and blocks the back office and API", () => {
    assert.equal(rules.length, 1);
    assert.equal(rules[0].userAgent, "*");
    assert.equal(rules[0].allow, "/");
    assert.deepEqual(rules[0].disallow, [...DISALLOWED_PATHS]);
    assert.ok(DISALLOWED_PATHS.includes("/admin"));
    assert.ok(DISALLOWED_PATHS.includes("/api/"));
  });

  it("points at the sitemap with an absolute URL", () => {
    assert.equal(robots.sitemap, `${SITE_URL}/sitemap.xml`);
  });

  it("does not block filter or sort URLs, so their noindex tag can be read", () => {
    for (const path of DISALLOWED_PATHS) {
      assert.ok(!path.includes("?"), `${path} must not target query strings`);
    }
  });

  it("never blocks the whole site", () => {
    for (const path of DISALLOWED_PATHS) {
      assert.notEqual(path, "/");
    }
  });
});
