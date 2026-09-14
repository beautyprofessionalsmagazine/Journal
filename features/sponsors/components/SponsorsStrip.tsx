import Image from "next/image";

import { sponsors } from "@/features/sponsors/data/sponsors";

export function SponsorsStrip() {
  return (
    <aside
      aria-label="Sponsors and partners"
      className="sponsors-strip border-b border-black/15 bg-white"
      data-motion-managed
      data-motion-sponsors
    >
      <div className="site-container flex min-h-20 items-stretch sm:min-h-24">
        <div className="flex shrink-0 items-center border-r border-black/15 pr-5 sm:pr-8">
          <p className="editorial-kicker leading-4 text-black/48">
            Sponsors
            <span className="block text-[0.58rem] text-black/35">&amp; partners</span>
          </p>
        </div>
        <div className="sponsors-scroll min-w-0 flex-1 overflow-x-auto">
          <ul className="flex h-full min-w-max items-stretch">
            {sponsors.map((sponsor) => (
              <li
                className="sponsor-item flex w-[12rem] shrink-0 items-center justify-center border-r border-black/10 px-5 sm:w-[15rem] sm:px-8"
                data-motion-sponsor-item
                key={sponsor.id}
              >
                <div className="relative h-14 w-full sm:h-16">
                  <Image
                    alt={sponsor.name}
                    className="object-contain"
                    fill
                    sizes="240px"
                    src={sponsor.logo}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
