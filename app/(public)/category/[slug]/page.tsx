import type { Metadata } from "next";

import {
  CategoryPage,
  getCategoryMetadata,
  getDynamicCategoryRouteParams,
} from "@/features/categories";

type CategoryRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getDynamicCategoryRouteParams();
}

export async function generateMetadata({
  params,
}: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;

  return getCategoryMetadata(slug);
}

export default async function Page({ params }: CategoryRouteProps) {
  const { slug } = await params;

  return <CategoryPage slug={slug} />;
}
