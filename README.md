# Beauty Professionals Magazine / Journal

A premium black-and-white editorial website built with Next.js, Drizzle,
TipTap, and Vercel Blob.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- ESLint
- npm

## Install

```bash
npm install
```

## Local development

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Public and admin article pages always read from the database configured by
`DATABASE_URL`, in both `next dev` and production.

## Subscriptions

Three subscription types are collected at `/subscribe` and stored in the
`subscriptions` table:

| Type | Group | Fulfilment |
| --- | --- | --- |
| Individual | Digital | Free, delivered by email |
| Salon | Physical | 3 / 5 / 10 / 20 printed copies per issue |
| School / Company | Physical | 25 / 50 / 100 / 250 printed copies per issue |

`/admin/subscriptions` lists both groups separately. `status` and
`deliveryStatus` are changed there by hand; approving a salon or school
subscription (`status` → Active) automatically publishes it as an Official
Distribution Partner on the public map.

## Distributors

`/admin/distributors` is the map's control room. It lists every salon and
school subscription — the distributors — with the address point each one holds
on `/where-to-find`, and says whether that point is live (`Published`) or not
(`Awaiting approval`, `Canceled`, `Address incomplete`). **View on map** opens
`/where-to-find?location=<id>` with the point selected and highlighted.

**Add distributor** on this page records a partner the desk agreed with
off-site: it is stored as an already-approved salon or school subscription
(derived from the organization type) and publishes its point immediately, so it
skips both the approval queue and the confirmation emails.

`getDistributionPointIssue` in `features/distribution/types/distribution.ts` is
the single rule for publishing a point; the public map and this table both read
it, so they cannot disagree about what is live.

### Email delivery

Email runs on Resend over plain `fetch`, so no package is required. Set
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` (see `.env.example`) and delivery
starts immediately. Without them, submissions are still stored and every send
is logged and skipped — the admin page shows which mode is active.

## Where to Find map

`/where-to-find` renders an interactive US map, searchable by state, city, or
ZIP Code, and is linked from the landing page. Every pin is an approved salon /
school subscription — reaching the map either by approval on
`/admin/subscriptions` or by being added by hand on `/admin/distributors`.

State outlines are pre-generated into
`features/distribution/data/us-state-shapes.ts` from public-domain U.S. Census
boundaries, so the map needs no map service or API key. Regenerate with:

```bash
node scripts/generate-us-map.mjs features/distribution/data/us-state-shapes.ts
```

## Lookbook archive

`/lookbook` lists published PDF editions by year and month and keeps the
selected edition in the URL. `/admin/lookbook` lets an editor choose an issue
date, publish or replace its PDF, preview it, and remove only that edition.
Existing singleton Lookbook data is dated from its previous `updated_at` value
when migration `0006` runs.

## Article cover images

`features/articles/lib/cover-placements.ts` is the single source of truth for
every cover placement. Its width and height (aspect is derived) drive the crop
editor frame, the Sharp-generated file, and the frontend container, which
reads the ratio through `coverFrameProps()`:

| Placement | Output | Ratio | Used by |
| --- | --- | --- | --- |
| `homepageFeature` | 1600 × 1200 | 4:3 | Homepage lead story, dark spotlight |
| `storyCard` | 1200 × 900 | 4:3 | Story cards, lists, related stories, homepage rails |
| `portraitRail` | 800 × 1000 | 4:5 | Compact rails, admin lists |
| `articleHero` | 1200 × 1500 | 4:5 | Article page header |

Saving an article generates one WebP per placement from the untouched original
and stores the exact crop used. Older records load as-is: a variant whose size
no longer matches its placement is ignored (the original is shown centered
until the article is saved again), and a crop saved for another ratio is
re-fitted around its center. Changing a placement size therefore needs no
migration — re-saving an article regenerates its files.

## Tests

```bash
npm test
```

Runs `node:test` directly on the TypeScript sources (cover placements,
legacy cover metadata, and Sharp rendering).

## Database migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

`drizzle.config.ts` picks up every `features/*/db/*-schema.ts` file.

## Build

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Deploy on Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository into [Vercel](https://vercel.com/).
3. Keep the default Next.js build settings.
4. Deploy.
