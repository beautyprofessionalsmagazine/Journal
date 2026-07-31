import { AdminLayout, AdminStatCard } from "@/features/admin";
import { getAdminStats } from "@/features/articles";
import { ButtonLink, EmptyState } from "@/shared/components/ui";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

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
      description="A database-backed editorial control room for publishing status and article views."
      title="Overview"
    >
      <div className="flex flex-col gap-10">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            detail={`${stats.publishedCount} published, ${stats.draftCount} drafts`}
            label="Total articles"
            value={String(stats.totalArticles)}
          />
          <AdminStatCard
            detail="Across all database articles"
            label="Total views"
            value={stats.totalViews.toLocaleString()}
          />
          <AdminStatCard
            detail={stats.popularThisWeek?.title}
            label="Most popular this week"
            value={stats.popularThisWeek?.views.toLocaleString() ?? "0"}
          />
          <AdminStatCard
            detail={stats.popularTag}
            label="Most popular tag"
            value={stats.popularTag}
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div
            className="surface-transition border border-black/15"
            data-reveal
          >
            <div className="border-b border-black/15 p-5">
              <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
                Recent Articles
              </h2>
            </div>
            <div className="divide-y divide-black/10">
              {stats.recentArticles.length > 0 ? (
                stats.recentArticles.map((article) => (
                  <article
                    className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center"
                    key={article.id}
                  >
                    <div>
                      <h3 className="[font-family:var(--font-editorial-title)] text-2xl font-bold">
                        {article.title}
                      </h3>
                      <p className="mt-1 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                        {article.category} / {article.author}
                      </p>
                    </div>
                    <span className="w-fit border border-black px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
                      {article.status}
                    </span>
                  </article>
                ))
              ) : (
                <EmptyState
                  align="left"
                  className="border-0 px-5"
                  description="New and recently updated records will appear here."
                  kicker="Editorial desk"
                  size="compact"
                  title="No recent articles"
                />
              )}
            </div>
          </div>
          <div
            className="surface-transition border border-black/15 p-5"
            data-reveal
          >
            <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
              Publishing Split
            </h2>
            <dl className="mt-5 grid gap-4 [font-family:var(--font-editorial-sans)] text-sm">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <dt>Published</dt>
                <dd>{stats.publishedCount}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <dt>Drafts</dt>
                <dd>{stats.draftCount}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <dt>Popular this month</dt>
                <dd>{stats.popularThisMonth?.title ?? "None"}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
