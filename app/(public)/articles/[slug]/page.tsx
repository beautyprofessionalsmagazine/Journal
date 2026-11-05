import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ArticleDetailPage,
  getPublishedArticleBySlug,
  getPublishedArticleRouteParams,
} from "@/features/articles";
import { getArticleMetadata } from "@/features/articles/seo/article-seo";

type ArticleDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getPublishedArticleRouteParams();
}

export async function generateMetadata({
  params,
}: ArticleDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await getPublishedArticleBySlug(slug);

  // Resolving a missing article here (not only in the page) gives crawlers a
  // real 404 status; a lookup that merely returned `{}` produced a 200 page.
  if (!article) {
    notFound();
  }

  return getArticleMetadata(article);
}

export default async function Page({ params }: ArticleDetailRouteProps) {
  const { slug } = await params;

  return <ArticleDetailPage slug={slug} />;
}
