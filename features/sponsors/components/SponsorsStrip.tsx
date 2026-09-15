import Image from "next/image";

import { sponsors } from "@/features/sponsors/data/sponsors";

export function SponsorsStrip() {
  return (
    <aside
      aria-label="Sponsors and partners"
      className="sponsors-strip border-b border-black/15 bg-[#ecebe7]"
      data-motion-managed
      data-motion-sponsors
    >
      <div className="site-container py-2.5 sm:py-3">
        <p className="editorial-kicker text-center text-black/42">
          Our sponsors &amp; partners
        </p>
        <ul className="mx-auto mt-1.5 grid w-full max-w-4xl grid-cols-3 items-center divide-x divide-black/12">
          {sponsors.map((sponsor) => (
            <li
              className="sponsor-item flex min-w-0 items-center justify-center px-3 sm:px-8"
              data-motion-sponsor-item
              data-sponsor={sponsor.id}
              key={sponsor.id}
            >
              <div className="relative h-8 w-full overflow-hidden sm:h-10">
                <Image
                  alt={sponsor.name}
                  className="object-contain"
                  fill
                  unoptimized
                  sizes={
                    sponsor.id === "ibpa"
                      ? "(min-width: 640px) 1024px, 512px"
                      : "(min-width: 640px) 512px, 256px"
                  }
                  src={sponsor.logo}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
