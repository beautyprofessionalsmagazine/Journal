"use client";

import { MapPin, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

import {
  US_MAP_VIEW_BOX,
  usStateShapes,
} from "@/features/distribution/data/us-state-shapes";
import {
  formatDistributionAddress,
  type DistributionLocation,
} from "@/features/distribution/types/distribution";
import { organizationTypeLabels } from "@/features/subscriptions/types/subscription";
import { Button } from "@/shared/components/ui";

type DistributionMapProps = {
  locations: DistributionLocation[];
  /**
   * Id of a single address point to open the map on, set by the `location`
   * query parameter the admin distributors table links with.
   */
  focusId?: string;
};

/** Small states need their count badge nudged clear of the coastline. */
const badgeOffsets: Record<string, [number, number]> = {
  CT: [16, 6],
  DC: [22, 14],
  DE: [16, 4],
  MA: [22, -6],
  MD: [18, 10],
  NH: [10, -6],
  NJ: [16, 2],
  RI: [18, 2],
  VT: [-8, -10],
};

export function DistributionMap({ locations, focusId }: DistributionMapProps) {
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(
    () =>
      locations.find((location) => location.id === focusId)?.stateCode ?? null,
  );
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) {
      return;
    }

    document
      .getElementById(`location-${focusId}`)
      ?.scrollIntoView({ block: "center" });
  }, [focusId]);

  const normalizedQuery = query.trim().toLowerCase();

  const searchMatches = useMemo(() => {
    if (!normalizedQuery) {
      return locations;
    }

    return locations.filter((location) =>
      [
        location.name,
        location.city ?? "",
        location.zipCode ?? "",
        location.stateCode,
        location.stateName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [locations, normalizedQuery]);

  const matchedStateCodes = useMemo(
    () => new Set(searchMatches.map((location) => location.stateCode)),
    [searchMatches],
  );

  const countsByState = useMemo(() => {
    const counts = new Map<string, number>();

    for (const location of searchMatches) {
      counts.set(
        location.stateCode,
        (counts.get(location.stateCode) ?? 0) + 1,
      );
    }

    return counts;
  }, [searchMatches]);

  const visibleLocations = useMemo(
    () =>
      selectedState
        ? searchMatches.filter(
            (location) => location.stateCode === selectedState,
          )
        : searchMatches,
    [searchMatches, selectedState],
  );

  const groupedLocations = useMemo(() => {
    const groups = new Map<string, DistributionLocation[]>();

    for (const location of visibleLocations) {
      const group = groups.get(location.stateName) ?? [];
      group.push(location);
      groups.set(location.stateName, group);
    }

    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleLocations]);

  const hasFilters = Boolean(normalizedQuery || selectedState);

  // Hover wins over selection so pointing at a state always previews its count.
  const readoutCode = hoveredState ?? selectedState;
  const readoutState = readoutCode
    ? {
        name:
          usStateShapes.find((state) => state.code === readoutCode)?.name ??
          readoutCode,
        count: countsByState.get(readoutCode) ?? 0,
      }
    : null;

  function toggleState(code: string) {
    setSelectedState((current) => (current === code ? null : code));
  }

  function handleStateKeyDown(event: KeyboardEvent<SVGPathElement>, code: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleState(code);
    }
  }

  function clearFilters() {
    setQuery("");
    setSelectedState(null);
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 border-b border-black pb-5 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
            size={17}
          />
          <input
            aria-label="Search by state, city, or ZIP Code"
            className="input-control pl-10 pr-10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by state, city, or ZIP Code"
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="focus-ring absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-black/45 hover:text-black"
              onClick={() => setQuery("")}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <p
            aria-live="polite"
            className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62"
          >
            {visibleLocations.length}{" "}
            {visibleLocations.length === 1 ? "location" : "locations"}
            {selectedState ? ` in ${selectedState}` : ""}
          </p>
          {hasFilters ? (
            <Button onClick={clearFilters} size="sm" variant="secondary">
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-[clamp(1.5rem,3vw,3rem)] pt-[clamp(1.5rem,3vw,2.5rem)] lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div className="min-w-0">
          <div className="border border-black/15 bg-[#f6f4ef]">
            <p
              aria-live="polite"
              className="flex min-h-11 items-center justify-between gap-3 border-b border-black/15 px-4 text-xs"
            >
              <span className="font-semibold uppercase tracking-[0.08em]">
                {readoutState
                  ? readoutState.name
                  : "United States distribution"}
              </span>
              <span className="[font-family:var(--font-editorial-body-sans)] italic text-black/58">
                {readoutState
                  ? `${readoutState.count} ${readoutState.count === 1 ? "location" : "locations"}`
                  : `${locations.length} total`}
              </span>
            </p>
            <div className="p-[clamp(0.75rem,2vw,1.5rem)]">
            <svg
              aria-label="Map of the United States showing where Beauty Professionals Magazine is distributed"
              className="h-auto w-full"
              role="group"
              viewBox={US_MAP_VIEW_BOX}
              xmlns="http://www.w3.org/2000/svg"
            >
              {usStateShapes.map((state) => {
                const count = countsByState.get(state.code) ?? 0;
                const isMatched = matchedStateCodes.has(state.code);
                const isSelected = selectedState === state.code;
                const isHovered = hoveredState === state.code;
                const isDimmed = Boolean(selectedState) && !isSelected;

                return (
                  <path
                    aria-label={`${state.name}: ${count} ${count === 1 ? "location" : "locations"}`}
                    className="transition-[fill,stroke] duration-150 focus:outline-none focus-visible:stroke-black"
                    d={state.d}
                    fill={getStateFill({
                      isMatched,
                      isSelected,
                      isHovered,
                      isDimmed,
                    })}
                    key={state.code}
                    onClick={() => (isMatched ? toggleState(state.code) : null)}
                    onKeyDown={(event) =>
                      isMatched ? handleStateKeyDown(event, state.code) : null
                    }
                    onMouseEnter={() => setHoveredState(state.code)}
                    onMouseLeave={() => setHoveredState(null)}
                    role={isMatched ? "button" : undefined}
                    stroke={isSelected ? "#ffffff" : "#f6f4ef"}
                    strokeWidth={isSelected ? 2 : 1}
                    style={{ cursor: isMatched ? "pointer" : "default" }}
                    tabIndex={isMatched ? 0 : undefined}
                  />
                );
              })}

              {usStateShapes.map((state) => {
                const count = countsByState.get(state.code) ?? 0;

                if (count === 0) {
                  return null;
                }

                const [offsetX, offsetY] = badgeOffsets[state.code] ?? [0, 0];
                const x = state.cx + offsetX;
                const y = state.cy + offsetY;

                return (
                  <g
                    className="pointer-events-none"
                    key={`badge-${state.code}`}
                  >
                    {offsetX || offsetY ? (
                      <line
                        stroke="#1a1a1a"
                        strokeWidth={1}
                        x1={state.cx}
                        x2={x}
                        y1={state.cy}
                        y2={y}
                      />
                    ) : null}
                    <circle
                      cx={x}
                      cy={y}
                      fill="#ffffff"
                      r={11}
                      stroke="#1a1a1a"
                      strokeWidth={1.5}
                    />
                    <text
                      dominantBaseline="central"
                      fill="#111111"
                      fontSize={12}
                      fontWeight={700}
                      textAnchor="middle"
                      x={x}
                      y={y + 0.5}
                    >
                      {count}
                    </text>
                  </g>
                );
              })}
              </svg>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-black/58">
            <LegendSwatch color="#1a1a1a" label="Copies available" />
            <LegendSwatch color="#e7e4dc" label="No locations yet" />
            <span className="[font-family:var(--font-editorial-body-sans)] italic">
              Select a state on the map to filter the list.
            </span>
          </div>
        </div>

        <div className="min-w-0">
          {groupedLocations.length === 0 ? (
            <div className="border border-black/15 p-[clamp(1.25rem,3vw,2rem)]">
              <p className="editorial-kicker text-black/45">Nothing matched</p>
              <h3 className="mt-3 [font-family:var(--font-editorial-title)] text-3xl font-bold leading-none">
                No locations found
              </h3>
              <p className="mt-3 text-sm leading-6 text-black/62">
                {locations.length === 0
                  ? "Distribution partners will appear here as soon as the first salon or school is approved."
                  : "Try another state, city, or ZIP Code."}
              </p>
              {hasFilters ? (
                <Button className="mt-5" onClick={clearFilters} variant="secondary">
                  Reset search
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="max-h-[42rem] overflow-y-auto border border-black/15 [scrollbar-color:rgba(0,0,0,0.35)_transparent] [scrollbar-width:thin]">
              {groupedLocations.map(([stateName, stateLocations]) => (
                <section key={stateName}>
                  <h3 className="sticky top-0 z-10 border-b border-black bg-black px-4 py-3 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.1em] text-white">
                    {stateName}
                    <span className="ml-2 text-white/60">
                      {stateLocations.length}
                    </span>
                  </h3>
                  <ul className="divide-y divide-black/10">
                    {stateLocations.map((location) => (
                      <li
                        className={`px-4 py-4 ${
                          location.id === focusId
                            ? "bg-black/[0.045] outline outline-2 -outline-offset-2 outline-black"
                            : ""
                        }`}
                        id={`location-${location.id}`}
                        key={location.id}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin
                            aria-hidden="true"
                            className={`mt-1 shrink-0 ${
                              location.id === focusId
                                ? "text-black"
                                : "text-black/45"
                            }`}
                            size={15}
                          />
                          <div className="min-w-0">
                            <p className="[font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
                              {location.name}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-black/58">
                              {formatDistributionAddress(location) ||
                                location.stateName}
                            </p>
                            <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-black/45">
                              {location.kind === "office"
                                ? "Editorial office"
                                : location.organizationType
                                  ? `${organizationTypeLabels[location.organizationType]} · Official Distribution Partner`
                                  : "Official Distribution Partner"}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type StateFillOptions = {
  isMatched: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
};

function getStateFill({
  isMatched,
  isSelected,
  isHovered,
  isDimmed,
}: StateFillOptions) {
  if (!isMatched) {
    return isDimmed ? "#efece5" : "#e7e4dc";
  }

  if (isSelected) {
    return "#111111";
  }

  if (isHovered) {
    return "#4a4a4a";
  }

  return isDimmed ? "#b5b0a5" : "#1a1a1a";
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block size-3 border border-black/20"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
