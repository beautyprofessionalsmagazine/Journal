import { Mail, Package } from "lucide-react";

import { AdminLayout, AdminStatCard } from "@/features/admin";
import { SiteSettingsButton } from "@/features/site-settings/components/SiteSettingsButton";
import { getSiteSettings } from "@/features/site-settings/server/site-settings-queries";
import { SubscriptionStatusControls } from "@/features/subscriptions/components/SubscriptionStatusControls";
import { isResendConfigured } from "@/features/subscriptions/server/subscription-email";
import { getGroupedSubscriptions } from "@/features/subscriptions/server/subscription-queries";
import {
  formatSubscriptionAddress,
  getSubscriptionDisplayName,
  organizationTypeLabels,
  subscriptionStatusLabels,
  subscriptionTypeLabels,
  subscriptionTypeShortLabels,
  type Subscription,
} from "@/features/subscriptions/types/subscription";
import { getUsStateName } from "@/shared/config/us-states";
import { EmptyState } from "@/shared/components/ui";

export async function SubscriptionAdminPage() {
  const [{ digital, physical, stats }, siteSettings] = await Promise.all([
    getGroupedSubscriptions(),
    getSiteSettings(),
  ]);
  const emailReady = isResendConfigured();

  return (
    <AdminLayout
      action={<SiteSettingsButton settings={siteSettings} />}
      description="Every subscription request, split into digital delivery and printed distribution."
      title="Subscriptions"
    >
      <div className="flex min-w-0 flex-col gap-[clamp(2.5rem,5vw,4rem)]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            detail={`${stats.pending} pending, ${stats.canceled} canceled`}
            label="Total subscriptions"
            value={String(stats.total)}
          />
          <AdminStatCard
            detail="Active across both groups"
            label="Active"
            value={String(stats.active)}
          />
          <AdminStatCard
            detail="Individual professionals"
            label="Digital"
            value={String(stats.digital)}
          />
          <AdminStatCard
            detail={`${stats.copiesPerIssue} copies per issue`}
            label="Physical"
            value={String(stats.physical)}
          />
        </section>

        <SubscriptionGroup
          count={digital.length}
          description="Individual professionals who receive the magazine and related news by email."
          icon={<Mail aria-hidden="true" size={16} />}
          kicker="Delivered by email"
          notice={
            emailReady
              ? "Resend is configured — confirmation and approval emails are being sent."
              : "Email delivery is idle. Set RESEND_API_KEY and RESEND_FROM_EMAIL to start sending confirmation and approval emails."
          }
          noticeTone={emailReady ? "ready" : "idle"}
          title="Digital subscriptions"
        >
          {digital.length === 0 ? (
            <EmptyState
              align="left"
              className="border-x-0 border-b-0"
              description="Individual subscription requests will appear here as soon as the first professional signs up."
              kicker="Digital desk"
              size="compact"
              title="No digital subscriptions yet"
            />
          ) : (
            <>
              <DigitalTable subscriptions={digital} />
              <MobileList subscriptions={digital} />
            </>
          )}
        </SubscriptionGroup>

        <SubscriptionGroup
          count={physical.length}
          description="Salons, schools, brands, distributors, Med Spas, and clinics receiving printed copies. Approved locations appear on the Where to Find map."
          icon={<Package aria-hidden="true" size={16} />}
          kicker="Shipped in print"
          title="Physical subscriptions"
        >
          {physical.length === 0 ? (
            <EmptyState
              align="left"
              className="border-x-0 border-b-0"
              description="Salon and school requests will appear here for approval and delivery tracking."
              kicker="Distribution desk"
              size="compact"
              title="No physical subscriptions yet"
            />
          ) : (
            <>
              <PhysicalTable subscriptions={physical} />
              <MobileList subscriptions={physical} />
            </>
          )}
        </SubscriptionGroup>
      </div>
    </AdminLayout>
  );
}

type SubscriptionGroupProps = {
  title: string;
  kicker: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  notice?: string;
  noticeTone?: "ready" | "idle";
  children: React.ReactNode;
};

function SubscriptionGroup({
  title,
  kicker,
  description,
  count,
  icon,
  notice,
  noticeTone = "idle",
  children,
}: SubscriptionGroupProps) {
  return (
    <section className="min-w-0" data-reveal>
      <div className="flex flex-col gap-4 border-b border-black pb-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="editorial-kicker flex items-center gap-2 text-black/45">
            {icon}
            {kicker}
          </p>
          <h2 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none tracking-[-0.03em]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/62">{description}</p>
        </div>
        <p className="shrink-0 [font-family:var(--font-editorial-title)] text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-none">
          {count}
        </p>
      </div>

      {notice ? (
        <p
          className={`mt-5 border-l-2 px-4 py-3 text-xs leading-6 ${
            noticeTone === "ready"
              ? "border-black bg-black/[0.03] text-black/70"
              : "border-black/30 bg-[#f6f4ef] text-black/62"
          }`}
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-6 min-w-0">{children}</div>
    </section>
  );
}

function DigitalTable({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="hidden overflow-x-auto border border-black/15 lg:block">
      <table className="w-full min-w-[960px] border-collapse text-left">
        <thead className="bg-black text-white">
          <tr className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
            <th className="px-4 py-3">Subscriber</th>
            <th className="px-4 py-3">Profession</th>
            <th className="px-4 py-3">Postal address</th>
            <th className="px-4 py-3">Received</th>
            <th className="w-[19rem] px-4 py-3">Status / delivery</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr
              className="border-b border-black/10 align-top last:border-b-0"
              key={subscription.id}
            >
              <td className="px-4 py-4">
                <p className="[font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
                  {getSubscriptionDisplayName(subscription)}
                </p>
                <a
                  className="focus-ring link-transition mt-1 inline-block break-all py-1 text-xs text-black/58 underline decoration-black/20 underline-offset-4"
                  href={`mailto:${subscription.email}`}
                >
                  {subscription.email}
                </a>
                <ConsentBadge consent={subscription.emailConsent} />
              </td>
              <td className="px-4 py-4 text-sm">
                {subscription.profession ?? "—"}
              </td>
              <td className="px-4 py-4 text-sm text-black/70">
                <AddressBlock subscription={subscription} />
              </td>
              <td className="px-4 py-4 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                {formatDate(subscription.createdAt)}
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

function PhysicalTable({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="hidden overflow-x-auto border border-black/15 lg:block">
      <table className="w-full min-w-[1040px] border-collapse text-left">
        <thead className="bg-black text-white">
          <tr className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Copies</th>
            <th className="px-4 py-3">Shipping address</th>
            <th className="px-4 py-3">Received</th>
            <th className="w-[19rem] px-4 py-3">Status / delivery</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
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
                <AddressBlock subscription={subscription} />
              </td>
              <td className="px-4 py-4 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                {formatDate(subscription.createdAt)}
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

function MobileList({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="divide-y divide-black/12 border-y border-black lg:hidden">
      {subscriptions.map((subscription) => (
        <article className="py-6" key={subscription.id}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap border border-black px-2 py-1 text-[0.62rem] font-semibold uppercase">
              {subscriptionTypeLabels[subscription.type]}
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
            {subscription.type === "individual" ? (
              <div>
                <dt className="font-semibold uppercase text-black/45">
                  Profession
                </dt>
                <dd className="mt-1">{subscription.profession ?? "—"}</dd>
              </div>
            ) : (
              <div>
                <dt className="font-semibold uppercase text-black/45">
                  Contact
                </dt>
                <dd className="mt-1">{subscription.contactPerson ?? "—"}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold uppercase text-black/45">
                Received
              </dt>
              <dd className="mt-1">{formatDate(subscription.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold uppercase text-black/45">Address</dt>
              <dd className="mt-1 text-black/70">
                {formatSubscriptionAddress(subscription) || "—"}
              </dd>
            </div>
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

function AddressBlock({ subscription }: { subscription: Subscription }) {
  const stateName = getUsStateName(subscription.state);

  return (
    <>
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
        <span className="block text-xs text-black/45">{stateName}</span>
      ) : null}
    </>
  );
}

function ConsentBadge({ consent }: { consent: boolean }) {
  return (
    <span
      className={`mt-2 block w-fit border px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.06em] ${
        consent
          ? "border-black text-black"
          : "border-black/20 text-black/45"
      }`}
    >
      {consent ? "Email consent" : "No consent"}
    </span>
  );
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
