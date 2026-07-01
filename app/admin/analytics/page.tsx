import { AdminLayout } from "@/features/admin";
import { articles, getAdminStats } from "@/features/articles";

const readsByWeek = [
  { label: "Week 1", value: 6200 },
  { label: "Week 2", value: 7100 },
  { label: "Week 3", value: 8400 },
  { label: "Week 4", value: 9300 },
];

const readsByMonth = [
  { label: "April", value: 12200 },
  { label: "May", value: 24800 },
  { label: "June", value: 31500 },
];

export default function AdminAnalyticsPage() {
  const stats = getAdminStats();
  const popularArticles = [...articles]
    .sort((a, b) => b.readingCount - a.readingCount)
    .slice(0, 5);

  return (
    <AdminLayout
      description="Mocked local analytics for reads, tags, and popular articles."
      title="Analytics"
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <AnalyticsPanel items={readsByWeek} title="Reads by week" />
        <AnalyticsPanel items={readsByMonth} title="Reads by month" />
        <section className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Popular tags
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {[stats.popularTag, "Beauty", "Business", "Nails", "Culture"].map(
              (tag) => (
                <span
                  className="border border-black px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase"
                  key={tag}
                >
                  {tag}
                </span>
              ),
            )}
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
                  {article.readingCount.toLocaleString()}
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
  const maxValue = Math.max(...items.map((item) => item.value));

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
