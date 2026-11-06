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

If a database has not run migration `0006` yet, `/lookbook` and
`/admin/lookbook` still load: editions are dated from `updated_at` the same way,
publishing is paused, and the admin page shows a "Database update required"
notice. Apply it with `npm run db:migrate` against that database's
`DATABASE_URL`. Any other database failure renders a calm "unavailable" state
instead of the error page, and is logged with a `[lookbook]` prefix.

PDFs are read through byte ranges: Vercel Blob serves ranges but does not
expose `Accept-Ranges` to scripts, so the viewer fetches ranges itself and
shares one document per PDF across the page. A cover needs only the first few
hundred kilobytes instead of the whole file.

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
| `socialShare` | 1600 × 900 | 16:9 | Open Graph, X/Twitter, Google Discover, structured data |

Saving an article generates one WebP per placement from the untouched original
and stores the exact crop used. Older records load as-is: a variant whose size
no longer matches its placement is ignored (the original is shown centered
until the article is saved again), and a crop saved for another ratio is
re-fitted around its center. Changing a placement size therefore needs no
migration — re-saving an article regenerates its files.

## SEO

All search-engine logic lives in `shared/seo/` (generic) and in each feature's
`seo/` folder (page-specific). Pages do not hand-write `<head>` tags.

| Concern | Where |
| --- | --- |
| Canonical origin, brand name, ISSN, logo, share image | `shared/seo/site.ts` |
| Title, description, canonical, robots, Open Graph, Twitter | `buildPageMetadata()` in `shared/seo/metadata.ts` |
| JSON-LD (Organization, WebSite, Article, BreadcrumbList ...) | `shared/seo/json-ld.ts`, rendered by `<JsonLd>` |
| Fixed pages, and whether each is indexable | `shared/seo/pages.ts` |
| `robots.txt`, `sitemap.xml`, `feed.xml` | `app/robots.ts`, `app/sitemap.ts`, `app/feed.xml/route.ts` |
| Article metadata and structured data | `features/articles/seo/article-seo.ts` |
| Cache refresh when an article changes | `features/articles/server/article-revalidation.ts` |

Rules worth knowing:

- **Placeholder pages are `noindex`.** A page whose copy is still "coming soon"
  has `indexable: false` in `shared/seo/pages.ts`; it is excluded from the
  sitemap. Flip the flag to `true` when the page has real content.
- **Filtered views are `noindex`.** `?q=`, `?tag=`, `?category=` and
  `?sort=popular` never carry a canonical of their own.
- **Do not add `loading.tsx` to public routes.** It wraps the page in a
  Suspense boundary, so the server HTML contains only a skeleton and the real
  content sits in a hidden block that JavaScript reveals. Crawlers that do not
  run JavaScript, and 404 status codes, depend on the content being inline.
- **A new fixed page** needs an entry in `STATIC_PAGES`, an exported
  `metadata = getStaticPageMetadata("key")`, and nothing else; the sitemap
  picks it up.
- Optional environment variables are listed in `.env.example`
  (`NEXT_PUBLIC_SITE_URL`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`).

```bash
npm run seo:check -- https://beautyprofessionalsmagazine.com   # audit a live URL
npm run seo:check                                              # audit http://localhost:3000
npm run generate:seo-assets   # rebuild favicon, share image and background texture
```

`seo:check` fetches `robots.txt`, the sitemap and every URL it lists, and
asserts status codes, canonicals, robots directives, titles, headings,
structured data and that the content is present without JavaScript. Run it
against a preview deployment before promoting it. The full audit and roadmap
are in [`SEO_AUDIT.md`](SEO_AUDIT.md).

## Tests

```bash
npm test
```

Runs `node:test` directly on the TypeScript sources (cover placements,
legacy cover metadata, Sharp rendering, and the SEO modules: metadata,
structured data, sitemap, robots, feed, slugs and indexing rules).

## Database migrations

```bash
npx drizzle-kit generate
npm run db:migrate
```

Run `npm run db:migrate` against the production `DATABASE_URL` whenever a
deploy includes a new migration.

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
