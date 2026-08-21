import { MapPin } from "lucide-react";

import { listDistributionLocations } from "@/features/distribution/server/distribution-queries";
import { ButtonLink } from "@/shared/components/ui";

/**
 * The landing-page entry point to the distribution map. Counts come from the
 * same query the map renders, so the promise on the home page always matches
 * what `/where-to-find` shows.
 */
export async function HomeDistribution() {
  const locations = await listDistributionLocations();
  const stateCount = new Set(locations.map((location) => location.stateCode))
    .size;

  return (
    <section className="border-t border-black bg-white py-[var(--section-space)]">
      <div className="site-container">
        <div
          className="grid gap-[clamp(1.5rem,4vw,3rem)] lg:grid-cols-[1.15fr_0.85fr] lg:items-end"
          data-reveal
          suppressHydrationWarning
        >
          <div>
            <p className="editorial-kicker flex items-center gap-2 text-black/45">
              <MapPin aria-hidden="true" size={15} />
              Where to find us
            </p>
            <h2 className="mt-3 max-w-[18ch] [font-family:var(--font-editorial-title)] text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[0.92] tracking-[-0.04em]">
              Pick up a printed copy near you.
            </h2>
            <p className="mt-5 max-w-xl text-[clamp(0.95rem,1.6vw,1.15rem)] leading-8 text-black/64">
              Salons, beauty schools, Med Spas, and clinics across the country
              carry every issue. Search the distribution map by state, city, or
              ZIP Code.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/where-to-find" size="lg">
                Where to Find
              </ButtonLink>
              <ButtonLink href="/subscribe" size="lg" variant="secondary">
                Become a partner
              </ButtonLink>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 border-t border-black pt-5 lg:justify-self-end">
            <div>
              <dt className="editorial-kicker text-black/45">Locations</dt>
              <dd className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none">
                {locations.length}
              </dd>
            </div>
            <div>
              <dt className="editorial-kicker text-black/45">States</dt>
              <dd className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none">
                {stateCount}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
