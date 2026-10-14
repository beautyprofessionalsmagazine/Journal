import type { Metadata } from "next";

import {
  normalizeCoverImageData,
  normalizeCoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import type { CoverImagePlacement } from "@/features/articles/lib/cover-placements";
import {
  countWords,
  getTiptapPlainText,
} from "@/features/articles/lib/article-text";
import type { Article } from "@/features/articles/types/article";
import {
  articleNode,
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  periodicalNode,
  webPageNode,
  webSiteNode,
  type BreadcrumbItem,
  type JsonLdNode,
} from "@/shared/seo/json-ld";
import { buildPageMetadata, type SeoImage } from "@/shared/seo/metadata";
import { absoluteUrl } from "@/shared/seo/site";
import {
  META_DESCRIPTION_MAX,
  clampText,
  getAuthorName,
} from "@/shared/seo/text";

export function getArticlePath(slug: string) {
  return `/articles/${slug}`;
}

type SeoArticle = Pick<
  Article,
  | "title"
  | "slug"
  | "category"
  | "author"
  | "description"
  | "coverImage"
  | "tags"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
  | "contentJson"
>;

function getGeneratedCover(
  article: Pick<SeoArticle, "coverImage">,
  placement: CoverImagePlacement,
) {
  const cover = normalizeCoverImageData(article.coverImage);

  if (!cover) {
    return null;
  }

  return normalizeCoverImageSettings(cover.settings).generatedImages[placement] ?? null;
}

/**
 * The cover images search and social platforms may use.
 *
 * - `share`: the 4:3 homepage-feature rendition (1600 x 1200). It is wider
 *   than the 1200 px Google Discover asks for and crops cleanly to the 1.91:1
 *   link-preview frame. Falls back to the untouched original upload.
 * - `structured`: every distinct rendition for Article JSON-LD, so Google can
 *   pick the aspect ratio it needs (4:3 and 4:5 are generated; the original
 *   covers whatever else the editor uploaded).
 */
export function getArticleImages(
  article: Pick<SeoArticle, "coverImage" | "title">,
): {
  share: SeoImage | null;
  structured: string[];
} {
  const cover = normalizeCoverImageData(article.coverImage);

  if (!cover) {
    return { share: null, structured: [] };
  }

  const alt = cover.alt || article.title;
  const feature = getGeneratedCover(article, "homepageFeature");
  const hero = getGeneratedCover(article, "articleHero");
  const share: SeoImage = feature
    ? { url: feature.url, width: feature.width, height: feature.height, alt }
    : { url: cover.src, alt };
  const structured = [feature?.url, hero?.url, cover.src].filter(
    (url): url is string => Boolean(url),
  );

  return { share, structured: [...new Set(structured)] };
}

/** The article's own description, or the opening of the body when it has none. */
export function getArticleDescription(article: SeoArticle): string {
  const description = article.description?.trim();

  if (description) {
    return clampText(description, META_DESCRIPTION_MAX);
  }

  return clampText(getTiptapPlainText(article.contentJson), META_DESCRIPTION_MAX);
}

export function getArticleMetadata(article: SeoArticle): Metadata {
  const { share } = getArticleImages(article);
  const authorName = getAuthorName(article.author);

  return buildPageMetadata({
    title: article.title,
    description: getArticleDescription(article),
    path: getArticlePath(article.slug),
    image: share,
    type: "article",
    article: {
      publishedTime: article.publishedAt ?? article.createdAt,
      modifiedTime: article.updatedAt,
      authors: authorName ? [authorName] : undefined,
      section: article.category,
      tags: article.tags,
    },
  });
}

/**
 * The page's structured data: WebPage + Article + BreadcrumbList, with the
 * publisher entities it points at. Each page carries the full definitions it
 * references because Google reads one page's JSON-LD at a time and does not
 * resolve `@id` references across pages.
 */
export function getArticleJsonLd(
  article: SeoArticle,
  breadcrumbs: readonly BreadcrumbItem[],
) {
  const path = getArticlePath(article.slug);
  const { structured } = getArticleImages(article);
  const description = getArticleDescription(article);
  const nodes: JsonLdNode[] = [
    organizationNode(),
    webSiteNode(),
    periodicalNode(),
    webPageNode({
      path,
      name: article.title,
      description,
      withBreadcrumb: true,
    }),
    articleNode({
      path,
      headline: article.title,
      description,
      images: structured.map((url) => absoluteUrl(url)),
      // An article published without a date still has a creation date; using
      // it is closer to the truth than leaving datePublished out.
      datePublished: article.publishedAt ?? article.createdAt,
      dateModified: article.updatedAt,
      authorName: getAuthorName(article.author) || null,
      section: article.category,
      keywords: article.tags,
      wordCount: countWords(getTiptapPlainText(article.contentJson)),
    }),
    breadcrumbNode(path, breadcrumbs),
  ];

  return jsonLdGraph(nodes);
}
