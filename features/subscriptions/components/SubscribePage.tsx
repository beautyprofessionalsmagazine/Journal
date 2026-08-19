import { SubscriptionPlans } from "@/features/subscriptions/components/SubscriptionPlans";
import { ButtonLink } from "@/shared/components/ui";

export function SubscribePage() {
  return (
    <main className="bg-white">
      <section className="site-container py-[var(--section-space)]">
        <header className="reveal grid gap-6 border-b border-black pb-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="editorial-kicker mb-3 text-black/45">
              Beauty Professionals Magazine
            </p>
            <h1 className="page-title">Subscribe</h1>
          </div>
          <p className="max-w-xl text-[clamp(1rem,1.8vw,1.25rem)] leading-8 text-black/64 lg:justify-self-end">
            Three ways to receive the magazine: free for individual
            professionals, printed copies for salons, and bulk deliveries for
            schools, brands, distributors, Med Spas, and clinics.
          </p>
        </header>

        <div className="reveal reveal-delay-1 mt-[clamp(2.5rem,5vw,4.5rem)]">
          <SubscriptionPlans />
        </div>

        <div className="reveal reveal-delay-2 mt-[clamp(3rem,6vw,6rem)] grid gap-6 border-t border-black pt-10 md:grid-cols-[0.7fr_1.3fr] md:items-start">
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
