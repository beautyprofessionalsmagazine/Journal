import Link from "next/link";

import { getFeaturedArticle } from "@/features/articles";
import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function CurrentIssuePage() {
  const featuredArticle = getFeaturedArticle();

  return (
    <PublicLayout>
      <InfoPage
        description="The current editorial focus and lead story from Beauty Professionals Magazine."
        title="Current Issue"
      >
        {featuredArticle ? (
          <article className="border-y border-black/15 py-12">
            <h2 className="[font-family:var(--font-editorial-title)] text-4xl font-bold leading-tight text-black">
              <Link href={`/articles/${featuredArticle.slug}`}>
                {featuredArticle.title}
              </Link>
            </h2>
            <p className="mt-4 max-w-2xl [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
              {featuredArticle.annotation}
            </p>
          </article>
        ) : null}
      </InfoPage>
    </PublicLayout>
  );
}
