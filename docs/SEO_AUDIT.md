# SEO audit, research and optimization

**Site:** Beauty Professionals Magazine — https://beautyprofessionalsmagazine.com
**Audited:** 2026-10-13, on branch `audit/seo-optimization` (Next.js 16.3.5 App Router, React 19, Drizzle/Postgres, Vercel)
**Status of the code changes:** implemented and verified locally on a production build; **not deployed and not committed**. Everything marked *Requires external action* needs the site owner.

How to read this report:

- **Verified** means I observed it directly (production HTML, HTTP responses, a browser, Lighthouse, or the source). **Hypothesis** means it is an inference I could not confirm without Google Search Console or analytics access, and is labelled as such.
- **Status** values: **Fixed** (changed in this branch and verified locally), **Pending** (not done; a code or content task for the team), **Requires external action** (needs access or a decision I do not have).
- No keyword volumes, rankings, traffic or Search Console figures appear anywhere in this report, because none were available. Do not read any number here as one.

---

## 1. Executive summary

**Overall condition.** The site is well built (clean architecture, good image handling, accessible markup) but was effectively **invisible to search engines by construction**, not by neglect of content. It has 31 published articles and is about 4½ months old (the oldest article is dated 2026-05-29), so a young domain with no search history is expected; but on top of that it had no `robots.txt`, no sitemap, no canonical tags, no social or structured data, and a rendering pattern that hid the real page body from any crawler that does not run JavaScript.

**The most important findings** (every symptom below was verified directly):

1. **The page body was delivered inside a hidden block.** A root-level `app/loading.tsx` wrapped the whole site in a Suspense boundary. The server HTML contained only a skeleton (0 characters of visible text) and put the header, content and footer inside `<div hidden id="S:0">`, revealed by an inline script. Googlebot renders JavaScript and copes; crawlers that do not (many social previewers, AI crawlers, text-mode parsers) saw an empty page. The same boundary caused **soft 404s** (unknown article and category URLs returned HTTP 200).
2. **No `robots.txt`, no `sitemap.xml`, no favicon** (all 404 on production), **no canonical tags**, **no Open Graph/Twitter tags**, **no structured data**.
3. **Twelve routes shared one identical `<title>` and meta description**, and ten of them are placeholders ("will be published here when…") that were indexable.
4. **Production `/lookbook` is broken** (renders the global error screen). It works against the development database, so the likeliest cause is that migration `0006` was not applied to the production database. *Requires external action.*
5. **Duplicate content:** two published articles with identical title and body (`/articles/why-beauty-compe` and the full-slug URL).
6. **Performance:** every page transferred **about 8 MB**, about 7.5 MB of it four static PNGs (a 4.9 MB sponsor logo shown at 40 px tall, served `unoptimized`). Mobile LCP in the lab reached **40 s** on article and listing pages.

**What this branch changes.** A central `shared/seo/` module now owns metadata, canonicals, robots directives, structured data, the sitemap, `robots.txt` and an RSS feed. The `loading.tsx` boundaries are gone, so content is in the initial HTML and unknown URLs return a real 404. Placeholder pages are `noindex` and out of the sitemap until they have content (one flag flips each). Images are optimized. 185 unit tests and an HTTP-level checker (`npm run seo:check`) guard it all.

**Measured result** (same machine, same database, production build; Lighthouse 13.5, lab data):

| | Before | After |
|---|---|---|
| Mobile performance (home / article / articles / category) | 56 / 75 / 60 / 63 | **99 / 98 / 95 / 98** |
| Desktop performance (same pages) | 84 / 91 / 82 / 88 | **100 / 100 / 100 / 100** |
| Lighthouse SEO category (home) | 91 | **100** |
| Mobile LCP | 7.5 s – 39.2 s | **2.3 s – 3.0 s** |
| Mobile TBT | 70 – 760 ms | **20 – 40 ms** |
| Page weight (Lighthouse total byte weight) | 7.9 – 8.2 MiB | **0.8 – 1.2 MiB** |
| HTTP checks (`seo:check`) | not applicable | **652 / 652** |

**What the owner must do** (details in §9): deploy; verify the site in Google Search Console and submit the sitemap; check the production database for the Lookbook migration; unpublish the duplicate article; write About, Contacts, Privacy Policy and User Agreement, then flip them to indexable; supply social profile URLs and an official square logo.

**Biggest remaining opportunities** (§8): topical authority in the niches the site already covers (technique, lash science, licensing and immigration for foreign-trained professionals, competitions), author pages, citations and contextual internal links, and expanding or merging the 11 articles under 600 words.

---

## 2. Scope and method

**Stack and architecture (verified):** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript, Tailwind 4, Drizzle ORM on Postgres (`postgres` driver), TipTap article editor, Vercel Blob for images and PDFs, GSAP for motion, Vercel Web Analytics. Routes: home, `/articles` and `/articles/[slug]`, `/category/[slug]`, `/shopping`, `/lookbook` (PDF editions), `/where-to-find` (distribution map), `/subscribe`, and a set of information pages; an admin back office under `/admin`.

**What I inspected:** every route, layout and shared component in the repository; the database-backed queries and server actions; `next.config.ts`; `globals.css`; the production site (HTML, headers and status codes for ~25 routes, all 31 articles, `robots.txt`, `sitemap.xml`, the favicon and icon paths); a browser pane (desktop and 375 px mobile); Lighthouse 13.5.0 on production and on a local production build.

**Official sources used** (not generic SEO articles): Google Search Central — Article structured data, consolidating duplicate URLs, pagination and incremental loading (filter and sort guidance), HTTP status codes and soft 404s, site names, favicon, title links, Discover, AI features, JavaScript SEO basics; the Next.js 16 `generateMetadata` reference and JSON-LD guide; the schema.org vocabulary file; the ISSN Portal.

**Tools.** I ran Lighthouse 13.5.0 from the official `GoogleChrome/lighthouse` package, installed outside the repository. I searched the skill, plugin and MCP registries for SEO tooling and **installed none** (see §10 for the evaluation).

**Limits of this audit.**

- **No Google Search Console, Bing Webmaster or analytics access**, so indexing status, impressions, queries and field Core Web Vitals are unknown. A `site:` search through the search tool available to me returned no pages from the domain; that tool is not Google, so treat it as a weak signal only.
- **PageSpeed Insights was unavailable**: its API returned HTTP 429 (quota exhausted) and its web UI did not complete in the browser pane. Lighthouse lab runs stand in for it. Lab numbers are simulated; they are not what real visitors experience.
- **My "after" measurements are local.** I verified the changes on a local production build against the development database (which holds a subset of the production articles). Production verification needs a deployment; §9 gives the command.
- Rich Results Test and the Schema Markup Validator cannot reach a local build. I validated the JSON-LD against the full schema.org vocabulary instead (§7).

---

## 3. Baseline: what production looked like on 2026-10-13

| Check | Observed on production |
|---|---|
| `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/manifest.webmanifest`, any OG image | all **404** |
| `<head>` of the home page | only `charset`, `viewport`, `title`, `description` — no canonical, robots, Open Graph, Twitter, icons or JSON-LD |
| Visible text in the raw HTML (body, hidden blocks removed) | **0 characters**; the real page is in `<div hidden id="S:0">` |
| `/articles/does-not-exist`, `/category/nonexistent` | **HTTP 200** (with `noindex`). For an unknown article URL the CDN stores the response: the same URL answered `MISS` then `HIT`, so every URL a crawler or bot invents creates a cached 200 page |
| `/admin`, `/admin/login` | indexable (no robots meta), `/admin` answers 200 |
| `/lookbook` | HTTP 200 whose body is the error boundary ("The page missed its deadline"); server-render error digest in the HTML |
| Titles | 12 routes share `Beauty Professionals Magazine`; description likewise |
| Lighthouse mobile (home / article / articles / category) | performance 84 / 55 / 57 / 88; LCP 2.4 / 40.7 / 41.1 / 2.3 s |
| Lighthouse SEO | 91 on home (`link-text`: two identical "READ MORE" links), 100 elsewhere |
| Bytes per page | about 8 MB; `nepop-media.png` 4.9 MB, `andreeva-consulting.png` 1.1 MB, `journal-bg.PNG` 1.0 MB, `ibpa.png` 0.5 MB |
| Content (31 published articles) | median 960 words; 11 under 600 words (four under 200); 35 of 35 inline images have empty alt text; no article links to another in its body; 27 have no external citation |

---

## 4. Findings

Impact: **Critical** (prevents correct crawling, indexing or rendering), **High**, **Medium**, **Low**.

### 4.1 Crawling, indexing and rendering

| # | Issue | Evidence | Impact | Recommendation | Status |
|---|---|---|---|---|---|
| 1 | No `robots.txt` | `GET /robots.txt` → 404 | Critical | Serve rules that allow the site, block `/admin` and `/api/`, and declare the sitemap | **Fixed** — `app/robots.ts`, `shared/seo/robots.ts` |
| 2 | No sitemap | `GET /sitemap.xml` → 404 | Critical | Generate one from the database with real `lastmod` and cover images; refresh it when content changes | **Fixed** — `app/sitemap.ts`, `shared/seo/sitemap.ts`. **Requires external action:** submit it in Search Console |
| 3 | Page body hidden in a Suspense segment | Production HTML: skeleton `<main aria-busy>` visible, content in `<div hidden id="S:0">`, 0 visible characters; caused by `app/loading.tsx` and `app/(public)/articles/loading.tsx` | Critical | No `loading.tsx` on public routes; content must be in the initial HTML | **Fixed** — both files removed. Trade-off in §5 |
| 4 | Soft 404s | `/articles/does-not-exist` and `/category/nonexistent` returned 200; Google treats a 200 with error content as a soft 404. The CDN caches each invented article URL (`MISS` then `HIT`) | Critical | Real 404 status for unknown articles and sections | **Fixed** — `generateMetadata` calls `notFound()`; category route has `dynamicParams = false` |
| 5 | Lookbook crashes in production | `/lookbook` renders the error boundary; the same code works locally; the production HTML ends in a server-render error digest | Critical | Check the production database for migration `0006` (`issue_year`, `issue_month` columns) and run it if missing | **Requires external action.** Cause is a **hypothesis**. Code hardening done: the page is `noindex` when editions cannot be read, and the sitemap tolerates a failing Lookbook read |
| 6 | Duplicate article | `/articles/why-beauty-compe` and `/articles/why-beauty-competitions-have-become-the-1-career-growth-tool-in-the-industry` return the same title and description and near-identical body, both published | High | Redirect and unpublish the old record | **Fixed** (permanent redirect in `next.config.ts`, verified 308). **Requires external action:** unpublish the old record, and confirm the full-slug article is the one to keep |
| 7 | No canonical tags; parameter URLs duplicate content | No `rel=canonical` anywhere; `?q=`, `?tag=`, `?sort=`, `?category=`, `?location=`, `?year=&month=` all serve the same or subset content | High | Canonical on every indexable page; `noindex, follow` for filter, search and sort views, as Google advises | **Fixed** — see §6 |
| 8 | Admin and login indexable | No robots meta on `/admin/login`; no `Disallow` | High | `noindex`, robots rule, and an `X-Robots-Tag` header | **Fixed** — layout metadata, `robots.txt`, `next.config.ts` headers |
| 9 | Placeholder pages indexable and linked sitewide | About, Contacts, Careers, Collaboration, Video, PhotoVogue, Account, Privacy Policy, User Agreement, Current Issue show text like "will be published here when…" | High | Keep out of the index until they have content; write the content | **Fixed** (`noindex`, out of sitemap, one flag per page in `shared/seo/pages.ts`). **Requires external action:** write the pages (§8.4) |
| 10 | Newly created articles did not refresh the site | `createArticleAction` revalidated only admin paths; `/archive` and `/current-issue` are static and were never revalidated by any action; no sitemap or feed to refresh | High | One helper refreshes home, listings, archive, current issue, sitemap and feed on create, edit, publish and slug change | **Fixed** — `article-revalidation.ts` |
| 11 | No `hreflang` | Single-language, US-focused site (`lang="en"`) | Low | Not applicable. Revisit only if a second language is added | **No action needed** |
| 12 | Pagination | `/articles` and `/archive` list every article in one page (250–340 KB HTML at 31 articles) | Low now, Medium later | Paginate (`?page=n`, crawlable links, self-canonical per page) before roughly 100 articles | **Pending** (P2) |

### 4.2 On-page and metadata

| # | Issue | Evidence | Impact | Recommendation | Status |
|---|---|---|---|---|---|
| 13 | Twelve routes share one title and description | `<title>Beauty Professionals Magazine</title>` on about, account, archive, contacts, current-issue, privacy-policy, shopping, video, photovogue, careers, collaboration, user-agreement | High | Unique title and description per page | **Fixed** — `shared/seo/pages.ts`, `buildPageMetadata` |
| 14 | No Open Graph or Twitter Cards; no default share image | No `og:*` or `twitter:*` anywhere | High | Full social metadata; article pages use the 1600×1200 cover rendition (above Discover's 1200 px minimum), or the original upload for older articles that predate generated renditions; pages without a cover use the default share image | **Fixed** — `shared/seo/metadata.ts`, `public/images/og-default.png` |
| 15 | Home `<title>` is the bare brand; home `<h1>` is the cover story | Title `Beauty Professionals Magazine`; `<h1>` is whichever article is featured | Medium | Fuller brand description in the home title (Google's advice); a stable brand `<h1>`; the cover story becomes an `<h2>` | **Fixed** — visually identical |
| 16 | Long titles; unpredictable description lengths | Article titles up to 128 characters with brand; descriptions 52–455 characters | Medium | Drop the brand suffix on long titles; clamp meta descriptions at 160 characters, ending on a sentence where possible | **Fixed** |
| 17 | `/subscribe` snippet advertises something the page does not offer | Meta description says "free individual subscriptions"; individual email subscriptions are paused (`digitalSubscriptionsEnabled = false`) | Medium | Description follows the flag | **Fixed** |
| 18 | Section titles are single words | `Beauty \| Beauty Professionals Magazine`, `Runway \| …` | Medium | Keyword-bearing titles derived from each section's own description | **Fixed** — `seoTitle` in `categories.ts` |
| 19 | Heading order skips a level | Lighthouse `heading-order`: articles open with `h3`s and no `h2` | Medium | Render a leading `h3` as `h2` without changing its look | **Fixed** — `article-headings.ts`. Editors should still open sections with H2 |
| 20 | Duplicate "READ MORE" links | Lighthouse `link-text` (SEO 91 → 100) | Low | Descriptive accessible name | **Fixed** |
| 21 | Slugs with apostrophe artefacts | `an-author-s-methodology-for-men-s-haircut…`, `beautiful-hair-doesn-t-start…`, `…anastasia-huk-s-method…` | Low | Drop apostrophes in new slugs. **Do not change existing URLs** | **Fixed for new articles**; existing slugs untouched |
| 22 | No visible breadcrumb | Article pages had only an "All articles" back link | Low | Visible `Home / Section / Title` trail matching the structured data | **Fixed** |
| 23 | Colour contrast below 4.5:1 | Lighthouse `color-contrast`: kickers and dates use `text-black/42` to `/52` on white | Low | Raise those tokens to about `text-black/62` (≈ 5.9:1) | **Pending** — a design decision |

### 4.3 Structured data and brand signals

| # | Issue | Evidence | Impact | Recommendation | Status |
|---|---|---|---|---|---|
| 24 | No structured data | No JSON-LD on any page | High | Organization, WebSite, Periodical (with the registered ISSN), WebPage/CollectionPage, Article, BreadcrumbList | **Fixed** — validated against schema.org (§7). **Requires external action:** run Google's Rich Results Test after deploy |
| 25 | No favicon | `/favicon.ico` 404; every page logs a console error | Medium | Square icon at a multiple of 48 px, plus `favicon.ico` | **Fixed** with a **placeholder**: the gold "B" cut from the existing wordmark. **Requires external action:** supply an official square mark if one exists |
| 26 | Byline data is not clean | Every `author` value ends in `\| ISSN 3144-0541`; three begin with a typed "By" (renders "By By …"); one looks misspelled (`Valeriia Lizchuk`) | Medium | Store the name only; show the ISSN once, in the footer or About | Markup **fixed** (author name is extracted); data **Pending** in the admin |
| 27 | A published article has no publish date | `why-beauty-competitions-have-become-…` has `publishedAt = null`: no `<time>`, no date in markup, and Postgres sorts it first | Medium | Set the date in the admin | **Requires external action.** Markup falls back to the creation date |
| 28 | No author pages, no About, no editorial policy | Authors are plain text; About is a stub | Medium | Author profile pages and an About page support the Article `author.url` that Google recommends | **Pending** (P2/P3) |
| 29 | No RSS feed | none | Low | `/feed.xml`, advertised in `<head>` | **Fixed** |
| 30 | No `sameAs` profiles | no social URLs anywhere on the site | Low | Add the publication's real profiles to `SITE.sameAs` | **Requires external action** |

### 4.4 Content (editorial)

| # | Issue | Evidence | Impact | Recommendation | Status |
|---|---|---|---|---|---|
| 31 | Thin articles | 11 of 31 under 600 words; under 200: `the-return-of-marc-jacobs-beauty` (82), `lightway-by-iulia-andreeva` (95), `your-yelp-decoded` (106), `kateryna-lushakova` (184) | Medium | Expand, merge into a fuller piece, or label as brief news and keep out of the sitemap | **Pending** |
| 32 | Inline images have no alt text | 35 of 35 inline images across 13 articles; the editor supports alt text but treats it as optional | Medium | Write alt text; consider a non-blocking "No alt text" warning at publish | **Pending** |
| 33 | No contextual internal links; few sources | 0 body links to other articles in all 31; 27 articles cite no external source; tags are plain text, not links | Medium | Link related stories in the body; cite sources, especially for skin-care and medical claims | **Pending** |
| 34 | Inconsistent tags | Free-text tags mix people, brands, events and topics, and repeat categories ("Beauty, Vaulabs, Beauty") | Low | Normalize before any tag becomes a landing page | **Pending** |

### 4.5 Performance

| # | Issue | Evidence | Impact | Recommendation | Status |
|---|---|---|---|---|---|
| 35 | About 7.5 MB of images on every page | Four PNGs; the sponsor logos were set `unoptimized` and shown at 32–40 px tall; the page background texture was a 958 KB PNG | High | Let Next optimize the logos; convert the texture to WebP (958 KB → 10 KB, visually identical) | **Fixed** — about 8 MB → about 1 MB per page |
| 36 | Priority hints | LCP image had no `fetchpriority`; the first *related-story* card on article pages was preloaded at high priority | Medium | `fetchPriority="high"` on the LCP image; no priority for below-the-fold grids | **Fixed** |
| 37 | List queries load every article body | Home loaded all articles with their full `content_json`; one production request to `/articles` took 1.49 s to first byte and returned 338 KB | Medium | List queries skip the body column; home fetches 14 rows | **Fixed** |
| 38 | Static files had no cache lifetime | `/images/*` served with `max-age=0` | Low | One day plus a week of stale-while-revalidate | **Fixed** |
| 39 | Unused JavaScript | Lighthouse: ~240–316 KiB unused (GSAP, ScrollTrigger loaded on every page) | Low | Lazy-load motion code below the fold | **Pending** (P2) |
| 40 | Back/forward cache blocked | Dynamic pages send `Cache-Control: no-store` | Low | Accept, or move filtering to client state so listings can be cached | **Pending** |
| 41 | 96 MB unused file in `public/` | `public/Plate-.mp4`, referenced nowhere | Low | Remove from the repository | **Pending** (hygiene) |

---

## 5. Decisions that need the owner's confirmation

I made these judgment calls so the work could proceed without stopping. Each is easy to reverse.

| Decision | Why | How to reverse |
|---|---|---|
| **Placeholder pages are `noindex`.** | Indexing "coming soon" copy dilutes the site and Google may classify it as soft 404. | Set `indexable: true` for the page in `shared/seo/pages.ts` once it has real content. |
| **`/archive` canonicalizes to `/articles`.** | It renders the identical grid; consolidating avoids a duplicate. | Remove `canonicalPath` on `archive` in the same file. |
| **`/articles/why-beauty-compe` redirects (308) to the full-slug article.** | Same title and body, both published. The full slug is the more complete record and is the one linked from the home page. | Delete the entry in `next.config.ts`. The old record should still be unpublished. |
| **Favicon is the gold "B" from the wordmark.** | The site had none, and the repository holds only a wide wordmark. No new brand mark was invented. | Replace `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico` (or edit and rerun `npm run generate:seo-assets`). |
| **Home `<h1>` is now an invisible brand heading**; the cover story is an `<h2>`. | Stable, brand-level main heading. No visual change. | Edit `features/home/components/HomePage.tsx`. |
| **The visible "All articles" back link at the top of article pages became a breadcrumb.** | Structured data must match visible content. "Return to all stories" remains at the foot of the article. | Re-add the link in `ArticleDetailPage.tsx`. |
| **`loading.tsx` removed from public routes.** | It is the cause of findings 3 and 4. Cost: clicking to a dynamic page (listing, section, Lookbook) now waits for the server instead of flashing a skeleton. Measured locally: a client navigation to `/lookbook` completed in about 140 ms. Pages that are prerendered (articles, home, info pages) are unaffected. | If a skeleton is wanted, add a loading indicator driven by `useLinkStatus` in the header rather than a route-level `loading.tsx`. |
| **Metadata always blocks (`htmlLimitedBots: /.*/`).** | Next.js streams metadata into `<body>` for clients it assumes run JavaScript, including Googlebot. Title, canonical and robots belong in `<head>` for every crawler. No latency cost here because pages await their data before the first byte anyway. | Remove the line in `next.config.ts`. |
| **Home and section titles and descriptions** (for example `Beauty Professionals Magazine: Industry Interviews & Insight`). | Google advises a fuller brand description on the home page. Wording is derived from the site's own copy. | Edit `SITE` in `shared/seo/site.ts` and `seoTitle` in `categories.ts`. |

---

## 6. What was implemented

### Architecture

All search logic is centralized. Pages do not hand-write `<head>` tags.

| Concern | File |
|---|---|
| Canonical origin (overridable with `NEXT_PUBLIC_SITE_URL`), brand, ISSN, logo, share image, `absoluteUrl()` | `shared/seo/site.ts` |
| Title, description, canonical, robots, Open Graph, Twitter, RSS link — one builder | `shared/seo/metadata.ts` (`buildPageMetadata`) |
| JSON-LD builders and the XSS-safe serializer | `shared/seo/json-ld.ts`, `shared/components/seo/JsonLd.tsx` |
| Registry of fixed pages and whether each is indexable | `shared/seo/pages.ts` |
| Sitemap rules, `robots.txt` rules, RSS builder | `shared/seo/sitemap.ts`, `robots.ts`, `rss.ts` |
| Article metadata and structured data | `features/articles/seo/article-seo.ts` |
| Section metadata (`noindex` when filtered or empty) | `features/categories/seo/category-seo.ts`, `server/category-metadata.ts` |
| Lookbook edition canonicals | `features/lookbook/seo/lookbook-seo.ts` |
| Cache refresh after article changes | `features/articles/server/article-revalidation.ts` |

### Indexing policy

| URL | Treatment |
|---|---|
| `/`, `/articles`, `/articles/[slug]`, populated `/category/[slug]`, `/shopping`, `/subscribe`, `/where-to-find`, `/lookbook` and older editions | Indexable, self-canonical, in the sitemap |
| `/articles?q=`, `?tag=`, `?category=`, `?sort=popular`, and the same on section pages | `noindex, follow`, no canonical, not in the sitemap |
| `/category/[slug]` with no published article | `noindex`, not in the sitemap |
| `/archive` | Canonical → `/articles` |
| `/where-to-find?location=…` | Canonical → `/where-to-find` |
| `/lookbook?year=&month=` for the newest edition or junk values | Canonical → `/lookbook`; an older edition is its own canonical page |
| About, Contacts, Careers, Collaboration, Video, PhotoVogue, Current Issue, Privacy Policy, User Agreement, Account | `noindex, follow`, not in the sitemap until `indexable: true` |
| `/admin/*` | `Disallow` in `robots.txt`, `noindex, nofollow, nocache` meta, and an `X-Robots-Tag` header; unauthenticated requests redirect (307) |
| `/api/*` | `Disallow` plus `X-Robots-Tag: noindex, nofollow` |

### Structured data (per page)

- **Home:** Organization (with logo), WebSite (name, alternate names, bare domain, for Google's site-name feature), Periodical (the registered ISSN), WebPage.
- **Article:** the above, plus Article (headline, description, images in every generated rendition, ISO dates, author as `Person` with the name only, publisher, section, keywords, word count) and BreadcrumbList. `datePublished` falls back to the creation date when `publishedAt` is empty.
- **Listings, sections, Lookbook, Subscribe, Where to Find:** WebPage or CollectionPage.
- Deliberately omitted: `sameAs` (no profiles are configured); ratings, reviews and events; `SearchAction` (Google no longer shows the sitelinks search box); and BreadcrumbList on pages without a visible trail.

### All files

New: `shared/seo/*` (site, text, metadata, json-ld, pages, sitemap, robots, rss and their tests), `shared/components/seo/JsonLd.tsx`, `shared/components/public/Breadcrumbs.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/feed.xml/route.ts`, `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, `public/images/og-default.png`, `public/images/journal-bg.webp`, `features/articles/seo/*`, `features/articles/lib/article-text.ts`, `article-headings.ts`, `features/articles/server/article-revalidation.ts`, `features/categories/seo/*`, `features/categories/server/category-metadata.ts`, `features/lookbook/seo/*`, `scripts/generate-seo-assets.mjs`, `scripts/seo-check.mjs`, and test files beside each module.

Changed: `app/layout.tsx`, `app/globals.css`, `app/not-found.tsx`, `app/admin/layout.tsx`, `next.config.ts`, `package.json`, `.env.example`, `README.md`, the route file of every public page, `ArticleDetailPage`, `ArticleBody`, `ArticleGrid`, `ArticleCoverImage`, `ArticlesPage`, `HomePage`, `HomeEditorialLead`, `CategoryPage`, `ShoppingPage`, `SponsorsStrip`, `LookbookPage`, the article and lookbook queries and server actions, slug validation, and the category config and types.

Deleted: `app/loading.tsx`, `app/(public)/articles/loading.tsx`. (`SiteLoading` and `ArticlesLoading` remain in `shared/components/public/` but are unused; `HomeHero`, `ArticleHero`, `HomeLatestArticles`, `HomeFeaturedCategories` and `CategorySections` were already unused.)

### Commands added

```bash
npm run seo:check -- https://beautyprofessionalsmagazine.com   # audit any deployment
npm run generate:seo-assets                                    # rebuild icons, share image, texture
npm test                                                       # now includes the SEO modules
```

---

## 7. Verification

### Automated

| Check | Result |
|---|---|
| `npm test` | **185 passed**, 0 failed (the repository had 48 tests before this work; 137 are new) |
| `npx tsc --noEmit` | no errors |
| `npm run lint` | no problems |
| `npm run build` | succeeds; `robots.txt`, `sitemap.xml` (1 h), `feed.xml` (1 h), icons appear in the route table |
| `npm run seo:check` against the local production build | **652 / 652** |
| JSON-LD vs the full schema.org vocabulary, all 8 page types | every `@type` and property exists, every property is valid for its type, `@id`s are unique, references resolve. A control file with a misspelled property and a property on the wrong type was correctly rejected |

`seo:check` asserts, for every URL in the sitemap: status 200; canonical equal to itself and on the canonical origin; no `noindex`; exactly one `<h1>` and one `<main>`; Open Graph title and absolute image; Twitter large card; structured data that parses; content present in the initial HTML; a favicon; the RSS link; a unique title. It also asserts: the placeholder, filter, admin and login pages are `noindex`; `/archive` and `?location=` canonicalize correctly; the duplicate slug redirects (308); unknown pages, articles and sections return a real 404; the feed is well-formed; `/favicon.ico` and the share image are served; `/admin` sends `X-Robots-Tag`.

### Browser (built-in pane, local production build)

The home page, an article (desktop DOM and 375 px mobile), and a section page rendered with unchanged design; the Lookbook was reached by client-side navigation and its title and heading were confirmed. At 375 px there is no horizontal overflow; the new breadcrumb wraps cleanly; the sponsor logos render at the same size and vertical position as production (271×46, 386×66 and 293×50 px); client-side navigation works without a full reload; the mobile menu opens and closes; the only console message is the Vercel Analytics script, which exists only on Vercel. Metadata for a Googlebot user-agent is in `<head>` with no hidden segments.

### Lighthouse 13.5.0 (lab; simulated Slow-4G for mobile, desktop preset)

**Local production build, same machine and database, before vs after:**

| Page | Form | Perf before → after | LCP before → after | TBT before → after | Page weight before → after | SEO before → after |
|---|---|---|---|---|---|---|
| Home | mobile | 56 → **99** | 7.5 s → **2.3 s** | 760 → **30 ms** | 8.1 → **1.1 MiB** | 91 → **100** |
| Home | desktop | 84 → **100** | 2.5 s → **0.6 s** | 130 → **0 ms** | 8.1 → 1.0 MiB | 91 → **100** |
| Article | mobile | 75 → **98** | 9.0 s → **2.5 s** | 70 → **30 ms** | 7.9 → 0.8 MiB | 100 → 100 |
| Article | desktop | 91 → **100** | 1.8 s → **0.7 s** | 110 → **0 ms** | 7.9 → 0.8 MiB | 100 → 100 |
| `/articles` | mobile | 60 → **95** | 39.2 s → **3.0 s** | 600 → **40 ms** | 8.0 → 0.9 MiB | 100 → 100 |
| `/articles` | desktop | 82 → **100** | 2.7 s → **0.6 s** | 150 → **0 ms** | 8.2 → 1.2 MiB | 100 → 100 |
| Section (`/category/beauty`) | mobile | 63 → **98** | 7.8 s → **2.5 s** | 510 → **20 ms** | 8.0 → 0.9 MiB | 100 → 100 |
| Section | desktop | 88 → **100** | 1.8 s → **0.6 s** | 170 → **0 ms** | 8.1 → 1.0 MiB | 100 → 100 |

CLS was 0 before and after. Accessibility stays at 95–96 and Best Practices at 96: the remaining items are the contrast tokens (finding 23), unused JavaScript and missing source maps. Locally, the Best Practices console error is Vercel Analytics' script, which does not exist outside Vercel; the favicon 404 that appeared in the baseline is gone.

**Production, 2026-10-13 (before):** mobile 84 / 55 / 57 / 88, desktop 86 / 83 / 67 / 92 for home / article / articles / section, with about 8 MB per page.

### Not verified (needs deployment or external access)

- The production Lookbook error and its cause.
- Rich Results Test, Schema Markup Validator, and URL Inspection in Search Console.
- Real-user Core Web Vitals (CrUX). A new site usually lacks enough traffic for field data; check again after about 28 days of traffic.
- That Vercel serves the optimized logos and the sitemap as expected. The `seo:check` command above is the acceptance test.

---

## 8. Research: niche, search intent, competitors, opportunities

### 8.1 What the site is, and who it is for

An English-language US trade and culture magazine for **beauty professionals**: nail technicians, lash artists, hair stylists and barbers, estheticians and clinical-skin practitioners, and salon and Med Spa owners. A print edition (distributed to salons, schools, Med Spas and clinics via a map at `/where-to-find`) sits beside the web articles; PDF editions live in the Lookbook. Sponsors (International Beauty Professionals Association, Andreeva Consulting Inc, NePOP Radio/media) and several article topics (O-1 and EB-1A visas, foreign-trained professionals) point to a strong **immigrant-professional** thread in the audience; that is an inference from the site's own copy, not measured data.

Search intent splits into four groups: **informational** (technique, science, how-to), **professional development** (licensing, competitions, building a brand or business), **commercial investigation** (tools and products; the Shopping section) and **brand/navigational** (the magazine itself, finding or requesting a copy).

### 8.2 Competitors observed in live search results (2026-10-13)

None of these is a measured ranking competitor; they are the publications that appeared when I searched the site's topics. Their SERP positions were not captured.

- **US trade titles:** NAILS Magazine (Bobit), Salon Today, American Salon, The Industry Source, Salonpreneur Magazine, The Beauty Consultant Magazine (TBC Media Group), NailPro.
- **UK/AU titles read in the US:** Professional Beauty, Hairdressers Journal, Scratch Magazine.
- Lash brands and salon blogs dominated the results for technical topics such as LED lash adhesives, and I found no independent testing in them: their safety and retention claims are manufacturer-level evidence. Competition pages (American Salon contests, Nailympia, Professional Beauty's nail competition) answered "how to enter" queries, and state licensing boards answered foreign-trained licensing queries.

**Brand collision.** "Beauty Professionals Magazine" sits next to "Professional Beauty" and "The Beauty Consultant". Search engines will need consistent naming, structured data and links to separate them. The Organization, WebSite and Periodical markup added here (with the ISSN registered at the ISSN Portal as "Beauty professionals magazine (Online)", United States) supports that.

### 8.3 Keyword clusters (candidate queries — hypotheses, no volumes)

Grounded in what the magazine has already published. Treat the example queries as starting hypotheses to test in Search Console, not as targets with known demand.

| Cluster | Existing coverage on the site | Example candidate queries | Suggested page type | Notes |
|---|---|---|---|---|
| Technique libraries (nails) | *Author-Developed Techniques in Precision Hardware Manicure and Nail Restoration* (4,300 words, the site's deepest piece), *Beauty Is More Than Just Doing Nails* | precision hardware manicure; nail restoration technique | Pillar guide plus step-by-step child articles | Strongest existing asset: add images with alt text, sources, and internal links to it |
| Lash science | *LED vs Traditional Lash Glue* (725 words) | LED vs traditional lash glue; lash adhesive curing | Independent explainer | Existing results are brand-written; an evidence-based, cited explainer fits the gap |
| Hair | *Men's Haircut Design…Head Anatomy and Hair Growth Patterns*, *Blonde Gone Dark*, *Beautiful Hair Doesn't Start With a Haircut* | men's haircut design; hair growth patterns barbering; blonde to dark color correction | How-to and methodology guides | |
| Skin and clinical beauty | *Rebuilding the Skin Barrier…*, *Balance Over Battle* (acne), *The Lab Has Won* | skin barrier repair after inflammation; acne care method | Expert-reviewed explainers | Health-adjacent: needs a named qualified author or reviewer, cited sources and a disclaimer |
| Business growth | *How Beauty Professionals Can Turn Their Expertise Into a Product Brand*, *Your Yelp Decoded*, *Why Beauty Competitions…* | build a product line as a stylist; Yelp for salons; beauty competitions career | Practical guides | Several are very short today (§4.4) |
| **Licensing and immigration** | *Lightway by Iulia Andreeva* (tags O-1, EB-1A) | cosmetology license foreign-trained; O-1 visa for beauty professionals; transfer cosmetology license by state | State-by-state hub with links to licensing boards | Largest unfilled niche that matches the sponsors; rules differ by state and change, so cite the boards and add a not-legal-advice note |
| Competitions and events | *BBF 2026*, *Why Beauty Competitions…* | how to enter a nail competition; beauty championships for hairstylists | Competitions hub plus an events calendar | Results found today were older and competitor-owned |
| Trends | *The Beauty Algorithm*, *The Algorithm of Beauty*, *The End of Clean*, *The New Beauty Equation* | AI in the beauty industry; clean beauty trend | Analysis pieces | Time-sensitive: refresh and date them |
| Brand and distribution | `/subscribe`, `/where-to-find`, `/lookbook` | beauty professionals magazine; free salon magazine; where to get a salon magazine | Existing pages | Captures branded and transactional intent; needs the Lookbook fixed |

### 8.4 Content gaps and landing-page opportunities

1. **Hubs:** Licensing and immigration; Competitions and championships; a technique library per specialty (nails, lash, hair, skin). Each should be a hand-written pillar page linking to its articles, which is also the internal-link structure the site lacks.
2. **Author pages** (name, credentials, photo, links to their articles, `Person` markup with `url`/`sameAs`). Google recommends author `url` or `sameAs` to disambiguate authors, and 9 distinct contributors already write for the site.
3. **Trust pages:** About (mission, editorial standards, who publishes, the ISSN, how to reach the desk), Contacts, an editorial and corrections policy, Privacy Policy and User Agreement. The site collects names, emails and postal addresses through the subscription form, stores them in its database, emails through Resend, and uses Vercel Analytics and Vercel Blob; a privacy policy should say so and have legal review.
4. **A real Current Issue page** pointing at the newest Lookbook edition instead of repeating the featured article.
5. **Tag and sub-section pages.** The header menu links to `?tag=Hair`, `?tag=Skin` and so on. These are valuable topics but are currently filter views (`noindex`). When a topic has enough articles and some introductory text, give it a real URL such as `/category/beauty/hair` and make it indexable.

**Proposed outlines (placeholders in brackets; no factual claims invented):**

- **About:** "[Name] is [one sentence on what the magazine is and who it serves]. Published by [legal publisher], it has appeared since [month year]. ISSN 3144-0541." Then: editorial mission; how stories are chosen; how contributors are vetted; how to submit or contact; where to find the print edition; link to Lookbook and Subscribe.
- **Contacts:** one block each for editorial, partnerships and advertising, distribution, press; a real email address for each; a postal address if the publisher wants one; typical reply time.
- **Privacy Policy:** what is collected (subscription name, email, postal address, organization details), why, where it is processed (hosting, email delivery, analytics, file storage), how long it is kept, how to request access or deletion, how to contact. Have counsel review this; it is not legal advice.

### 8.5 Why visibility is probably poor

| Factor | Basis |
|---|---|
| The page body was hidden from non-JavaScript crawlers, and unknown URLs returned 200 | **Verified** (§3) |
| No robots, sitemap, canonicals, social or structured data; Googlebot was left to discover everything by links alone | **Verified** |
| Placeholder and duplicate pages in the crawl | **Verified** |
| The Lookbook, a main navigation item, is down | **Verified symptom** |
| A young domain (about 4½ months of content) with no search history | **Verified** by article dates |
| Few or no inbound links from other sites | **Hypothesis** — needs a backlink tool or Search Console Links |
| Brand-name collision with established "Professional Beauty" titles | **Hypothesis**, supported by what search returned |
| About a third of articles are thin; 27 of 31 cite no external source; no author entities | **Verified** content facts; their ranking effect is a hypothesis |
| The domain may not be verified, or the sitemap never submitted | **Hypothesis** — no way to check |

---

## 9. Implementation plan and roadmap

### P0 — critical (blocks crawling, indexing or correct rendering)

| Item | Status |
|---|---|
| `robots.txt` and sitemap | **Done** |
| Content in the initial HTML; remove the Suspense boundaries | **Done** |
| Real 404s instead of soft 404s | **Done** |
| Canonicals and `noindex` for duplicates, filters, placeholders, admin | **Done** |
| Duplicate article redirect | **Done** (code); unpublish the old record — *owner* |
| **Deploy this branch** | *Owner* |
| **Lookbook: check and apply the production migration** | *Owner* |
| **Verify the site in Search Console and submit the sitemap** | *Owner* |

### P1 — high impact

| Item | Status |
|---|---|
| Unique titles and descriptions; Open Graph and Twitter | **Done** |
| Structured data (Organization, WebSite, Periodical, Article, BreadcrumbList, CollectionPage) | **Done** |
| Favicon, share image, RSS feed | **Done** (favicon is a placeholder) |
| Cache refresh when articles change | **Done** |
| Image weight, LCP priority, lighter queries | **Done** |
| **Write About, Contacts, Privacy Policy, User Agreement; flip `indexable`** | *Owner* — highest content priority, because they are trust pages |
| **Fix the byline data, set the missing publish date, add alt text to 35 images** | *Owner/editors* |

### P2 — further optimization

- Expand or merge the 11 articles under 600 words; add contextual links between related articles and cite sources.
- Author pages with `Person` markup; link the byline to them.
- Optional editor guard: warn when an inline image has no alt text, or when a published article has no `publishedAt`.
- Make topic tags into real URLs (indexable) once normalized and populated.
- Paginate `/articles` before about 100 articles.
- Lazy-load GSAP and ScrollTrigger below the fold (about 240 KiB of JavaScript is unused on first paint).
- Raise the low-contrast text tokens (design sign-off): `text-black/42–52` → about `text-black/62`.
- Slug history: a redirects table, so changing an article's slug does not 404 the old URL.
- Optional SEO title and description override fields per article (needs a database migration).
- Remove `public/Plate-.mp4` (96 MB) and the now-unused loading components.

### P3 — long-term growth

- **Topical authority:** the hubs and technique libraries in §8.4, written to be better than what the observed competitors publish (named expert authors, sources, original photography, dated and updated).
- **Authority-building:** links from the sponsors (IBPA, Andreeva Consulting, NePOP), competition organizers, trade associations, schools and distribution partners; contributor guest pieces on other trade sites; listing the magazine in industry directories.
- **Search Console routine:** weekly for the first eight weeks (coverage, queries, pages, links), then monthly; use query data to confirm or discard the §8.3 hypotheses.
- **Field Core Web Vitals** once traffic allows (Search Console report, PageSpeed Insights).
- **Analytics:** Vercel Analytics is in place; add a goal for Subscribe submissions.
- **AI search:** Google states there is no special markup or `llms.txt` needed. What helps is crawlable text, clear internal links, accurate structured data and unique reporting; all addressed here.

### Manual action checklist

1. **Deploy** the branch (preview first). Run `npm run seo:check -- <preview-or-production-url>`; all checks should pass.
2. **Production database:** compare the `lookbook` table with migration `drizzle/0006_unusual_captain_cross.sql`; apply it (`npx drizzle-kit migrate`) if the columns `issue_year` and `issue_month` are missing. Confirm `/lookbook` loads.
3. **Search Console:** add the domain as a **Domain property** and verify by DNS. (Alternatively set `GOOGLE_SITE_VERIFICATION` in Vercel for the HTML-tag method.) Do the same in Bing Webmaster Tools (it can import from Search Console).
4. **Submit** `https://beautyprofessionalsmagazine.com/sitemap.xml` in both. Use **URL Inspection** on the home page, one article and one section, and **Request indexing**.
5. In the **Pages** report expect, and accept: "Excluded by noindex" for the placeholder pages and filter views, and "Alternate page with proper canonical" for `/archive`. Watch that "Soft 404" and "Duplicate" entries disappear.
6. Run Google's **Rich Results Test** and the **Schema Markup Validator** on the home page and one article.
7. **Admin tasks:** unpublish `why-beauty-compe`; set `publishedAt` on *Why Beauty Competitions Have Become the #1 Career Growth Tool*; remove typed "By" prefixes and decide where the ISSN should appear (the markup already strips it); add alt text to inline images; review the four articles under 200 words.
8. **Write** About, Contacts, Privacy Policy and User Agreement. Then set `indexable: true` for each in `shared/seo/pages.ts` and redeploy.
9. **Brand assets:** supply an official square logo (replace the placeholder icon files) and the publication's social profile URLs (`SITE.sameAs` in `shared/seo/site.ts`).
10. Optionally set `NEXT_PUBLIC_SITE_URL`, `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` in the hosting dashboard (see `.env.example`).
11. **After about 28 days of traffic,** check field Core Web Vitals in Search Console and PageSpeed Insights.
12. Add `npm run seo:check -- https://beautyprofessionalsmagazine.com` to the release routine.

---

## 10. Tooling evaluation

I looked for existing SEO audit skills and tools and installed none.

| Option | What it is | Assessment |
|---|---|---|
| **Lighthouse 13.5.0** | Official `GoogleChrome/lighthouse`; maintained by Chrome team members; ~5.4 million downloads a week | **Used**, installed in a scratch directory outside the repository; runs locally and sends no site data anywhere |
| schema.org vocabulary file | Official JSON-LD vocabulary | **Used** for offline structured-data validation |
| Anthropic plugin directory: "SEO Audit", "rampstack-seo", "Claude SEO and GEO Site Audit" | Community-tier plugins (directory-reviewed only; no content scan); instruction-only | Not installed. They would duplicate the checks above and add nothing verifiable |
| Anthropic plugin directory: "AEOTester" | Community-tier, **privileged** reach; edits code and adds `llms.txt` | Not installed. Elevated permissions, and Google states `llms.txt` is not needed |
| "HarborRank SEO", "SEO GSC Wizard", Ahrefs, Ubersuggest, OpenSEO (MCP) | Remote services that need the owner's account, OAuth grants or a paid plan | Not installed: they send data to a third party and need credentials only the owner can grant. **Worth considering later:** the Search Console connector once the property is verified, and a backlink or keyword tool (Ahrefs, Ubersuggest) to replace the hypotheses in §8 with data |

---

## 11. Keeping it healthy

- A **new fixed page** needs an entry in `STATIC_PAGES` and `metadata = getStaticPageMetadata("key")`; the sitemap follows.
- **Never add `loading.tsx`** to a public route (see the README).
- Add new indexable listing views to the sitemap logic and decide whether their parameters should be `noindex`.
- Run `npm test` and `npm run seo:check` before each release.
- When an article's slug must change, add a redirect in `next.config.ts` for the old URL until a slug-history table exists.

---

## Sources

- Google Search Central: [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Pagination and incremental loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [HTTP status codes and network errors](https://developers.google.com/search/docs/crawling-indexing/http-network-errors), [Site names](https://developers.google.com/search/docs/appearance/site-names), [Favicon](https://developers.google.com/search/docs/appearance/favicon-in-search), [Title links](https://developers.google.com/search/docs/appearance/title-link), [Google Discover](https://developers.google.com/search/docs/appearance/google-discover), [AI features](https://developers.google.com/search/docs/appearance/ai-features), [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- Next.js: [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld)
- [schema.org vocabulary](https://schema.org/version/latest/schemaorg-current-https.jsonld), [ISSN Portal record 3144-0541](https://portal.issn.org/resource/ISSN/3144-0541), [Lighthouse](https://github.com/GoogleChrome/lighthouse)
