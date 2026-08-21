import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

import { AdminLayout, AdminStatCard } from "@/features/admin";
import {
  distributionPointIssueLabels,
  formatDistributionAddress,
  type DistributionLocation,
} from "@/features/distribution/types/distribution";
import type { Distributor } from "@/features/distribution/server/distribution-queries";
import { getDistributorDirectory } from "@/features/distribution/server/distribution-queries";
import { SiteSettingsButton } from "@/features/site-settings/components/SiteSettingsButton";
import { getSiteSettings } from "@/features/site-settings/server/site-settings-queries";
import { SubscriptionStatusControls } from "@/features/subscriptions/components/SubscriptionStatusControls";
import {
  formatSubscriptionAddress,
  getSubscriptionDisplayName,
  organizationTypeLabels,
  subscriptionStatusLabels,
  subscriptionTypeShortLabels,
} from "@/features/subscriptions/types/subscription";
import { EmptyState } from "@/shared/components/ui";

export async function DistributorsAdminPage() {
  const [{ office, distributors, stats }, siteSettings] = await Promise.all([
    getDistributorDirectory(),
    getSiteSettings(),
  ]);

  return (
    <AdminLayout
      action={<SiteSettingsButton settings={siteSettings} />}
      description="Every salon and school subscription and the address point it holds on the public Where to Find map."
      title="Distributors"
    >
      <div className="flex min-w-0 flex-col gap-[clamp(2.5rem,5vw,4rem)]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            detail="Salon and school subscriptions"
            label="Distributors"
            value={String(stats.total)}
          />
          <AdminStatCard
            detail={`${stats.total - stats.onMap} not published yet`}
            label="Points on the map"
            value={String(stats.onMap)}
          />
          <AdminStatCard
            detail="With at least one live point"
            label="States covered"
            value={String(stats.states)}
          />
          <AdminStatCard
            detail="Printed for published points"
            label="Copies per issue"
            value={String(stats.copiesPerIssue)}
          />
        </section>

        <OfficeCard office={office} />

        <section className="min-w-0" data-reveal>
          <div className="flex flex-col gap-4 border-b border-black pb-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="editorial-kicker flex items-center gap-2 text-black/45">
                <MapPin aria-hidden="true" size={16} />
                Address points
              </p>
              <h2 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none tracking-[-0.03em]">
                Distribution partners
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/62">
                Each row is one address point. Setting a distributor to{" "}
                <strong className="font-semibold">Active</strong> publishes its
                point on <Link className="focus-ring underline decoration-black/25 underline-offset-4" href="/where-to-find">Where to Find</Link>;
                canceling it takes the point down.
              </p>
            </div>
            <p className="shrink-0 [font-family:var(--font-editorial-title)] text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-none">
              {distributors.length}
            </p>
          </div>

          <div className="mt-6 min-w-0">
            {distributors.length === 0 ? (
              <EmptyState
                align="left"
                className="border-x-0 border-b-0"
                description="Salon and school requests from /subscribe land here, each with the address point it will hold on the map."
                kicker="Distribution desk"
                size="compact"
                title="No distributors yet"
              />
            ) : (
              <>
                <DistributorTable distributors={distributors} />
                <DistributorList distributors={distributors} />
              </>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function OfficeCard({ office }: { office: DistributionLocation | null }) {
  return (
    <section
      className="border border-black/15 p-[clamp(1.25rem,3vw,2rem)]"
      data-reveal
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="editorial-kicker text-black/45">Editorial office</p>
          <h2 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none">
            {office?.name ?? "No office address yet"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/62">
            {office
              ? formatDistributionAddress(office)
              : "Add the office address to anchor the distribution map."}
          </p>
        </div>
        {office ? <MapPointLink id={office.id} /> : null}
      </div>
    </section>
  );
}

function DistributorTable({ distributors }: { distributors: Distributor[] }) {
  return (
    <div className="hidden overflow-x-auto border border-black/15 lg:block">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        <thead className="bg-black text-white">
          <tr className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
            <th className="px-4 py-3">Distributor</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Copies</th>
            <th className="px-4 py-3">Address point</th>
            <th className="px-4 py-3">On the map</th>
            <th className="w-[19rem] px-4 py-3">Status / delivery</th>
          </tr>
        </thead>
        <tbody>
          {distributors.map(({ subscription, location, issue, stateName }) => (
            <tr
              className="border-b border-black/10 align-top last:border-b-0"
              key={subscription.id}
            >
              <td className="px-4 py-4">
                <p className="[font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
                  {getSubscriptionDisplayName(subscription)}
                </p>
                <p className="mt-1 text-xs text-black/58">
                  {subscription.contactPerson ?? "—"}
                </p>
                <a
                  className="focus-ring link-transition mt-1 inline-block break-all py-1 text-xs text-black/58 underline decoration-black/20 underline-offset-4"
                  href={`mailto:${subscription.email}`}
                >
                  {subscription.email}
                </a>
              </td>
              <td className="px-4 py-4 text-sm">
                <span className="inline-block whitespace-nowrap border border-black/15 px-2 py-1 text-xs uppercase">
                  {subscriptionTypeShortLabels[subscription.type]}
                </span>
                <span className="mt-2 block text-xs text-black/58">
                  {subscription.organizationType
                    ? organizationTypeLabels[subscription.organizationType]
                    : "—"}
                </span>
              </td>
              <td className="px-4 py-4 [font-family:var(--font-editorial-title)] text-2xl font-bold">
                {subscription.copies ?? "—"}
              </td>
              <td className="px-4 py-4 text-sm text-black/70">
                <span className="block">{subscription.addressLine1 ?? "—"}</span>
                {subscription.addressLine2 ? (
                  <span className="block">{subscription.addressLine2}</span>
                ) : null}
                <span className="block text-black/55">
                  {[subscription.city, subscription.state, subscription.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                {stateName ? (
                  <span className="block text-xs text-black/45">
                    {stateName}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-4">
                <MapPointBadge issue={issue} />
                {location ? (
                  <MapPointLink className="mt-3" id={location.id} />
                ) : null}
              </td>
              <td className="px-4 py-4">
                <SubscriptionStatusControls
                  deliveryStatus={subscription.deliveryStatus}
                  id={subscription.id}
                  status={subscription.status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistributorList({ distributors }: { distributors: Distributor[] }) {
  return (
    <div className="divide-y divide-black/12 border-y border-black lg:hidden">
      {distributors.map(({ subscription, location, issue }) => (
        <article className="py-6" key={subscription.id}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap border border-black px-2 py-1 text-[0.62rem] font-semibold uppercase">
              {subscriptionTypeShortLabels[subscription.type]}
            </span>
            <span className="text-xs text-black/48">
              {subscriptionStatusLabels[subscription.status]}
            </span>
            {subscription.copies ? (
              <span className="text-xs text-black/48">
                {subscription.copies} copies
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-2xl font-bold leading-[1.02]">
            {getSubscriptionDisplayName(subscription)}
          </h3>
          <a
            className="focus-ring link-transition mt-1 inline-block break-all py-1 text-xs text-black/58 underline decoration-black/20 underline-offset-4"
            href={`mailto:${subscription.email}`}
          >
            {subscription.email}
          </a>
          <dl className="mt-4 grid gap-3 border-y border-black/10 py-4 text-xs sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="font-semibold uppercase text-black/45">
                Address point
              </dt>
              <dd className="mt-1 text-black/70">
                {formatSubscriptionAddress(subscription) || "—"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase text-black/45">
                On the map
              </dt>
              <dd className="mt-2">
                <MapPointBadge issue={issue} />
              </dd>
            </div>
            {location ? (
              <div className="self-end">
                <MapPointLink id={location.id} />
              </div>
            ) : null}
          </dl>
          <div className="mt-4">
            <SubscriptionStatusControls
              deliveryStatus={subscription.deliveryStatus}
              id={subscription.id}
              layout="row"
              status={subscription.status}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function MapPointBadge({ issue }: { issue: Distributor["issue"] }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.06em] ${
        issue ? "border-black/20 text-black/45" : "border-black text-black"
      }`}
    >
      <MapPin aria-hidden="true" size={12} />
      {issue ? distributionPointIssueLabels[issue] : "Published"}
    </span>
  );
}

/** Opens the public map with this point highlighted. */
function MapPointLink({ className, id }: { className?: string; id: string }) {
  return (
    <Link
      className={`focus-ring link-transition inline-flex items-center gap-1.5 py-1 text-xs text-black/62 underline decoration-black/20 underline-offset-4 hover:text-black ${className ?? ""}`}
      href={`/where-to-find?location=${encodeURIComponent(id)}`}
    >
      <ExternalLink aria-hidden="true" size={13} />
      View on map
    </Link>
  );
}
