import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SITE_URL } from "@/shared/seo/site";
import {
  STATIC_PAGES,
  getSitemapStaticPages,
  getStaticPageJsonLd,
  getStaticPageMetadata,
  type StaticPageSeo,
} from "@/shared/seo/pages";

const pages = Object.entries<StaticPageSeo>(STATIC_PAGES);

describe("static page registry", () => {
  it("uses unique, site-relative paths", () => {
    const paths = pages.map(([, page]) => page.path);

    assert.equal(new Set(paths).size, paths.length);
    for (const path of paths) {
      assert.match(path, /^\/[a-z0-9-]+$/);
    }
  });

  it("gives every indexable page its own title and a description of sensible length", () => {
    const titles = new Set<string>();

    for (const [key, page] of pages.filter(([, p]) => p.indexable)) {
      assert.ok(page.description.length >= 50, `${key}: description too short`);
      assert.ok(page.description.length <= 200, `${key}: description too long`);
      if (!page.canonicalPath) {
        assert.ok(!titles.has(page.title), `${key}: duplicate title`);
        titles.add(page.title);
      }
    }
  });

  it("only canonicalizes a page to one that exists in the site", () => {
    for (const [key, page] of pages) {
      if (page.canonicalPath) {
        assert.match(page.canonicalPath, /^\/[a-z0-9-]+$/, `${key}: bad canonicalPath`);
      }
    }
  });
});

describe("getStaticPageMetadata", () => {
  it("noindexes a placeholder page and still declares its canonical URL", () => {
    const metadata = getStaticPageMetadata("careers");

    assert.equal((metadata.robots as Record<string, unknown>).index, false);
    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/careers`);
  });

  it("points the archive at the articles listing it duplicates", () => {
    assert.equal(getStaticPageMetadata("archive").alternates?.canonical, `${SITE_URL}/articles`);
  });

  it("keeps a finished page indexable", () => {
    const metadata = getStaticPageMetadata("subscribe");

    assert.equal((metadata.robots as Record<string, unknown>).index, true);
  });

  it("lets a page override copy that depends on live configuration", () => {
    const metadata = getStaticPageMetadata("subscribe", { description: "Paused for now." });

    assert.equal(metadata.description, "Paused for now.");
  });

  it("does not repeat the brand for a title that already contains it", () => {
    assert.deepEqual(getStaticPageMetadata("whereToFind").title, {
      absolute: "Where to Find Beauty Professionals Magazine",
    });
  });
});

describe("getStaticPageJsonLd", () => {
  it("describes the page with the registry's copy, or the override when given", () => {
    const graph = getStaticPageJsonLd("subscribe", { description: "Paused for now." }) as {
      "@graph": Record<string, unknown>[];
    };
    const page = graph["@graph"].find((node) => node["@type"] === "WebPage");

    assert.equal(page?.url, `${SITE_URL}/subscribe`);
    assert.equal(page?.description, "Paused for now.");
  });

  it("uses the page's schema.org subtype when it has one", () => {
    const graph = getStaticPageJsonLd("contacts") as { "@graph": Record<string, unknown>[] };

    assert.ok(graph["@graph"].some((node) => node["@type"] === "ContactPage"));
  });
});

describe("getSitemapStaticPages", () => {
  it("lists exactly the finished, self-canonical pages", () => {
    const listed = getSitemapStaticPages().map((page) => page.path).sort();

    assert.deepEqual(listed, ["/subscribe", "/where-to-find"]);
  });

  it("never lists a noindex page or a page that canonicalizes elsewhere", () => {
    for (const page of getSitemapStaticPages()) {
      assert.equal(page.indexable, true);
      assert.equal(page.canonicalPath, undefined);
    }
  });
});
