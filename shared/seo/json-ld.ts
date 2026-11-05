import { SITE, SITE_URL, absoluteUrl } from "@/shared/seo/site";

export type JsonLdNode = Record<string, unknown>;

/** Stable identifiers so nodes on different pages refer to the same entity. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERIODICAL_ID = `${SITE_URL}/#periodical`;

/**
 * Serializes structured data for an inline <script>. `JSON.stringify` alone
 * does not make arbitrary strings safe inside HTML: a "</script>" in an
 * article title would end the tag early. Escaping "<" (and the two JS line
 * separators) is the approach the Next.js documentation recommends.
 */
const BACKSLASH = String.fromCharCode(92);

/** Characters that must never appear raw inside an inline JSON-LD script. */
const UNSAFE_CODE_UNITS = [
  0x3c, // "<": could start a closing script tag or an HTML comment
  0x2028, // line separator: a line break for older JavaScript parsers
  0x2029, // paragraph separator: ditto
] as const;

/** The JSON unicode escape for one code unit: a backslash, "u", four hex digits. */
function unicodeEscape(codeUnit: number): string {
  return `${BACKSLASH}u${codeUnit.toString(16).padStart(4, "0")}`;
}

export function serializeJsonLd(data: unknown): string {
  let json = JSON.stringify(data) ?? "null";

  for (const codeUnit of UNSAFE_CODE_UNITS) {
    json = json.replaceAll(
      String.fromCharCode(codeUnit),
      unicodeEscape(codeUnit),
    );
  }

  return json;
}

export function jsonLdGraph(nodes: JsonLdNode[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.logo.path),
      width: SITE.logo.width,
      height: SITE.logo.height,
    },
    ...(SITE.sameAs.length > 0 ? { sameAs: [...SITE.sameAs] } : {}),
  };
}

/**
 * Drives the site name Google shows in results. Per Google, it belongs on the
 * home page and its name must match the <title>, og:site_name and headings.
 */
export function webSiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE.name,
    alternateName: [
      ...SITE.alternateNames,
      new URL(SITE_URL).hostname.toLowerCase(),
    ],
    inLanguage: SITE.inLanguage,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** The magazine as a serial publication, carrying its registered ISSN. */
export function periodicalNode(): JsonLdNode {
  return {
    "@type": "Periodical",
    "@id": PERIODICAL_ID,
    name: SITE.name,
    url: absoluteUrl("/"),
    issn: SITE.issn,
    inLanguage: SITE.inLanguage,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export type WebPageNodeInput = {
  path: string;
  name: string;
  description?: string | null;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  /** Reference the page's BreadcrumbList node (emit it with breadcrumbNode). */
  withBreadcrumb?: boolean;
};

export function webPageNode({
  path,
  name,
  description,
  type = "WebPage",
  withBreadcrumb = false,
}: WebPageNodeInput): JsonLdNode {
  const url = absoluteUrl(path);

  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: SITE.inLanguage,
    ...(withBreadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

/**
 * Structured data for an ordinary page: the publisher and site it belongs to
 * plus the page itself. Page-specific nodes (Article, BreadcrumbList ...) are
 * appended by the callers that have them.
 */
export function pageJsonLd(input: WebPageNodeInput) {
  return jsonLdGraph([organizationNode(), webSiteNode(), webPageNode(input)]);
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

/**
 * A BreadcrumbList. Only emit it when the same trail is visible on the page
 * (see the Breadcrumbs component): structured data must reflect what readers
 * can see.
 */
export function breadcrumbNode(
  pagePath: string,
  items: readonly BreadcrumbItem[],
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(pagePath)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type ArticleNodeInput = {
  path: string;
  headline: string;
  description?: string | null;
  /** Absolute image URLs, best first. */
  images: readonly string[];
  datePublished?: Date | null;
  dateModified?: Date | null;
  authorName?: string | null;
  section?: string | null;
  keywords?: readonly string[];
  wordCount?: number;
};

/** Google recommends concise headlines; long ones are truncated on some devices. */
const HEADLINE_MAX = 110;

export function articleNode(input: ArticleNodeInput): JsonLdNode {
  const url = absoluteUrl(input.path);
  const headline =
    input.headline.length > HEADLINE_MAX
      ? `${input.headline.slice(0, HEADLINE_MAX - 1).trimEnd()}…`
      : input.headline;

  return {
    "@type": "Article",
    "@id": `${url}#article`,
    // A reference to the page's own WebPage node, not a second definition of it.
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline,
    ...(input.description ? { description: input.description } : {}),
    ...(input.images.length > 0 ? { image: [...input.images] } : {}),
    ...(input.datePublished
      ? { datePublished: input.datePublished.toISOString() }
      : {}),
    ...(input.dateModified
      ? { dateModified: input.dateModified.toISOString() }
      : {}),
    // Google: use the person's name only, and an Organization when the byline
    // is the publication itself. Never invent an author.
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": PERIODICAL_ID },
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords && input.keywords.length > 0
      ? { keywords: [...input.keywords].join(", ") }
      : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
    inLanguage: SITE.inLanguage,
  };
}
