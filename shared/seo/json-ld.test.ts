import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ORGANIZATION_ID,
  PERIODICAL_ID,
  WEBSITE_ID,
  articleNode,
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  pageJsonLd,
  periodicalNode,
  serializeJsonLd,
  webPageNode,
  webSiteNode,
} from "@/shared/seo/json-ld";
import { SITE, SITE_URL } from "@/shared/seo/site";

// Parsed metadata and JSON-LD are inspected loosely on purpose in these assertions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

describe("serializeJsonLd", () => {
  it("escapes '<' so a closing script tag in content cannot end the block", () => {
    const out = serializeJsonLd({ name: "</script><img src=x onerror=alert(1)>" });

    assert.ok(!out.includes("<"), out);
    assert.equal(JSON.parse(out).name, "</script><img src=x onerror=alert(1)>");
  });

  it("escapes the JavaScript line and paragraph separators", () => {
    const text = `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`;
    const out = serializeJsonLd({ text });

    assert.ok(!out.includes(String.fromCharCode(0x2028)));
    assert.ok(!out.includes(String.fromCharCode(0x2029)));
    assert.equal(JSON.parse(out).text, text);
  });
});

describe("site entities", () => {
  it("describes the organization with its logo and without invented profiles", () => {
    const org = organizationNode() as Loose;

    assert.equal(org["@type"], "Organization");
    assert.equal(org["@id"], ORGANIZATION_ID);
    assert.equal(org.name, SITE.name);
    assert.equal(org.logo.url, `${SITE_URL}${SITE.logo.path}`);
    // No sameAs until real profile URLs are configured.
    assert.equal("sameAs" in org, SITE.sameAs.length > 0);
  });

  it("names the website for Google's site-name feature", () => {
    const site = webSiteNode() as Loose;

    assert.equal(site["@id"], WEBSITE_ID);
    assert.equal(site.name, SITE.name);
    assert.equal(site.url, `${SITE_URL}/`);
    assert.deepEqual(site.publisher, { "@id": ORGANIZATION_ID });
    // The bare lowercase domain is the recommended last alternate name.
    assert.equal(site.alternateName.at(-1), new URL(SITE_URL).hostname);
  });

  it("carries the registered ISSN on the periodical", () => {
    const periodical = periodicalNode() as Loose;

    assert.equal(periodical["@type"], "Periodical");
    assert.equal(periodical["@id"], PERIODICAL_ID);
    assert.match(periodical.issn, /^\d{4}-\d{3}[\dX]$/);
  });
});

describe("webPageNode and pageJsonLd", () => {
  it("links the page to the site and omits unset optional fields", () => {
    const page = webPageNode({ path: "/articles", name: "Articles" }) as Loose;

    assert.equal(page.url, `${SITE_URL}/articles`);
    assert.equal(page["@id"], `${SITE_URL}/articles#webpage`);
    assert.deepEqual(page.isPartOf, { "@id": WEBSITE_ID });
    assert.ok(!("description" in page));
    assert.ok(!("breadcrumb" in page));
  });

  it("builds a graph whose @ids are all unique", () => {
    const graph = pageJsonLd({ path: "/articles", name: "Articles", type: "CollectionPage" }) as {
      "@context": string;
      "@graph": Record<string, unknown>[];
    };
    const ids = graph["@graph"].map((node) => node["@id"]);

    assert.equal(graph["@context"], "https://schema.org");
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("breadcrumbNode", () => {
  it("numbers the trail from 1 and uses absolute URLs", () => {
    const crumbs = breadcrumbNode("/articles/story", [
      { name: "Home", path: "/" },
      { name: "Beauty", path: "/category/beauty" },
      { name: "Story", path: "/articles/story" },
    ]) as Loose;

    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.deepEqual(
      crumbs.itemListElement.map((item: Loose) => [item.position, item.name, item.item]),
      [
        [1, "Home", `${SITE_URL}/`],
        [2, "Beauty", `${SITE_URL}/category/beauty`],
        [3, "Story", `${SITE_URL}/articles/story`],
      ],
    );
  });
});

describe("articleNode", () => {
  const base = {
    path: "/articles/story",
    headline: "A Headline",
    images: [`${SITE_URL}/a.webp`],
    datePublished: new Date("2026-09-01T10:00:00.000Z"),
    dateModified: new Date("2026-09-02T10:00:00.000Z"),
    authorName: "Jane Doe",
  };

  it("emits a Person author carrying only the name, plus ISO dates", () => {
    const node = articleNode(base) as Loose;

    assert.equal(node["@type"], "Article");
    assert.deepEqual(node.author, { "@type": "Person", name: "Jane Doe" });
    assert.equal(node.datePublished, "2026-09-01T10:00:00.000Z");
    assert.equal(node.dateModified, "2026-09-02T10:00:00.000Z");
    assert.deepEqual(node.publisher, { "@id": ORGANIZATION_ID });
    assert.deepEqual(node.mainEntityOfPage, { "@id": `${SITE_URL}/articles/story#webpage` });
  });

  it("falls back to the organization rather than inventing an author", () => {
    const node = articleNode({ ...base, authorName: null }) as Loose;

    assert.deepEqual(node.author, { "@id": ORGANIZATION_ID });
  });

  it("shortens a headline over 110 characters", () => {
    const node = articleNode({ ...base, headline: "H".repeat(200) }) as Loose;

    assert.ok(node.headline.length <= 110);
    assert.ok(node.headline.endsWith("…"));
  });

  it("leaves out fields it has no data for instead of emitting empty values", () => {
    const node = articleNode({
      path: "/articles/story",
      headline: "A Headline",
      images: [],
    }) as Record<string, unknown>;

    for (const key of ["image", "datePublished", "dateModified", "articleSection", "keywords", "wordCount", "description"]) {
      assert.ok(!(key in node), `${key} should be omitted`);
    }
  });

  it("round-trips through JSON without undefined leaking into the output", () => {
    const text = serializeJsonLd(jsonLdGraph([articleNode(base)]));

    assert.ok(!text.includes("undefined"));
    assert.doesNotThrow(() => JSON.parse(text));
  });
});
