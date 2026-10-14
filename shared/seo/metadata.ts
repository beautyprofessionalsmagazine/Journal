import type { Metadata } from "next";

import { FEED_PATH, SITE, absoluteUrl } from "@/shared/seo/site";
import { clampText, fitsBrandTemplate } from "@/shared/seo/text";

/**
 * Next.js replaces a nested metadata field wholesale (it does not deep-merge),
 * so every page that sets `robots` must repeat the Googlebot directives. Both
 * shapes live here so no page has to remember them.
 *
 * `max-image-preview:large` is what lets Google show full-width images for
 * these pages in Discover and Search.
 */
export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
} as const satisfies NonNullable<Metadata["robots"]>;

/** Excluded from the index, but links on the page are still followed. */
export const NOINDEX_ROBOTS = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
} as const satisfies NonNullable<Metadata["robots"]>;

/** For private surfaces (admin): neither indexed nor followed, never cached. */
export const PRIVATE_ROBOTS = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
} as const satisfies NonNullable<Metadata["robots"]>;

export type SeoImage = {
  /** Absolute URL, or a site path that will be made absolute. */
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type ArticleSeoDetails = {
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authors?: string[];
  section?: string;
  tags?: string[];
};

export type PageSeoInput = {
  /** The page <title> before the " | Brand" template is applied. */
  title: string;
  /**
   * Drop the " | Brand" suffix. Set for the home page (which has its own full
   * title) and for titles too long to carry the suffix without truncation.
   */
  absoluteTitle?: boolean;
  /** Title for Open Graph / Twitter; defaults to `title`. */
  socialTitle?: string;
  description?: string | null;
  /** Canonical path or absolute URL. Omit on pages that must not declare one. */
  path?: string;
  noindex?: boolean;
  image?: SeoImage | null;
  type?: "website" | "article";
  article?: ArticleSeoDetails;
};

export function getDefaultShareImage(): SeoImage {
  return {
    url: SITE.shareImage.path,
    width: SITE.shareImage.width,
    height: SITE.shareImage.height,
    alt: SITE.shareImage.alt,
  };
}

/**
 * Builds the complete <head> metadata for a page: title, description,
 * canonical, robots, Open Graph and Twitter. Pages call this instead of
 * assembling the object by hand, so canonicalization and social tags stay
 * consistent everywhere.
 */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const description = clampText(input.description || SITE.description);
  const socialTitle = input.socialTitle ?? input.title;
  const image = input.image ?? getDefaultShareImage();
  const absoluteTitle =
    input.absoluteTitle ?? !fitsBrandTemplate(input.title, SITE.name);
  const canonical = input.path ? absoluteUrl(input.path) : undefined;
  const openGraphImage = {
    url: absoluteUrl(image.url),
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
    alt: image.alt ?? socialTitle,
  };
  const isArticle = input.type === "article";

  const openGraphBase = {
    siteName: SITE.name,
    locale: SITE.locale,
    title: socialTitle,
    description,
    ...(canonical ? { url: canonical } : {}),
    images: [openGraphImage],
  };

  return {
    title: absoluteTitle ? { absolute: input.title } : input.title,
    description,
    // Next.js replaces `alternates` wholesale per segment, so the feed link
    // (feed autodiscovery) is repeated here rather than set only in the layout.
    alternates: {
      ...(canonical ? { canonical } : {}),
      types: { "application/rss+xml": absoluteUrl(FEED_PATH) },
    },
    robots: input.noindex ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
    openGraph:
      isArticle && input.article
        ? {
            ...openGraphBase,
            type: "article",
            publishedTime: input.article.publishedTime?.toISOString(),
            modifiedTime: input.article.modifiedTime?.toISOString(),
            authors: input.article.authors,
            section: input.article.section,
            tags: input.article.tags,
          }
        : { ...openGraphBase, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: openGraphImage.url, alt: openGraphImage.alt }],
    },
  };
}
