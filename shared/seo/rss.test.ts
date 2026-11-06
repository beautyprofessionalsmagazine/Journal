import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildRssFeed, escapeXml } from "@/shared/seo/rss";
import { SITE_URL } from "@/shared/seo/site";

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    assert.equal(escapeXml(`<a href="x">Tom & 'Jerry'</a>`), "&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;");
  });

  it("drops characters that are illegal in XML 1.0", () => {
    assert.equal(escapeXml(`a${String.fromCharCode(0)}b${String.fromCharCode(11)}c`), "abc");
    assert.equal(escapeXml("tab\there\nnewline"), "tab\there\nnewline");
  });
});

describe("buildRssFeed", () => {
  const xml = buildRssFeed({
    title: "Beauty Professionals Magazine",
    description: "Interviews & insight",
    language: "en",
    lastBuildDate: new Date("2026-10-08T12:00:00.000Z"),
    items: [
      {
        title: "Men's Haircut Design <Part 1>",
        path: "/articles/mens-haircut-design",
        description: "A method & its results.",
        publishedAt: new Date("2026-10-01T09:30:00.000Z"),
        category: "Beauty",
        tags: ["Hair", "Barbering"],
        author: "Jane Doe",
      },
      {
        title: "No author",
        path: "/articles/no-author",
        description: "Plain.",
        publishedAt: new Date("2026-09-01T09:30:00.000Z"),
      },
    ],
  });

  it("is an RSS 2.0 document with an XML declaration and an Atom self link", () => {
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.match(xml, /<rss version="2\.0"/);
    assert.ok(xml.includes(`<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>`));
  });

  it("uses the canonical article URL as both link and guid", () => {
    assert.ok(xml.includes(`<link>${SITE_URL}/articles/mens-haircut-design</link>`));
    assert.ok(xml.includes(`<guid isPermaLink="true">${SITE_URL}/articles/mens-haircut-design</guid>`));
  });

  it("escapes item text so the feed stays well-formed", () => {
    assert.ok(xml.includes("<title>Men&apos;s Haircut Design &lt;Part 1&gt;</title>"));
    // Every ampersand is part of an entity.
    assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml));
  });

  it("formats dates as RFC 822 and lists the creator and categories", () => {
    assert.ok(xml.includes("<pubDate>Thu, 01 Oct 2026 09:30:00 GMT</pubDate>"));
    assert.ok(xml.includes("<dc:creator>Jane Doe</dc:creator>"));
    assert.ok(xml.includes("<category>Beauty</category>"));
    assert.ok(xml.includes("<category>Barbering</category>"));
  });

  it("omits the creator for an item without an author", () => {
    const second = xml.split("<item>")[2];

    assert.ok(!second.includes("dc:creator"));
  });

  it("balances every opening and closing item tag", () => {
    assert.equal(xml.split("<item>").length, xml.split("</item>").length);
    assert.equal(xml.split("<item>").length - 1, 2);
  });
});
