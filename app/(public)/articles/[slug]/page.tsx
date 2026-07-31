import type { Metadata } from "next";

import {
  ArticleDetailPage,
  getPublishedArticleBySlug,
  getPublishedArticleRouteParams,
} from "@/features/articles";

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

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
  };
}

export default async function Page({ params }: ArticleDetailRouteProps) {
  const { slug } = await params;

  return <ArticleDetailPage slug={slug} />;
}
