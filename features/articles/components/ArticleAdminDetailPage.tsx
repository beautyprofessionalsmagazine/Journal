import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminLayout } from "@/features/admin";
import { ArticleBody } from "@/features/articles/components/ArticleBody";
import { getArticleById } from "@/features/articles/server/article-queries";
import type { TiptapDocument } from "@/features/articles/types/article";

type ArticleAdminDetailPageProps = {
  id: string;
};

export async function ArticleAdminDetailPage({
  id,
}: ArticleAdminDetailPageProps) {
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <AdminLayout
      action={
        <Link
          className="min-w-40 border border-black bg-white px-5 py-3 text-center [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
          href="/admin/articles/create"
        >
          Create Another
        </Link>
      }
      description="Stored article data is shown here while the edit workflow is still being built."
      title="Article Saved"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex flex-col gap-6">
          {article.coverImage ? (
            <div className="relative h-[360px] overflow-hidden border border-black/15">
              <Image
                alt={article.coverImageAlt ?? article.title}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1280px) 820px, 100vw"
                src={article.coverImage}
              />
            </div>
          ) : null}

          <div className="border border-black/15 p-6">
            <h2 className="[font-family:var(--font-editorial-title)] text-4xl font-bold leading-tight">
              {article.title}
            </h2>
            <p className="mt-3 [font-family:var(--font-editorial-sans)] text-sm uppercase text-black/62">
              {article.category} / {article.author}
            </p>
            {article.description ? (
              <p className="mt-5 [font-family:var(--font-editorial-body-serif)] text-lg leading-8 text-black/82">
                {article.description}
              </p>
            ) : null}
          </div>

          <div className="border border-black/15 p-6">
            <h3 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
              Article body
            </h3>
            <div className="mt-5">
              <ArticleBody content={article.contentJson as TiptapDocument | null} />
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="border border-black/15 p-5">
            <h3 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
              Details
            </h3>
            <dl className="mt-5 grid gap-4 [font-family:var(--font-editorial-sans)] text-sm">
              <MetadataRow label="Status" value={article.status} />
              <MetadataRow label="Slug" value={article.slug} />
              <MetadataRow
                label="Published"
                value={
                  article.publishedAt
                    ? article.publishedAt.toLocaleString()
                    : "Not published"
                }
              />
              <MetadataRow label="Views" value={String(article.views)} />
              <MetadataRow
                label="Created"
                value={article.createdAt.toLocaleString()}
              />
              <MetadataRow
                label="Updated"
                value={article.updatedAt.toLocaleString()}
              />
            </dl>
          </div>

          <div className="border border-black/15 p-5">
            <h3 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
              Tags
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {article.tags.length > 0 ? (
                article.tags.map((tag) => (
                  <span
                    className="border border-black/15 px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs uppercase"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/50">
                  No tags added.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
}

type MetadataRowProps = {
  label: string;
  value: string;
};

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-3">
      <dt>{label}</dt>
      <dd className="text-right text-black/62">{value}</dd>
    </div>
  );
}
