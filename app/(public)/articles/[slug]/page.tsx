import type { Metadata } from "next";

import {
  ArticleDetailPage,
  getArticleMetadata,
  getArticleRouteParams,
} from "@/features/articles";

type ArticleDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getArticleRouteParams();
}

export async function generateMetadata({
  params,
}: ArticleDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;

  return getArticleMetadata(slug);
}

export default async function Page({ params }: ArticleDetailRouteProps) {
  const { slug } = await params;

  return <ArticleDetailPage slug={slug} />;
}
