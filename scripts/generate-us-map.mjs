import { writeFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = JSON.parse(
  readFileSync(require.resolve("us-atlas/states-albers-10m.json"), "utf8"),
);

const stateCodes = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "Puerto Rico": "PR",
};

const path = geoPath().projection(null);
const states = feature(topology, topology.objects.states).features;
const rows = [];

for (const state of states) {
  const name = state.properties.name;
  const code = stateCodes[name];

  if (!code) {
    console.warn(`Skipping unmapped state: ${name}`);
    continue;
  }

  const d = path(state).replace(/(\d+\.\d{1})\d+/g, "$1");
  const [cx, cy] = path.centroid(state);

  rows.push({
    code,
    name,
    d,
    cx: Math.round(cx * 10) / 10,
    cy: Math.round(cy * 10) / 10,
  });
}

rows.sort((a, b) => a.name.localeCompare(b.name));

const file = `/**
 * Generated from us-atlas (ISC) \`states-albers-10m.json\`, derived from
 * public-domain U.S. Census Bureau cartographic boundary files.
 * Coordinates are pre-projected (Albers USA) into the 975 x 610 viewBox below.
 */

export const US_MAP_VIEW_BOX = "0 0 975 610";

export type UsStateShape = {
  code: string;
  name: string;
  /** SVG path data in \`US_MAP_VIEW_BOX\` coordinate space. */
  d: string;
  /** Label anchor in the same coordinate space. */
  cx: number;
  cy: number;
};

export const usStateShapes: UsStateShape[] = [
${rows
  .map(
    (row) =>
      `  {\n    code: "${row.code}",\n    name: "${row.name}",\n    cx: ${row.cx},\n    cy: ${row.cy},\n    d: "${row.d}",\n  },`,
  )
  .join("\n")}
];

export const usStateNameByCode = new Map(
  usStateShapes.map((state) => [state.code, state.name]),
);

export const usStateCodeByName = new Map(
  usStateShapes.map((state) => [state.name.toLowerCase(), state.code]),
);
`;

const outputPath = process.argv[2];
writeFileSync(outputPath, file, "utf8");
console.log(`Wrote ${rows.length} states to ${outputPath}`);
