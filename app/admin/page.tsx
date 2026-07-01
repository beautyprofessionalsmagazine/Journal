import Link from "next/link";

import { AdminLayout, AdminStatCard } from "@/features/admin";
import { articles, getAdminStats } from "@/features/articles";

export default function AdminOverviewPage() {
  const stats = getAdminStats();

  return (
    <AdminLayout
      action={
        <Link
          className="min-w-40 border border-black bg-white px-5 py-3 text-center [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
          href="/admin/articles/new"
        >
          Create Article
        </Link>
      }
      description="A simple editorial control room for local article data, publishing status, and reading counts."
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
            detail="Local seed reading counts"
            label="Total readings"
            value={stats.totalReadings.toLocaleString()}
          />
          <AdminStatCard
            detail={stats.popularThisWeek?.title}
            label="Most popular this week"
            value={stats.popularThisWeek?.readingCount.toLocaleString() ?? "0"}
          />
          <AdminStatCard
            detail={stats.popularTag}
            label="Most popular tag"
            value={stats.popularTag}
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="border border-black/15">
            <div className="border-b border-black/15 p-5">
              <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
                Recent Articles
              </h2>
            </div>
            <div className="divide-y divide-black/10">
              {stats.recentArticles.map((article) => (
                <article
                  className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center"
                  key={article.id}
                >
                  <div>
                    <h3 className="[font-family:var(--font-editorial-title)] text-2xl font-bold">
                      {article.title}
                    </h3>
                    <p className="mt-1 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                      {article.category} / {article.subcategory}
                    </p>
                  </div>
                  <span className="w-fit border border-black px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
                    {article.status}
                  </span>
                </article>
              ))}
            </div>
          </div>
          <div className="border border-black/15 p-5">
            <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
              Publishing Split
            </h2>
            <dl className="mt-5 grid gap-4 [font-family:var(--font-editorial-sans)] text-sm">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <dt>Published</dt>
                <dd>{articles.filter((article) => article.status === "published").length}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <dt>Drafts</dt>
                <dd>{articles.filter((article) => article.status === "draft").length}</dd>
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
