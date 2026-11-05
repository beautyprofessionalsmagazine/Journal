import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getArticleDescription,
  getArticleImages,
  getArticleJsonLd,
  getArticleMetadata,
  getArticlePath,
} from "@/features/articles/seo/article-seo";
import { SITE, SITE_URL } from "@/shared/seo/site";

// Parsed metadata and JSON-LD are inspected loosely on purpose in these assertions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

const BLOB = "https://abc.public.blob.vercel-storage.com";

const cover = {
  src: `${BLOB}/articles/original.jpg`,
  alt: "Two stylists looking at the camera",
  settings: {
    version: 4,
    crops: {},
    generatedImages: {
      socialShare: { url: `${BLOB}/gen/social-1600x900.webp`, width: 1600, height: 900 },
      homepageFeature: { url: `${BLOB}/gen/feature-1600x1200.webp`, width: 1600, height: 1200 },
      storyCard: { url: `${BLOB}/gen/card-1200x900.webp`, width: 1200, height: 900 },
      articleHero: { url: `${BLOB}/gen/hero-1200x1500.webp`, width: 1200, height: 1500 },
    },
  },
};

const document = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "First section" }] },
    { type: "paragraph", content: [{ type: "text", text: "Alpha beta gamma delta." }] },
    { type: "paragraph", content: [{ type: "text", text: "Epsilon zeta." }] },
  ],
};

function article(overrides: Record<string, unknown> = {}) {
  return {
    title: "The Return of the Fringe",
    slug: "the-return-of-the-fringe",
    category: "Beauty",
    author: "Valeriia Kizchuk | ISSN 3144-0541",
    description: "After years of undone texture, hair is getting a shape again.",
    coverImage: cover as never,
    tags: ["Fringe", "Hair"],
    publishedAt: new Date("2026-10-08T09:00:00.000Z"),
    createdAt: new Date("2026-10-07T09:00:00.000Z"),
    updatedAt: new Date("2026-10-09T09:00:00.000Z"),
    contentJson: document,
    ...overrides,
  } as Parameters<typeof getArticleMetadata>[0];
}

describe("getArticleImages", () => {
  it("shares the dedicated 16:9 render, wide enough for Discover", () => {
    const { share } = getArticleImages(article());

    assert.equal(share?.url, `${BLOB}/gen/social-1600x900.webp`);
    assert.equal(share?.width, 1600);
    assert.equal(share?.height, 900);
    assert.ok((share?.width ?? 0) >= 1200);
    assert.equal(share?.alt, "Two stylists looking at the camera");
  });

  it("offers every distinct rendition to structured data, original last", () => {
    const { structured } = getArticleImages(article());

    assert.deepEqual(structured, [
      `${BLOB}/gen/social-1600x900.webp`,
      `${BLOB}/gen/feature-1600x1200.webp`,
      `${BLOB}/gen/hero-1200x1500.webp`,
      `${BLOB}/articles/original.jpg`,
    ]);
  });

  it("keeps legacy covers shareable until their 16:9 rendition is generated", () => {
    const legacyImages: Partial<typeof cover.settings.generatedImages> = {
      ...cover.settings.generatedImages,
    };
    delete legacyImages.socialShare;
    const legacyCover = {
      ...cover,
      settings: { ...cover.settings, generatedImages: legacyImages },
    };
    const { share } = getArticleImages(
      article({ coverImage: legacyCover as never }),
    );

    assert.equal(share?.url, `${BLOB}/gen/feature-1600x1200.webp`);
    assert.equal(share?.width, 1600);
    assert.equal(share?.height, 1200);
  });

  it("falls back to the untouched upload when no renditions were generated", () => {
    const bare = article({ coverImage: { src: cover.src, alt: "", settings: undefined } });
    const { share, structured } = getArticleImages(bare);

    assert.equal(share?.url, cover.src);
    assert.deepEqual(structured, [cover.src]);
  });

  it("returns nothing for an article without a cover", () => {
    assert.deepEqual(getArticleImages(article({ coverImage: null })), {
      share: null,
      structured: [],
    });
  });
});

describe("getArticleDescription", () => {
  it("clamps a very long description for the meta tag", () => {
    const long = article({ description: "word ".repeat(120) });

    assert.ok(getArticleDescription(long).length <= 160);
  });

  it("falls back to the opening of the body when the description is empty", () => {
    const text = getArticleDescription(article({ description: null }));

    assert.ok(text.startsWith("First section Alpha beta gamma delta."));
  });
});

describe("getArticleMetadata", () => {
  const metadata = getArticleMetadata(article());
  const og = metadata.openGraph as Loose;

  it("canonicalizes to the article URL on the production origin", () => {
    assert.equal(metadata.alternates?.canonical, `${SITE_URL}${getArticlePath("the-return-of-the-fringe")}`);
    assert.equal(og.url, metadata.alternates?.canonical);
  });

  it("describes the page as an Open Graph article with dates, author, section and tags", () => {
    assert.equal(og.type, "article");
    assert.equal(og.publishedTime, "2026-10-08T09:00:00.000Z");
    assert.equal(og.modifiedTime, "2026-10-09T09:00:00.000Z");
    // The ISSN appended to the byline never reaches the author tag.
    assert.deepEqual(og.authors, ["Valeriia Kizchuk"]);
    assert.equal(og.section, "Beauty");
    assert.deepEqual(og.tags, ["Fringe", "Hair"]);
  });

  it("uses the cover as the social image, with its dimensions and alt text", () => {
    assert.deepEqual(og.images[0], {
      url: `${BLOB}/gen/social-1600x900.webp`,
      width: 1600,
      height: 900,
      alt: "Two stylists looking at the camera",
    });
  });

  it("is indexable", () => {
    assert.equal((metadata.robots as Loose).index, true);
  });

  it("uses the creation date when an article has no publish date", () => {
    const undated = getArticleMetadata(article({ publishedAt: null }));

    assert.equal((undated.openGraph as Loose).publishedTime, "2026-10-07T09:00:00.000Z");
  });

  it("falls back to the default share image for an article without a cover", () => {
    const uncovered = getArticleMetadata(article({ coverImage: null }));

    assert.equal(
      (uncovered.openGraph as Loose).images[0].url,
      `${SITE_URL}${SITE.shareImage.path}`,
    );
  });
});

describe("getArticleJsonLd", () => {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Beauty", path: "/category/beauty" },
    { name: "The Return of the Fringe", path: "/articles/the-return-of-the-fringe" },
  ];
  const graph = getArticleJsonLd(article(), breadcrumbs) as { "@graph": Loose[] };
  const byType = (type: string) => graph["@graph"].find((node) => node["@type"] === type)!;

  it("contains the page, article, breadcrumb and publisher entities", () => {
    const types = graph["@graph"].map((node) => node["@type"]).sort();

    assert.deepEqual(types, [
      "Article",
      "BreadcrumbList",
      "Organization",
      "Periodical",
      "WebPage",
      "WebSite",
    ]);
  });

  it("has unique @ids, so references resolve to exactly one node", () => {
    const ids = graph["@graph"].map((node) => node["@id"]);

    assert.equal(new Set(ids).size, ids.length);
  });

  it("gives Google an author name with no ISSN, a headline, ISO dates and images", () => {
    const node = byType("Article");

    assert.deepEqual(node.author, { "@type": "Person", name: "Valeriia Kizchuk" });
    assert.equal(node.headline, "The Return of the Fringe");
    assert.equal(node.datePublished, "2026-10-08T09:00:00.000Z");
    assert.equal(node.dateModified, "2026-10-09T09:00:00.000Z");
    assert.equal(node.image.length, 4);
    assert.ok(node.image.every((url: string) => url.startsWith("https://")));
    assert.equal(node.articleSection, "Beauty");
    assert.equal(node.keywords, "Fringe, Hair");
    assert.equal(node.wordCount, 8);
  });

  it("marks up the same breadcrumb trail the page shows", () => {
    const trail = byType("BreadcrumbList");

    assert.deepEqual(
      trail.itemListElement.map((item: Loose) => item.name),
      ["Home", "Beauty", "The Return of the Fringe"],
    );
  });

  it("falls back to the creation date instead of omitting datePublished", () => {
    const undated = getArticleJsonLd(article({ publishedAt: null }), breadcrumbs) as { "@graph": Loose[] };
    const node = undated["@graph"].find((item) => item["@type"] === "Article")!;

    assert.equal(node.datePublished, "2026-10-07T09:00:00.000Z");
  });

  it("serializes without undefined values", () => {
    assert.ok(!JSON.stringify(graph).includes("undefined"));
  });
});
