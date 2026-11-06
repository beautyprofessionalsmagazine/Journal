import type { Metadata } from "next";

import { pageJsonLd } from "@/shared/seo/json-ld";
import { buildPageMetadata } from "@/shared/seo/metadata";

/**
 * Every fixed (non-database) public page and its SEO treatment.
 *
 * `indexable: false` marks a page whose content is still a placeholder. Those
 * pages stay reachable (and linked from the footer) but carry `noindex` and are
 * left out of the sitemap, so search engines do not index "coming soon" copy as
 * if it were real content. When a page is finished, flip its flag to `true`;
 * the metadata, canonical and sitemap entry follow automatically.
 */
export type StaticPageSeo = {
  path: string;
  /** <title> before the " | Brand" template. */
  title: string;
  /** The title already names the publication, so skip the " | Brand" suffix. */
  absoluteTitle?: boolean;
  description: string;
  indexable: boolean;
  /** Point search engines at another URL instead (a near-duplicate page). */
  canonicalPath?: string;
  /** schema.org WebPage subtype used in JSON-LD. */
  schemaType?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
};

export const STATIC_PAGES = {
  about: {
    path: "/about",
    title: "About",
    description:
      "Beauty Professionals Magazine publishes interviews, industry notes, beauty reporting, and culture coverage for professionals and readers.",
    // Placeholder: the page holds only an intro sentence. Publish an editorial
    // mission, team and contact details, then flip this to true.
    indexable: false,
    schemaType: "AboutPage",
  },
  archive: {
    path: "/archive",
    title: "Archive",
    description:
      "A chronological archive of published Beauty Professionals Magazine stories.",
    // It renders the same grid as /articles, so it consolidates there.
    indexable: true,
    canonicalPath: "/articles",
  },
  careers: {
    path: "/careers",
    title: "Careers",
    description:
      "Open roles and contributor opportunities will be listed here as the editorial team grows.",
    indexable: false,
  },
  collaboration: {
    path: "/collaboration",
    title: "Collaboration",
    description:
      "Editorial partnerships, expert contributors, visual projects, and professional community collaborations.",
    indexable: false,
  },
  contacts: {
    path: "/contacts",
    title: "Contacts",
    description:
      "How to reach Beauty Professionals Magazine for editorial, partnership, and general inquiries.",
    indexable: false,
    schemaType: "ContactPage",
  },
  currentIssue: {
    path: "/current-issue",
    title: "Current Issue",
    description:
      "The current editorial focus and lead story from Beauty Professionals Magazine.",
    // Only echoes the featured article today; make it the latest Lookbook
    // edition before indexing it.
    indexable: false,
  },
  photovogue: {
    path: "/photovogue",
    title: "PhotoVogue",
    description:
      "Image-led editorials, portfolios, and beauty community submissions from Beauty Professionals Magazine.",
    indexable: false,
  },
  privacyPolicy: {
    path: "/privacy-policy",
    title: "Privacy Policy",
    description:
      "How Beauty Professionals Magazine handles personal data and protects its readers.",
    indexable: false,
  },
  userAgreement: {
    path: "/user-agreement",
    title: "User Agreement",
    description:
      "Terms for readers, contributors, and partners using the Beauty Professionals Magazine website.",
    indexable: false,
  },
  video: {
    path: "/video",
    title: "Video",
    description:
      "Interviews, behind-the-scenes reporting, and beauty industry video features.",
    indexable: false,
  },
  account: {
    path: "/account",
    title: "Account",
    description:
      "Reader and contributor account access for Beauty Professionals Magazine.",
    indexable: false,
  },
  // Real, finished pages. Their route files still build the metadata through
  // getStaticPageMetadata, so the sitemap and the <head> cannot drift apart.
  subscribe: {
    path: "/subscribe",
    title: "Subscribe: Free Copies for Beauty Professionals & Salons",
    description:
      "Free individual subscriptions for beauty professionals, printed copies for salons, and bulk delivery for schools, brands, distributors, Med Spas, and clinics.",
    indexable: true,
  },
  whereToFind: {
    path: "/where-to-find",
    title: "Where to Find Beauty Professionals Magazine",
    absoluteTitle: true,
    description:
      "Find Beauty Professionals Magazine at salons, beauty schools, Med Spas, and clinics across the United States. Search by state, city, or ZIP Code.",
    indexable: true,
  },
} as const satisfies Record<string, StaticPageSeo>;

export type StaticPageKey = keyof typeof STATIC_PAGES;

/**
 * Metadata for a fixed page. `overrides` lets a page whose copy depends on
 * live configuration (the subscribe page, while email delivery is paused)
 * replace the registry text without forking the rest of its treatment.
 */
export function getStaticPageMetadata(
  key: StaticPageKey,
  overrides: Partial<Pick<StaticPageSeo, "title" | "description">> = {},
): Metadata {
  const page: StaticPageSeo = STATIC_PAGES[key];

  return buildPageMetadata({
    title: overrides.title ?? page.title,
    absoluteTitle: page.absoluteTitle,
    description: overrides.description ?? page.description,
    path: page.canonicalPath ?? page.path,
    noindex: !page.indexable,
  });
}

/** Structured data for a fixed page; takes the same overrides as the metadata. */
export function getStaticPageJsonLd(
  key: StaticPageKey,
  overrides: Partial<Pick<StaticPageSeo, "title" | "description">> = {},
) {
  const page: StaticPageSeo = STATIC_PAGES[key];

  return pageJsonLd({
    path: page.path,
    name: overrides.title ?? page.title,
    description: overrides.description ?? page.description,
    type: page.schemaType,
  });
}

/** Static pages that belong in the sitemap (indexable and self-canonical). */
export function getSitemapStaticPages(): StaticPageSeo[] {
  return Object.values<StaticPageSeo>(STATIC_PAGES).filter(
    (page) => page.indexable && !page.canonicalPath,
  );
}
