import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { categoryConfigs } from "@/features/categories/data/categories";
import { buildCategoryMetadata, getCategoryJsonLd } from "@/features/categories/seo/category-seo";
import { SITE_URL } from "@/shared/seo/site";

// Parsed metadata and JSON-LD are inspected loosely on purpose in these assertions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

const beauty = categoryConfigs.find((category) => category.slug === "beauty")!;
const shopping = categoryConfigs.find((category) => category.slug === "shopping")!;

describe("category configuration", () => {
  it("gives every section a distinct, keyword-bearing title and a description", () => {
    const titles = categoryConfigs.map((category) => category.seoTitle ?? category.name);

    assert.equal(new Set(titles).size, titles.length);
    for (const category of categoryConfigs) {
      assert.ok(category.seoTitle, `${category.name} has no seoTitle`);
      assert.ok(category.seoTitle!.startsWith(category.name));
      assert.ok(category.description.length >= 50);
    }
  });
});

describe("buildCategoryMetadata", () => {
  it("indexes a populated, unfiltered section at its own canonical URL", () => {
    const metadata = buildCategoryMetadata(beauty, { filtered: false, empty: false });

    assert.equal((metadata.robots as Loose).index, true);
    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/category/beauty`);
  });

  it("serves the standalone shopping section at /shopping", () => {
    const metadata = buildCategoryMetadata(shopping, { filtered: false, empty: false });

    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/shopping`);
  });

  it("keeps filtered views (?tag=, ?q=, ?sort=) out of the index with no canonical of their own", () => {
    const metadata = buildCategoryMetadata(beauty, { filtered: true, empty: false });

    assert.equal((metadata.robots as Loose).index, false);
    assert.equal((metadata.robots as Loose).follow, true);
    assert.ok(!(metadata.alternates as Loose).canonical);
  });

  it("keeps a section with no articles out of the index", () => {
    const metadata = buildCategoryMetadata(beauty, { filtered: false, empty: true });

    assert.equal((metadata.robots as Loose).index, false);
  });

  it("titles the page with the section's keyword title", () => {
    const metadata = buildCategoryMetadata(beauty, { filtered: false, empty: false });

    assert.ok(JSON.stringify(metadata.title).includes("Beauty: Hair, Makeup, Nails, Skin & Wellness"));
  });
});

describe("getCategoryJsonLd", () => {
  it("describes a CollectionPage and, with no visible breadcrumb, no BreadcrumbList", () => {
    const graph = getCategoryJsonLd(beauty) as { "@graph": Loose[] };
    const types = graph["@graph"].map((node) => node["@type"]);

    assert.ok(types.includes("CollectionPage"));
    assert.ok(!types.includes("BreadcrumbList"));
  });
});
