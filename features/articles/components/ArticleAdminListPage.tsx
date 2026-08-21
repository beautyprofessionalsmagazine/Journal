import Image from "next/image";

import { AdminLayout } from "@/features/admin";
import { listArticles } from "@/features/articles/server/article-queries";
import { ButtonLink, EmptyState } from "@/shared/components/ui";

export async function ArticleAdminListPage() {
  const articles = await listArticles();

  return (
    <AdminLayout
      action={
        <ButtonLink
          className="min-w-40"
          href="/admin/articles/create"
          size="lg"
          variant="secondary"
        >
          Create Article
        </ButtonLink>
      }
      description="Review the database-backed article records created from the admin flow."
      title="Articles"
    >
      {articles.length === 0 ? (
        <EmptyState
          action={
            <ButtonLink href="/admin/articles/create">
              Create first article
            </ButtonLink>
          }
          description="Create the first article to populate the Journal database."
          headingLevel={2}
          kicker="Editorial desk"
          title="No articles yet"
        />
      ) : (
        <>
          <div className="divide-y divide-black border-y border-black lg:hidden">
            {articles.map((article) => (
              <article className="py-6" data-reveal key={article.id} suppressHydrationWarning>
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#eceae4]">
                    {article.coverImage ? (
                      <Image
                        alt={article.coverImageAlt ?? article.title}
                        className="object-cover"
                        fill
                        sizes="88px"
                        src={article.coverImage}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center [font-family:var(--font-editorial-title)] text-5xl font-bold text-black/15">
                        {article.category.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-black px-2 py-1 text-[0.62rem] font-semibold uppercase">
                        {article.status}
                      </span>
                      <span className="text-xs text-black/48">
                        {article.category}
                      </span>
                    </div>
                    <h2 className="mt-3 [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-2xl font-bold leading-[1.02]">
                      {article.title}
                    </h2>
                    <p className="mt-2 truncate text-xs text-black/48">
                      /{article.slug}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-3 border-y border-black/10 py-3 text-xs">
                  <div>
                    <dt className="font-semibold uppercase text-black/45">
                      Author
                    </dt>
                    <dd className="mt-1">{article.author}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase text-black/45">
                      Views
                    </dt>
                    <dd className="mt-1">{article.views.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase text-black/45">
                      Updated
                    </dt>
                    <dd className="mt-1">
                      {article.updatedAt.toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
                <ButtonLink
                  className="mt-4 w-full"
                  href={`/admin/articles/${article.id}/edit`}
                >
                  Edit article
                </ButtonLink>
              </article>
            ))}
          </div>

          <div
            className="surface-transition hidden overflow-x-auto border border-black/15 lg:block"
            data-reveal
            suppressHydrationWarning
          >
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-black/15 bg-black text-white">
              <tr className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr className="border-b border-black/10 align-top" key={article.id}>
                  <td className="px-4 py-4">
                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
                      <div className="relative h-[72px] w-[72px] overflow-hidden border border-black/10 bg-black/[0.03]">
                        {article.coverImage ? (
                          <Image
                            alt={article.coverImageAlt ?? article.title}
                            className="object-cover"
                            fill
                            sizes="72px"
                            src={article.coverImage}
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="[font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
                          {article.title}
                        </p>
                        <p className="mt-1 [font-family:var(--font-editorial-sans)] text-xs text-black/58">
                          {article.slug}
                        </p>
                        {article.description ? (
                          <p className="mt-2 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                            {article.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 [font-family:var(--font-editorial-sans)] text-sm">
                    {article.category}
                    <span className="mt-1 block text-black/58">{article.author}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
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
                        <span className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/50">
                          No tags
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="border border-black px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 [font-family:var(--font-editorial-sans)] text-sm">
                    {article.views}
                  </td>
                  <td className="px-4 py-4 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                    {article.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <ButtonLink
                      href={`/admin/articles/${article.id}/edit`}
                      variant="outline"
                    >
                      Edit
                    </ButtonLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
