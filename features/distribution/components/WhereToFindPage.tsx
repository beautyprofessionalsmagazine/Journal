import { DistributionMap } from "@/features/distribution/components/DistributionMap";
import { listDistributionLocations } from "@/features/distribution/server/distribution-queries";
import { ButtonLink } from "@/shared/components/ui";

export async function WhereToFindPage() {
  const locations = await listDistributionLocations();
  const stateCount = new Set(locations.map((location) => location.stateCode))
    .size;

  return (
    <main className="bg-white">
      <section className="site-container py-[var(--section-space)]">
        <header className="reveal grid gap-6 border-b border-black pb-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="editorial-kicker mb-3 text-black/45">
              Distribution network
            </p>
            {/*
              Not `.page-title`: that rule sets `overflow-wrap: anywhere`,
              which breaks this unusually long title mid-word.
            */}
            <h1 className="max-w-[15ch] [overflow-wrap:break-word] [font-family:var(--font-editorial-title)] text-[clamp(2.5rem,6vw,5.25rem)] font-bold leading-[0.9] tracking-[-0.04em]">
              Where to Find Beauty Professionals Magazine
            </h1>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-xl text-[clamp(1rem,1.8vw,1.25rem)] leading-8 text-black/64">
              Salons, beauty schools, Med Spas, and clinics across the country
              carry the magazine. Search by state, city, or ZIP Code to find the
              nearest copy.
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-black/15 pt-5">
              <div>
                <dt className="editorial-kicker text-black/45">Locations</dt>
                <dd className="mt-2 [font-family:var(--font-editorial-title)] text-4xl font-bold leading-none">
                  {locations.length}
                </dd>
              </div>
              <div>
                <dt className="editorial-kicker text-black/45">States</dt>
                <dd className="mt-2 [font-family:var(--font-editorial-title)] text-4xl font-bold leading-none">
                  {stateCount}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="reveal reveal-delay-1 mt-[clamp(2rem,4vw,3.5rem)]">
          <DistributionMap locations={locations} />
        </div>

        <div className="reveal reveal-delay-2 mt-[clamp(3rem,6vw,6rem)] grid gap-6 border-t border-black pt-10 md:grid-cols-[0.7fr_1.3fr] md:items-start">
          <p className="editorial-kicker text-black/45">Become a partner</p>
          <div className="max-w-xl">
            <h2 className="[font-family:var(--font-editorial-title)] text-[clamp(1.8rem,4vw,3rem)] font-bold leading-none">
              Carry the magazine in your space.
            </h2>
            <p className="mt-5 text-sm leading-7 text-black/62">
              Salons, beauty schools, brands, distributors, Med Spas, and
              clinics can receive printed copies for every issue. Once approved,
              your location is added to this map as an Official Distribution
              Partner.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/subscribe">Request copies</ButtonLink>
              <ButtonLink href="/contacts" variant="secondary">
                Contact editorial
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
