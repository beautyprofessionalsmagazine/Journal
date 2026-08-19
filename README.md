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

Public article pages can use development fixtures from
`features/articles/data/article-fixtures.ts` during `next dev`, but the fixture
list is empty by default. Set `USE_DATABASE_ARTICLES=true` when you want the
public site to read local database records instead. Admin pages always use
database records.

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

### Email delivery

Email runs on Resend over plain `fetch`, so no package is required. Set
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` (see `.env.example`) and delivery
starts immediately. Without them, submissions are still stored and every send
is logged and skipped — the admin page shows which mode is active.

## Where to Find map

`/where-to-find` renders an interactive US map, searchable by state, city, or
ZIP Code. Its pins come from two sources: the office address in the
`site_settings` table (edited from the **Office address** button on
`/admin/subscriptions`) and every approved salon / school subscription.

State outlines are pre-generated into
`features/distribution/data/us-state-shapes.ts` from public-domain U.S. Census
boundaries, so the map needs no map service or API key. Regenerate with:

```bash
node scripts/generate-us-map.mjs features/distribution/data/us-state-shapes.ts
```

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
