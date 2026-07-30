import { AdminLayout } from "@/features/admin";
import { getAdminStats, listArticles } from "@/features/articles";

export default async function AdminAnalyticsPage() {
  const [stats, articles] = await Promise.all([
    getAdminStats(),
    listArticles(),
  ]);
  const popularArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <AdminLayout
      description="Database-backed totals, tags, and popular articles."
      title="Analytics"
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <AnalyticsPanel
          items={[
            { label: "Published", value: stats.publishedCount },
            { label: "Drafts", value: stats.draftCount },
            { label: "Total views", value: stats.totalViews },
          ]}
          title="Database totals"
        />
        <section className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Popular tags
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {getTagsByViews(articles).map((tag) => (
                <span
                  className="border border-black px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
          </div>
        </section>
        <section className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Popular articles
          </h2>
          <ol className="mt-5 grid gap-4">
            {popularArticles.map((article) => (
              <li
                className="flex items-start justify-between gap-4 border-b border-black/10 pb-3"
                key={article.id}
              >
                <span className="[font-family:var(--font-editorial-sans)] text-sm leading-6">
                  {article.title}
                </span>
                <span className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                  {article.views.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AdminLayout>
  );
}

type AnalyticsPanelProps = {
  title: string;
  items: {
    label: string;
    value: number;
  }[];
};

function AnalyticsPanel({ title, items }: AnalyticsPanelProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="border border-black/15 p-5">
      <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
        {title}
      </h2>
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <div className="grid gap-2" key={item.label}>
            <div className="flex items-center justify-between [font-family:var(--font-editorial-sans)] text-sm">
              <span>{item.label}</span>
              <span>{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-black/10">
              <div
                className="h-full bg-black"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getTagsByViews(
  articles: Awaited<ReturnType<typeof listArticles>>,
) {
  const tagViews = new Map<string, number>();

  articles.forEach((article) => {
    article.tags.forEach((tag) => {
      tagViews.set(tag, (tagViews.get(tag) ?? 0) + article.views);
    });
  });

  return [...tagViews.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}
