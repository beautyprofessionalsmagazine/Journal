import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INDEXABLE_ROBOTS,
  NOINDEX_ROBOTS,
  buildPageMetadata,
} from "@/shared/seo/metadata";
import { SITE, SITE_URL } from "@/shared/seo/site";

// Parsed metadata and JSON-LD are inspected loosely on purpose in these assertions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

describe("buildPageMetadata", () => {
  it("emits an absolute canonical for the page path", () => {
    const metadata = buildPageMetadata({
      title: "Subscribe",
      description: "Get the magazine.",
      path: "/subscribe",
    });

    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/subscribe`);
    assert.equal((metadata.openGraph as Loose).url, `${SITE_URL}/subscribe`);
  });

  it("is indexable by default and carries the Googlebot large-image directive", () => {
    const metadata = buildPageMetadata({ title: "Subscribe", path: "/subscribe" });

    assert.deepEqual(metadata.robots, INDEXABLE_ROBOTS);
    assert.equal((metadata.robots as Loose).googleBot["max-image-preview"], "large");
  });

  it("marks noindex pages noindex but still followable", () => {
    const metadata = buildPageMetadata({ title: "About", path: "/about", noindex: true });

    assert.deepEqual(metadata.robots, NOINDEX_ROBOTS);
    assert.equal((metadata.robots as Loose).index, false);
    assert.equal((metadata.robots as Loose).follow, true);
  });

  it("declares no canonical when no path is given (filtered views)", () => {
    const metadata = buildPageMetadata({ title: "Articles", noindex: true });

    assert.ok(!(metadata.alternates as Loose).canonical);
  });

  it("keeps the RSS link on every page, since Next replaces `alternates` wholesale", () => {
    const metadata = buildPageMetadata({ title: "Articles", path: "/articles" });

    assert.equal(
      (metadata.alternates as Loose).types["application/rss+xml"],
      `${SITE_URL}/feed.xml`,
    );
  });

  it("uses the brand template for short titles and drops it for long ones", () => {
    const short = buildPageMetadata({ title: "Subscribe" });
    const long = buildPageMetadata({
      title: "Rebuilding the Skin Barrier After Inflammatory Conditions: A Practical Perspective",
    });

    assert.equal(short.title, "Subscribe");
    assert.deepEqual(long.title, {
      absolute:
        "Rebuilding the Skin Barrier After Inflammatory Conditions: A Practical Perspective",
    });
  });

  it("honours an explicit absolute title (the home page)", () => {
    const metadata = buildPageMetadata({ title: SITE.homeTitle, absoluteTitle: true });

    assert.deepEqual(metadata.title, { absolute: SITE.homeTitle });
  });

  it("clamps the description for the meta tag and for social cards alike", () => {
    const metadata = buildPageMetadata({ title: "T", description: "word ".repeat(200) });

    assert.ok((metadata.description as string).length <= 160);
    assert.equal(metadata.description, (metadata.openGraph as Loose).description);
    assert.equal(metadata.description, (metadata.twitter as Loose).description);
  });

  it("falls back to the site description and the default share image", () => {
    const metadata = buildPageMetadata({ title: "T" });
    const image = (metadata.openGraph as Loose).images[0];

    assert.equal(metadata.description, SITE.description);
    assert.equal(image.url, `${SITE_URL}${SITE.shareImage.path}`);
    assert.equal(image.width, 1200);
    assert.equal(image.height, 630);
  });

  it("uses a summary_large_image Twitter card with an absolute image", () => {
    const metadata = buildPageMetadata({
      title: "T",
      image: { url: "/images/x.png", alt: "x" },
    });

    assert.equal((metadata.twitter as Loose).card, "summary_large_image");
    assert.equal((metadata.twitter as Loose).images[0].url, `${SITE_URL}/images/x.png`);
  });

  it("builds Open Graph article tags for articles", () => {
    const metadata = buildPageMetadata({
      title: "A story",
      path: "/articles/a-story",
      type: "article",
      article: {
        publishedTime: new Date("2026-09-01T10:00:00.000Z"),
        modifiedTime: new Date("2026-09-02T10:00:00.000Z"),
        authors: ["Jane Doe"],
        section: "Beauty",
        tags: ["Hair"],
      },
    });
    const og = metadata.openGraph as Loose;

    assert.equal(og.type, "article");
    assert.equal(og.publishedTime, "2026-09-01T10:00:00.000Z");
    assert.equal(og.modifiedTime, "2026-09-02T10:00:00.000Z");
    assert.deepEqual(og.authors, ["Jane Doe"]);
    assert.equal(og.section, "Beauty");
    assert.deepEqual(og.tags, ["Hair"]);
  });

  it("does not leak article fields into website cards", () => {
    const og = buildPageMetadata({ title: "T", path: "/x" }).openGraph as Loose;

    assert.equal(og.type, "website");
    assert.ok(!("publishedTime" in og));
  });
});
