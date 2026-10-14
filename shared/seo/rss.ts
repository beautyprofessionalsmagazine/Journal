import { FEED_PATH, absoluteUrl } from "@/shared/seo/site";

export type RssItem = {
  title: string;
  /** Site path of the article, e.g. "/articles/some-story". */
  path: string;
  description: string;
  publishedAt: Date;
  category?: string;
  tags?: readonly string[];
  /** The author's name only (no byline prefix or ISSN). */
  author?: string;
};

export type RssFeedInput = {
  title: string;
  description: string;
  language: string;
  lastBuildDate: Date | null;
  items: readonly RssItem[];
};

/** Escapes text for use in XML element content and attribute values. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Control characters other than tab, LF and CR are not legal in XML 1.0.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function tag(name: string, value: string): string {
  return `<${name}>${escapeXml(value)}</${name}>`;
}

/**
 * RSS 2.0 with an Atom self link. Hand-built (it is a few dozen lines) so the
 * feed adds no dependency. `guid` is the canonical article URL.
 */
export function buildRssFeed(input: RssFeedInput): string {
  const home = absoluteUrl("/");
  const items = input.items.map((item) => {
    const url = absoluteUrl(item.path);
    const categories = [item.category, ...(item.tags ?? [])]
      .filter((value): value is string => Boolean(value))
      .map((value) => tag("category", value));

    return [
      "<item>",
      tag("title", item.title),
      tag("link", url),
      `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
      tag("pubDate", item.publishedAt.toUTCString()),
      tag("description", item.description),
      ...(item.author ? [tag("dc:creator", item.author)] : []),
      ...categories,
      "</item>",
    ].join("");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    tag("title", input.title),
    tag("link", home),
    tag("description", input.description),
    tag("language", input.language),
    `<atom:link href="${escapeXml(absoluteUrl(FEED_PATH))}" rel="self" type="application/rss+xml"/>`,
    ...(input.lastBuildDate
      ? [tag("lastBuildDate", input.lastBuildDate.toUTCString())]
      : []),
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");
}
