import { SubscriptionPlans } from "@/features/subscriptions/components/SubscriptionPlans";
import { ButtonLink } from "@/shared/components/ui";

const subscriptionFacts = [
  { label: "Cost", value: "Free for every working professional" },
  { label: "Delivery", value: "Printed copies mailed across the U.S." },
  { label: "Approval", value: "Requests reviewed by the editorial desk" },
];

export function SubscribePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-black bg-[#f2efe9]">
        <div className="site-container grid gap-[clamp(2rem,5vw,5rem)] py-[clamp(3.5rem,7vw,7rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <header className="reveal" suppressHydrationWarning>
            <p className="editorial-kicker mb-4 text-[var(--champagne-dark)]">
              Beauty Professionals Magazine
            </p>
            <h1 className="max-w-[10ch] [font-family:var(--font-editorial-title)] text-[clamp(3.5rem,8vw,6.75rem)] font-bold leading-[0.84] tracking-[-0.05em]">
              Made for the people behind beauty.
            </h1>
          </header>

          <div className="reveal reveal-delay-1 lg:border-l lg:border-black/20 lg:pl-[clamp(2rem,5vw,5rem)]" suppressHydrationWarning>
            <p className="max-w-xl text-[clamp(1.05rem,1.7vw,1.3rem)] leading-8 text-black/68">
              Receive the magazine free of charge — as a working professional,
              a salon distribution partner, or an organization serving the
              beauty industry.
            </p>
            <dl className="mt-8 grid divide-y divide-black/15 border-y border-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {subscriptionFacts.map((fact) => (
                <div
                  className="flex flex-col gap-2 py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0"
                  key={fact.label}
                >
                  <dt className="editorial-kicker text-black/40">{fact.label}</dt>
                  <dd className="text-xs leading-5 text-black/68">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="site-container py-[clamp(3.5rem,7vw,7rem)]">
        <div className="reveal" suppressHydrationWarning>
          <SubscriptionPlans />
        </div>

        <div
          className="reveal reveal-delay-2 mt-[clamp(4rem,8vw,8rem)] grid gap-6 border-t border-black pt-9 md:grid-cols-[0.72fr_1.28fr] md:items-start"
          suppressHydrationWarning
        >
          <p className="editorial-kicker text-black/45">Already a partner</p>
          <div className="max-w-xl">
            <h2 className="[font-family:var(--font-editorial-title)] text-[clamp(1.8rem,4vw,3rem)] font-bold leading-none">
              Find a copy near you.
            </h2>
            <p className="mt-5 text-sm leading-7 text-black/62">
              Every approved salon, school, and partner clinic is listed on the
              distribution map — searchable by state, city, or ZIP Code.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/where-to-find">Open the map</ButtonLink>
              <ButtonLink href="/current-issue" variant="secondary">
                See the current issue
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
