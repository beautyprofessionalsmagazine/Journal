# Beauty Professionals Magazine — SEO audit and implementation report

**Site:** https://beautyprofessionalsmagazine.com/

**Audit completed:** 2026-10-15

**Codebase:** Next.js 16.3.5 App Router, React 19, TypeScript, Tailwind 4, Drizzle/Postgres, TipTap, Vercel Blob, GSAP, Vercel Analytics

**Working branch:** `audit/seo-optimization`

**Deployment status:** implemented and verified in a local production build; **not deployed or pushed by this audit**

“Production” below means the live public site. “Local” means the production build created from this branch against the configured development database. This distinction matters: the live site still serves the pre-audit implementation until the branch is deployed.

## 1. Executive summary

### Current condition

The live site has strong editorial subject matter and a clean visual identity, but its production SEO layer is severely incomplete. On 2026-10-15, the live deployment still returned 404 for `robots.txt` and all common sitemap locations, lacked canonicals, social metadata and structured data, left placeholder/admin/filter pages indexable, and delivered primary page content through a hidden streamed segment. The production acceptance script passed only **16 of 45** top-level checks.

The branch fixes the crawl, metadata and rendering foundation rather than chasing a score. Its local production build passed **652 of 652** HTTP/HTML checks across every URL in its generated sitemap, **199 of 199** unit tests, lint, TypeScript through `next build`, and the production build itself. Four final Lighthouse runs scored **100 SEO, 100 accessibility and 100 best practices**; performance was 92 mobile/100 desktop on home, 96 mobile on an article and 94 mobile on a section page. Lab performance is not field Core Web Vitals and is reported as such.

### Major problems found

1. No production robots file or sitemap, and no automated published-content feed.
2. Primary content hidden behind public route-level loading boundaries; soft-404 behavior on unknown article/category URLs.
3. No canonical, Open Graph, X/Twitter or JSON-LD system; repeated generic metadata across templates.
4. Indexable placeholders, filters, account/admin surfaces and a duplicate article.
5. Very large shared PNG assets and incorrect responsive sizing, producing roughly 8 MiB pages in the original baseline.
6. Incomplete publication identity: placeholder About/Contact/legal pages, no author profiles, no editorial/corrections policy and no configured social profiles.
7. Content-quality debt: in the current local database, 20 of 20 inline images across 6 articles lack alt text; several articles are briefs under 300 words; body-level contextual internal links and citations are sparse.
8. The editorial database and public site are not the same dataset (the configured local database has 22 published records); production content changes must therefore be re-audited after deployment rather than inferred from local counts.

### Biggest organic growth opportunities

- Build authoritative professional-use clusters around nail techniques, lash science, haircut methodology/color correction, salon business, competitions, beauty technology, and licensing/immigration for foreign-trained professionals.
- Turn real contributors into disambiguated author entities with profile pages, credentials supplied by the authors, and links to their work.
- Publish the missing trust pages and editorial/corrections/sponsored-content policies.
- Backfill accurate image alt text, captions/credits and contextual links in existing articles; expand or intentionally classify the shortest pieces as briefs.
- Use Search Console data after deployment to replace keyword hypotheses with impressions, queries, country/device data, index coverage and field Core Web Vitals.

### Implemented improvements

- Central metadata, canonical, robots, Open Graph, Twitter and large-image-preview system.
- Dynamic published-only XML sitemap with cover and inline article images; dynamic RSS feed.
- Organization, WebSite, Periodical, WebPage/CollectionPage, Article, Person and BreadcrumbList JSON-LD with shared `@id` references.
- Real 404s, duplicate redirect, filter/admin/placeholder noindex rules and server headers.
- Search-visible HTML without the public root loading boundary.
- Automated metadata, dates, images, schema, sitemap/feed refresh and noindex behavior for future CMS content.
- Dedicated editor-controlled **1600 × 900 (16:9)** social/Discover crop, with safe fallbacks for legacy records.
- Publish guardrails for descriptions, covers, cover alt text, inline image alt text and future publication dates.
- Visible and machine-readable publication/update dates driven by one date policy; cleaned visible/schema bylines.
- Correct responsive image sizing, priority hints, query trimming, cache headers, image conversion and accessible small-text contrast.
- A regression suite and full-deployment acceptance command.

## 2. Scope, architecture and method

### Architecture and publishing flow

- Next.js App Router pages and route handlers; metadata is generated server-side.
- Postgres articles accessed through Drizzle. Article status is `draft` or `published`; the public queries and sitemap filter on `published`.
- TipTap JSON is the article-body source. The editor already supports inline image `alt`, dimensions and alignment.
- Cover records store the original URL, alt text, crop settings and generated per-placement WebP variants.
- Vercel Blob stores article images and Lookbook PDFs.
- Server actions create/update articles, generate cover variants and revalidate all affected public surfaces.
- GSAP motion is scoped through `useGSAP`, cleaned up, transform/opacity based, batched for repeated elements and reduced-motion aware. It was retained to preserve the requested experience; a broad lazy-loading refactor was not justified by the low final blocking time.

### Pages inspected

Home; article detail; `/articles`; archive; Beauty, Fashion, Runway, Culture, Living and Shopping sections and their filter states; Lookbook/current issue; Video and PhotoVogue; Subscribe and Where to Find; About, Contacts, Careers, Collaboration, Privacy Policy, User Agreement and Account; admin login, article create/edit/list and the article server actions; robots, sitemap, RSS, icons and error/404 behavior.

### Live and local checks

- Raw production HTTP/HTML and redirect inspection.
- Browser rendering through the installed Claude SEO Playwright runtime.
- Production sitemap discovery, agent-user-agent matrix and preload checks.
- Repository-wide route, metadata, schema, query, image and CMS inspection.
- Development-database content audit without modifying records.
- Local production build, 652-route/metadata assertions and four serial Lighthouse runs.
- Current official Google Search Central guidance for Articles, Images, Discover, publication dates, Core Web Vitals, News sitemaps, organization/site-name markup and general structured-data policies.

### Specialized tooling

The requested open-source [`AgriciDaniel/claude-seo`](https://github.com/AgriciDaniel/claude-seo) plugin was source-reviewed and installed at version **2.4.2**. Its Windows runtime was initialized with Python 3.12 and Playwright Chromium; `doctor` returned `ready: true` and `browser_ready: true`. The Claude CLI itself is not installed, so the plugin’s documented Windows runtime wrapper was used directly for sitemap discovery, page rendering, PageSpeed/CrUX checks, agentic crawl checks and preload diagnostics.

The plugin confirmed the live robots/sitemap failures. PageSpeed Insights returned HTTP 429 and CrUX had no available origin data, so no field metrics are claimed. `llms.txt`, Markdown negotiation, WebMCP and agent catalogs were not added: they are optional/community mechanisms, not Google Search requirements, and the site does not expose an agent or API product that needs them.

## 3. Full technical findings

Severity: **Critical** prevents reliable crawl/index/render behavior; **High** is a major discovery or quality issue; **Medium** is material but not blocking; **Low** is hygiene or future scale.

| Problem | Affected URL/page template | Severity | Evidence | Recommended solution | Implementation status |
|---|---|---:|---|---|---|
| No robots file on live site | `/robots.txt` | Critical | Live and plugin discovery: HTTP 404 | Publish deliberate allow/disallow rules and sitemap reference | **Fixed in code**, deployment pending |
| No XML sitemap on live site | `/sitemap.xml` and common alternatives | Critical | All tested locations returned 404 | Dynamic published-only sitemap with real canonical URLs and image entries | **Fixed in code**; local: 33 URLs, 44 image entries |
| Primary HTML hidden by streamed loading boundary | All public routes | Critical | Raw live HTML placed real page in `<div hidden id="S:0">`; initial visible shell was a skeleton | Remove public route-level `loading.tsx` boundaries | **Fixed in code**; local checker confirms content in initial HTML |
| Soft 404s | Unknown `/articles/[slug]` and `/category/[slug]` | Critical | Baseline returned HTTP 200 | Resolve absence before rendering and call `notFound()` | **Fixed**, local returns 404 |
| Historical Lookbook failure | `/lookbook` | Low | Earlier baseline rendered an error; recheck on 2026-10-15 returns 200 with the Lookbook heading | Keep in deployment smoke tests | **Currently healthy**; no migration action recommended without database evidence |
| Duplicate published article | Short `why-beauty-compe` URL and full slug | High | Same editorial content at two URLs | Keep full slug, permanent redirect old URL, unpublish duplicate row | **308 fixed in code**; unpublish requires editorial/database action |
| Missing canonicals | All live public templates | High | No live `rel=canonical` | Central absolute self-canonicals; consolidate true duplicates | **Fixed in code** |
| Filter/search URL duplication | `/articles?...`, category/shopping filters | High | Parameter views repeat/subset listing content | `noindex, follow`, no canonical; keep links crawlable | **Fixed**; filtered JSON-LD is now omitted too |
| Admin/account discoverability | `/admin/*`, `/api/*`, `/account` | High | Baseline lacked sufficient directives | Robots rules, meta robots and `X-Robots-Tag` | **Fixed in code** |
| Placeholder pages indexable | About, Contact, Careers, Collaboration, Video, PhotoVogue, Current Issue, legal pages | High | Pages contain placeholder copy | `noindex, follow` and omit from sitemap until real content exists | **Fixed in code**; content remains an owner task |
| CMS updates did not refresh all discovery surfaces | Article create/edit/publish | High | Old actions omitted sitemap/feed/static surfaces | Central revalidation helper for affected routes, sitemap and feed | **Fixed** |
| Repeated generic titles/descriptions | Static routes and sections | High | Twelve baseline routes shared brand metadata | Central page registry and template-specific metadata | **Fixed** |
| No Open Graph/X metadata | All live templates | High | No `og:*` or Twitter tags | Shared large-card metadata; article-specific cover/title/description | **Fixed** |
| Unsuitable social crop reuse | Article cards/previews | Medium | Wide social previews used a 4:3 homepage crop | Add editor-controlled 1600×900 `socialShare` rendition | **Fixed for future saves**; 0/22 current local covers have the new legacy-backfill variant |
| No structured data | All live templates | High | No live JSON-LD | Accurate shared graph and template-specific entities | **Fixed**, unit/HTML validated; Google Rich Results Test still needs deployed URLs |
| Duplicate/contradictory schema on filtered pages | Filtered listings | Medium | Filter URL was noindex but still emitted canonical CollectionPage data for base listing | Omit collection JSON-LD whenever filters are active | **Fixed** |
| Weak/stale date signals | Article pages | Medium | One production article lacked `publishedAt`; visible and schema dates could diverge | Creation fallback, visible Published/meaningful Updated dates, same values in OG/JSON-LD | **Fixed in code**; database date should still be corrected |
| Dirty author strings | Article bylines/schema | Medium | ISSN appended to authors; some values start with “By” | Sanitize presentation/schema; clean stored names manually | **Code fixed**; source-data cleanup pending |
| No author entities/pages | Articles and contributors | Medium | Author is plain text only | Real author profiles and `Person.url`/verified credentials | **Pending editorial/product work** |
| No RSS | `/feed.xml` | Medium | Missing in baseline | Published-only RSS advertised in `<head>` | **Fixed**; local feed has 22 items |
| Inline images absent from sitemap | Article detail/image discovery | Medium | Sitemap originally included covers only | Traverse TipTap and add unique inline URLs | **Fixed**; local sitemap has 44 total image entries |
| Inline images lack alt text | Existing article bodies | Medium | Local DB: 20/20 images in 6 articles have blank alt; earlier production crawl found 35/35 in 13 articles | Editorial backfill; block future publish when any body image is missing alt | **Guardrail fixed**; historical content pending |
| Future publication date can be published | CMS article form | Medium | No validation in baseline | Block published status when date is more than five minutes ahead | **Fixed and tested** |
| Published article could omit essential SEO inputs | CMS article form | High | Baseline fields permitted incomplete publication | Require description, cover, cover alt, meaningful body and inline alts | **Fixed and tested**; drafts remain editable |
| Sitemap could include drafts/unpublished records | Sitemap/feed concern | High | Risk in any CMS integration | Query explicitly filters `status = published`; feed/sitemap share published queries | **Fixed/source verified**; current local DB has no draft fixture and was not mutated |
| Missing or wrong heading hierarchy | Home/articles | Medium | Featured story was volatile H1; rich-text could start at H3 | Stable brand H1; one article H1; safe H2/H3 normalization | **Fixed** |
| No visible breadcrumbs | Article template | Medium | Baseline only had a back link | Visible breadcrumb trail matching BreadcrumbList | **Fixed** |
| Existing apostrophe slug artifacts | Several articles | Low | URLs contain `men-s`, `doesn-t` | Do not change existing URLs; normalize new slugs; add redirects for future changes | **New slugs fixed**; generalized redirect history remains pending |
| No hreflang | Entire site | Low | Only one real English edition exists | Do not emit hreflang without equivalent translations | **Correctly not implemented** |
| Shared image payload near 8 MiB | All public pages | High | Original baseline: 7.9–8.2 MiB, mostly PNG assets | Next Image, WebP texture, correct responsive sizes and lazy loading | **Fixed**; final tested pages 681–995 KiB |
| Sponsor responsive sizes too large | Shared sponsor strip | Medium | Lighthouse loaded 640px assets for ~110–145px mobile slots | Accurate 144px mobile/384px desktop `sizes` | **Fixed**; saved ~82 KiB on tested mobile pages |
| Missing LCP priority and misplaced preload | Home/article/listing hero | Medium | Baseline hero lacked high priority; below-fold card was prioritized | Prioritize actual hero only; lazy-load below fold | **Fixed** |
| Listing queries fetch full article bodies | Home/list/category | Medium | Baseline queries transferred unused TipTap JSON | Projection queries; bounded home result set | **Fixed**; sitemap alone intentionally reads bodies for images |
| Static image cache lifetime missing | `/images/*` | Low | Baseline `max-age=0` | Explicit safe cache/stale policy | **Fixed** |
| Low text contrast | Shared public labels/dates | Medium | Lighthouse 96 accessibility; ratios as low as 2.96:1 | Raise small secondary text to `text-black/60` | **Fixed**; final accessibility 100 on four representative runs |
| Local Vercel Analytics 404 | Non-Vercel production build | Low | Lighthouse console error for `/_vercel/insights/script.js` | Render analytics component only when `VERCEL` exists | **Fixed**; Vercel deployment behavior preserved |
| Unused initial JavaScript | Public routes | Low | Lighthouse estimates ~300 KiB unused, mainly framework/motion chunks | Profile real users; consider route-level/lazy motion split without changing behavior | **Pending**; TBT remains 0–40 ms, so no risky animation rewrite made |
| Dynamic listing bfcache limitation | Some filter pages | Low | Dynamic/no-store responses can prevent back-forward cache | Reassess if field navigation data shows a problem | **Pending** |
| No pagination | `/articles`, archive and growing categories | Low now | Current local sitemap has 22 articles; all render on one listing | Add crawlable page URLs and self-canonicals before inventory becomes large | **Pending P2** |
| Short/underdeveloped articles | Individual articles | Medium | Local examples: Marc Jacobs 74 words, LightWay 87, Yelp 98, Kateryna 176, product-brand piece 241, Fall 298 | Expand with original reporting or intentionally classify/curate as briefs; do not pad | **Editorial action** |
| Sparse contextual links/citations | Article bodies | Medium | Earlier full production content audit found no article-to-article body links and few external sources | Add contextually relevant internal links and primary sources, especially health/legal topics | **Editorial action** |
| Inconsistent free-text tags | Article CMS | Low | Brands, people, topics and categories mixed | Controlled taxonomy before making tag pages indexable | **Pending P2** |
| Missing publication trust pages/policies | About, Contacts, legal/editorial policy | High | Current pages are placeholders/noindex | Publish accurate owner-approved identity, contact, privacy, corrections and sponsorship policies | **External/editorial action** |
| Missing configured social profiles/official square mark | Organization/site identity | Medium | `sameAs` intentionally empty; generated “B” icon is a placeholder | Supply verified profiles and official square logo | **External action** |
| No dedicated News sitemap | Google News | Low | No current article in the last 2 days; periodical cadence, not daily news | Do not publish an empty/all-history News sitemap; add only if a real recent-news workflow exists | **Correctly not implemented** |
| No Search Console/field data | Whole property | High for measurement | No GSC/GA4 access; PSI 429; CrUX unavailable | Verify property, submit sitemap and monitor index/CWV/query data | **External action** |
| Unreferenced 96 MiB video asset | `public/Plate-.mp4` | Low | Repository scan; no code reference | Confirm ownership/need, then remove or move outside deploy artifact | **Not deleted** because asset intent is unknown |

## 4. Implemented code changes

### SEO and indexing foundation

- `shared/seo/` is the source of truth for canonical origin, brand/ISSN, titles, descriptions, robots directives, Open Graph, Twitter cards, JSON-LD, sitemap entries, RSS and fixed-page indexability.
- `app/robots.ts`, `app/sitemap.ts` and `app/feed.xml/route.ts` create live discovery endpoints. Sitemap and feed queries include only published articles and are revalidated after editorial changes.
- Public loading boundaries were removed so HTML content and 404 status are available before client JavaScript.
- The admin/API layers now combine robots metadata with HTTP `X-Robots-Tag` headers; placeholder and parameter views use intentional noindex behavior.

### Article and CMS automation

- Dynamic article metadata uses the real record title, description/body fallback, author, section, tags, canonical URL, cover, publish date and meaningful modification date.
- Article JSON-LD uses the same values shown to readers, preventing conflicting dates/bylines.
- Existing `title` and `description` fields remain the editorial SEO controls; no duplicate SEO fields were added. Long titles automatically avoid an overlong brand suffix, and descriptions are safely clamped without overwriting editorial copy.
- Cover generation now exposes five placements: homepage feature, story card, portrait rail, article hero and social/Discover. Legacy records keep working and receive the new rendition on their next save.
- Publishing now rejects incomplete description/cover/cover-alt/body, missing inline alt text and future dates; drafts may remain incomplete.
- TipTap inline images are included in the XML sitemap. Existing empty alts were not fabricated.

### Performance, accessibility and motion

- Shared PNG payload was replaced/optimized, responsive `sizes` corrected, LCP priorities corrected and below-fold media left lazy.
- Public secondary text contrast now passes the representative Lighthouse audits without layout changes.
- Vercel Analytics is emitted only on Vercel, eliminating a local/self-hosted 404 while retaining production analytics.
- GSAP was audited against its React, ScrollTrigger and performance guidance. It already uses scoped cleanup, batching, transforms and reduced-motion handling; preserving it was safer than a speculative refactor.

### Exact changed-file inventory relative to `main`

Status prefixes: `A` added, `M` modified, `D` deleted.

```text
M .env.example
M README.md
A SEO_AUDIT.md
M app/(admin-auth)/admin/login/page.tsx
M app/(public)/about/page.tsx
M app/(public)/archive/page.tsx
M app/(public)/articles/[slug]/page.tsx
D app/(public)/articles/loading.tsx
M app/(public)/articles/page.tsx
M app/(public)/careers/page.tsx
M app/(public)/category/[slug]/page.tsx
M app/(public)/collaboration/page.tsx
M app/(public)/contacts/page.tsx
M app/(public)/current-issue/page.tsx
M app/(public)/lookbook/page.tsx
M app/(public)/page.tsx
M app/(public)/photovogue/page.tsx
M app/(public)/privacy-policy/page.tsx
M app/(public)/shopping/page.tsx
M app/(public)/subscribe/page.tsx
M app/(public)/user-agreement/page.tsx
M app/(public)/video/page.tsx
M app/(public)/where-to-find/page.tsx
M app/account/page.tsx
M app/admin/layout.tsx
A app/apple-icon.png
M app/error.tsx
A app/favicon.ico
A app/feed.xml/route.ts
M app/globals.css
A app/icon.png
M app/layout.tsx
D app/loading.tsx
M app/not-found.tsx
A app/robots.ts
A app/sitemap.ts
M features/account/components/AccountPage.tsx
M features/articles/components/ArticleBody.tsx
M features/articles/components/ArticleCard.tsx
M features/articles/components/ArticleCoverImage.tsx
M features/articles/components/ArticleDetailPage.tsx
M features/articles/components/ArticleEditorForm.tsx
M features/articles/components/ArticleExplorer.tsx
M features/articles/components/ArticleGrid.tsx
M features/articles/components/ArticleHero.tsx
M features/articles/components/ArticleHeroMedia.tsx
M features/articles/components/ArticleMetadata.tsx
M features/articles/components/ArticlesPage.tsx
M features/articles/index.ts
A features/articles/lib/article-dates.ts
A features/articles/lib/article-dates.test.ts
A features/articles/lib/article-headings.ts
A features/articles/lib/article-headings.test.ts
M features/articles/lib/article-text.ts
A features/articles/lib/article-text.test.ts
M features/articles/lib/cover-placements.ts
M features/articles/lib/cover-placements.test.ts
A features/articles/seo/article-seo.ts
A features/articles/seo/article-seo.test.ts
M features/articles/server/article-actions.ts
M features/articles/server/article-filter-params.ts
A features/articles/server/article-filter-params.test.ts
M features/articles/server/article-queries.ts
A features/articles/server/article-revalidation.ts
A features/articles/validation/article-slug.test.ts
M features/articles/validation/article-validation.ts
A features/articles/validation/article-validation.test.ts
M features/categories/components/CategoryPage.tsx
M features/categories/components/CategorySections.tsx
M features/categories/data/categories.ts
M features/categories/index.ts
A features/categories/seo/category-seo.ts
A features/categories/seo/category-seo.test.ts
M features/categories/server/categories.ts
A features/categories/server/category-metadata.ts
M features/categories/types/category.types.ts
M features/distribution/components/DistributionMap.tsx
M features/distribution/components/WhereToFindPage.tsx
M features/home/components/HomeDistribution.tsx
M features/home/components/HomeEditorialLead.tsx
M features/home/components/HomePage.tsx
M features/lookbook/components/LookbookFilters.tsx
M features/lookbook/components/LookbookPage.tsx
A features/lookbook/seo/lookbook-seo.ts
A features/lookbook/seo/lookbook-seo.test.ts
M features/lookbook/server/lookbook-actions.ts
M features/lookbook/server/lookbook-queries.ts
M features/shopping/components/ShoppingPage.tsx
M features/sponsors/components/SponsorsStrip.tsx
M features/subscriptions/components/DigitalUnavailableNotice.tsx
M features/subscriptions/components/SubscribePage.tsx
M features/subscriptions/components/SubscriptionForm.tsx
M features/subscriptions/components/SubscriptionPlans.tsx
M next.config.ts
M package.json
A public/images/journal-bg.webp
A public/images/og-default.png
A scripts/generate-seo-assets.mjs
A scripts/seo-check.mjs
A shared/components/public/Breadcrumbs.tsx
M shared/components/public/PublicInfoPage.tsx
M shared/components/public/SiteFooter.tsx
M shared/components/public/index.ts
A shared/components/seo/JsonLd.tsx
A shared/seo/json-ld.ts
A shared/seo/json-ld.test.ts
A shared/seo/metadata.ts
A shared/seo/metadata.test.ts
A shared/seo/pages.ts
A shared/seo/pages.test.ts
A shared/seo/robots.ts
A shared/seo/rss.ts
A shared/seo/rss.test.ts
A shared/seo/site.ts
A shared/seo/site.test.ts
A shared/seo/sitemap.ts
A shared/seo/sitemap.test.ts
A shared/seo/text.ts
A shared/seo/text.test.ts
```

## 5. Before/after verification

### Technical/indexability acceptance

| Check | Live baseline | Local production build after changes |
|---|---|---|
| Automated HTTP/HTML acceptance | 16/45 top-level checks passed | **652/652 checks passed** across every sitemap URL and special-case route |
| `robots.txt` | 404 | 200, `text/plain`, allows public site, blocks `/admin` and `/api/`, declares HTTPS sitemap |
| Sitemap | 404 | 200 XML; **33 URLs**, no duplicates/parameters/admin; **44 image entries** |
| RSS | Missing | 200 XML; **22 balanced published items** |
| Home raw HTML | Primary content in hidden streamed block | **4,520 visible characters without JavaScript** |
| Article raw HTML | Metadata/schema absent | Canonical, OG article, Twitter card, Article + Breadcrumb graph, visible dates |
| Filtered listings | Indexable/duplicate | `noindex, follow`, no canonical minted, no contradictory CollectionPage JSON-LD |
| Unknown page/article/category | Soft 200 in baseline | Real **404** |
| Duplicate old article slug | 200 duplicate | Permanent **308** to chosen canonical article |
| Admin | Crawl/index exposure | Robots blocked and `X-Robots-Tag: noindex`; login noindex |
| Draft/unpublished behavior | No current draft record exists locally | Public queries, static params, sitemap and feed filter on `published`; draft validation tested without database mutation |

### Metadata examples verified locally

- Home title: `Beauty Professionals Magazine: Industry Interviews & Insight`.
- Each indexable URL has a unique title, description, absolute canonical, Open Graph image and `summary_large_image` Twitter card.
- Home includes Organization and WebSite entities; article pages include Article, Person author, publisher references and BreadcrumbList.
- `max-image-preview:large` is set on indexable content.
- No hreflang is emitted because no translated equivalents exist.

### Lighthouse final runs

Lighthouse 13.0.1, serial runs against `next start`, default mobile throttling unless noted. TBT is a lab responsiveness proxy; **INP is not available from a single lab navigation**. No CrUX field data was available.

| Page | Preset | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Home | Mobile | 92 | **100** | **100** | **100** | 0.9 s | 3.3 s | 0 | 40 ms | 995 KiB |
| Home | Desktop | **100** | **100** | **100** | **100** | 0.3 s | 0.6 s | 0 | 0 ms | 993 KiB |
| BBF article | Mobile | 96 | **100** | **100** | **100** | 0.9 s | 2.7 s | 0 | 30 ms | 681 KiB |
| Beauty section | Mobile | 94 | **100** | **100** | **100** | 0.9 s | 3.0 s | 0 | 40 ms | 870 KiB |

The last targeted performance patch was measured immediately before and after under the same local setup:

| Route | Before → after LCP | Before → after transfer | Accessibility | Best practices |
|---|---:|---:|---:|---:|
| Home mobile | 3.7 → **3.3 s** | 1,078 → **995 KiB** | 96 → **100** | 96 → **100** |
| Home desktop | 0.6 → 0.6 s | 1,048 → **993 KiB** | 96 → **100** | 96 → **100** |
| Article mobile | 2.8 → **2.7 s** | 763 → **681 KiB** | 96 → **100** | 96 → **100** |
| Section mobile | 3.1 → **3.0 s** | 952 → **870 KiB** | 96 → **100** | 96 → **100** |

Earlier full baseline runs on the unoptimized code measured 7.9–8.2 MiB transfers and mobile LCP as high as 39–41 seconds on article listings. Those measurements used a prior Lighthouse version/date, so they are valid historical evidence but not presented as a tightly controlled A/B comparison with the final table.

### Build and tests

| Command/check | Result |
|---|---|
| `npm test` | **199 passed**, 0 failed |
| `npm run lint` | Passed |
| `git diff --check` | Passed |
| `npm run build` | Passed; TypeScript passed; 59 routes generated/registered |
| `npm run seo:check -- http://localhost:3100` | **652/652 passed** |
| Production redirect probes | HTTP→HTTPS 308; www→apex 307; trailing slash normalized 308 |

### Checks that could not be completed

- Google Search Console URL Inspection, Coverage, Links and Performance reports: no property access.
- Real-user LCP/INP/CLS: CrUX returned no data; PageSpeed Insights API was rate-limited (429).
- Google Rich Results Test against the changed pages: it cannot reach localhost. JSON-LD was parsed and unit-tested locally; rerun the official test after deployment.
- Production editorial-data cleanup: no production database mutation was authorized.
- A true publish/unpublish integration test: the local database currently contains 22 published and zero draft records, and the audit did not create or delete editorial records. Draft validation and published-only query logic were tested without data mutation.

## 6. Google Discover, Images and News

### Discover

The code now supplies `max-image-preview:large`, accurate article titles/descriptions, Article metadata and an editor-controlled 1600×900 cover. Google recommends compelling, representative images at least 1200px wide and specifically discourages clickbait/misleading previews. Eligibility is algorithmic and cannot be guaranteed.

Legacy state matters: none of the 22 configured local article records yet stores a `socialShare` rendition. They safely fall back to the existing 1600×1200 feature crop, but an editor should open, review the new Social & Discover framing and save each priority article. No blind bulk crop was performed because subject-safe framing is editorial.

### Google Images

- Covers and TipTap body images now appear in the article sitemap entry.
- Native `<img>`/Next Image rendering, responsive `srcset`/`sizes`, intrinsic body-image dimensions and lazy loading are retained.
- The editor stores cover alt and inline alt separately. New publication is blocked when either is missing.
- Existing missing alts must be written by someone who can identify the image and its editorial purpose; fabricating them would be worse than leaving them blank.
- Captions/credits should be added where rights/attribution require them. The audit did not invent credits.

### Google News

Google News inclusion is not guaranteed and no special Article markup is required. This publication currently fits general `Article` better than marking every feature as `NewsArticle`. A dedicated News sitemap was not implemented because Google restricts it to articles published in the last two days, and the current periodical inventory would make it empty most of the time. The regular sitemap and RSS feed are correct today.

Since March 2025, Publisher Center no longer uses manually submitted RSS/web locations to create publication pages; eligible content is automatically considered. Focus external work on a clear site name/favicon, transparent authorship/dates, stable permanent URLs, crawlable HTML and editorial identity. Reconsider a News sitemap only if the team begins publishing time-sensitive news frequently; then generate only eligible recent URLs and cap it according to Google’s rules.

## 7. Editorial SEO roadmap

No reliable keyword-volume or difficulty dataset was available. The queries below are **hypotheses** to validate in Search Console or a trusted keyword platform, not promises or measured rankings.

| Priority | Cluster | Existing foundation | Candidate professional intent | Recommended work |
|---:|---|---|---|---|
| 1 | Precision nails and restoration | Deep hardware manicure/restoration feature; nail-care commentary | precision hardware manicure; nail restoration techniques; professional e-file manicure | Make the deep feature a pillar; add step-by-step supporting pieces, original close-up images, safety sources and links between them |
| 1 | Professional hair methodology | Men’s haircut anatomy/growth, color correction, hair-health pieces | haircut design head shape; barber hair-growth patterns; blonde-to-dark correction | Build a methodology hub and link technique articles by problem/stage |
| 1 | Beauty business and entrepreneurship | Product-brand, Yelp, competitions and career pieces | start a beauty product line; salon reputation management; beauty competitions career growth | Expand short posts into practical guides with examples, checklists and first-party expert insight |
| 1 | Licensing and immigrant professionals | O-1/EB-1A and foreign-professional themes | foreign-trained cosmetologist license; transfer cosmetology license by state; O-1 beauty professional | Strong differentiator, but rules change: cite state boards/USCIS, date every update and require legal/editorial review |
| 2 | Lash science | Lash design and adhesive coverage | LED vs traditional lash adhesive; lash curing; retention variables | Publish independent, source-backed explainers distinct from manufacturer marketing |
| 2 | Skin barrier and clinical beauty | Barrier/acne/clinical trend articles | skin barrier for estheticians; professional acne consultation; clinical beauty trends | Named qualified reviewer, primary sources and careful non-diagnostic language |
| 2 | Competitions and events | BBF and competition-career coverage | nail competitions; hairstyling championships; how to enter beauty competitions | Evergreen competition hub plus maintained event pages; archive expired events cleanly |
| 2 | Beauty technology/AI | Algorithm and trend features | AI for salons; beauty technology trends; AI personalization beauty | Refresh time-sensitive analysis and make update dates visible |
| 3 | Brand/distribution | Subscribe, Where to Find, Lookbook | salon trade magazine; beauty professional magazine; magazine distribution | Make Current Issue useful; strengthen Lookbook/distribution cross-links and branded navigation |

### Existing article optimization candidates

1. **Hardware manicure/restoration pillar:** add descriptive alts, diagram/photo captions, a concise table of contents, sources and links to related nail pieces.
2. **Men’s haircut methodology:** retain the current URL; improve title spacing/editorial polish, add labeled visuals and link to related hair diagnosis/color articles.
3. **Why Beauty Competitions…:** set the actual publish date, unpublish the duplicate short-slug row and add links to BBF/competition coverage.
4. **LightWay**, **Marc Jacobs Beauty**, **Your Yelp Decoded**, **Kateryna Lushakova**, the product-brand story and **Fall 2026**: editorially decide whether each is a brief, gallery/interview or a piece that should be expanded. Do not pad to a word count.
5. Health-adjacent skin/acne pieces: add primary sources and a named reviewer where appropriate.

### Internal linking priorities

- Add 2–4 genuinely relevant contextual links per substantial article; favor descriptive anchors over repeated “read more.”
- Create hand-written hub pages only after each has enough strong child content and original introductory copy.
- Keep filter/tag URLs noindex until taxonomy is normalized and each topic has a durable landing page.
- Surface older evergreen pieces from newer reporting and related-story modules; do not add sitewide keyword links.
- Add author pages, then link every visible byline and `Person.url` to the matching real profile.

### Competitor/market observations

Current professional-publication references include [Salonpreneur](https://salonpreneurmagazine.co.uk/), [NHBF Salonfocus](https://www.nhbf.co.uk/media/salonfocus-magazine/), [Cool Beauty Times](https://coolbeautyconsulting.com/cool-beauty-times/), [Salon Business](https://salonbusiness.co.uk/about-us/), [The Salon Magazine](https://thesalonmagazine.co.uk/), [PBL Magazine](https://www.pblmagazine.co.uk/) and [Social Beauty Pro](https://www.socialbeautypro.com/). This is an editorial landscape sample, not a ranking-share analysis. The opportunity is to be more useful to working professionals through original technique, transparent expertise, sources and US-specific licensing/business context—not to imitate consumer beauty listicles.

## 8. Authority, trust and publication identity

Priority trust work requires owner/editor input, so it was not fabricated:

- **About:** legal publisher/name, mission, audience, launch history, ISSN placement, editorial leadership and contact paths.
- **Editorial policy:** sourcing standards, fact-checking, corrections/update process, product/editorial independence and AI-use policy if applicable.
- **Sponsored content policy:** clear labels and separation from editorial judgment.
- **Contacts:** editorial, advertising/partnership, distribution and privacy contacts using real addresses.
- **Privacy/User Agreement:** counsel-reviewed disclosure of subscription data, Vercel Analytics, database/email/file processors, retention and access/deletion requests.
- **Authors:** consented bios, relevant credentials, photos and verified profile links. Do not invent credentials.
- **Corrections:** a visible correction note and meaningful `dateModified` when an article changes materially.

The code already carries the registered ISSN in the Periodical entity and strips it from individual author names. Add real organization `sameAs` URLs only when the owner supplies them.

## 9. External action checklist

1. Deploy to a preview first. Run `npm run seo:check -- <preview-url>`, inspect home/article/category/Lookbook on mobile, then deploy production. This audit did not deploy.
2. After production deploy, rerun `npm run seo:check -- https://beautyprofessionalsmagazine.com` and verify the 308 duplicate redirect.
3. Verify a Google Search Console Domain property by DNS (or use the supported verification env field), then submit `https://beautyprofessionalsmagazine.com/sitemap.xml`.
4. Use URL Inspection for home, one article, one section and Lookbook. Request indexing only after correct HTML, canonical and status are live.
5. Run Google Rich Results Test on home and at least two real articles after deployment. Validate that Article image/date/author/publisher fields match the visible page.
6. Review Coverage/Page Indexing: noindex placeholders and filters are intentional; soft 404s and duplicate-without-canonical should disappear after recrawl.
7. Confirm Vercel Analytics is receiving production traffic. Add GA4 only if the organization wants its reporting and can update privacy/consent handling; GA is not required for rankings.
8. Do not attempt obsolete manual Publisher Center feed setup. Confirm Google News sees the desired site name/favicon and revisit a News sitemap only when a recent-news cadence justifies it.
9. In the CMS, backfill the 20 missing inline alts in the local editorial set (and re-audit production), review/save the new Social & Discover crop for priority stories, clean author strings and correct the missing production publish date.
10. Unpublish the duplicate short-slug article after confirming the full-slug record is canonical.
11. Publish owner-approved About, Contacts, Privacy, User Agreement, editorial/corrections and sponsored-content policies; only then flip their `indexable` flags.
12. Supply an official square logo and verified publication social URLs.
13. After at least 28 days of post-deploy data, review Search Console queries/pages/devices/countries and Core Web Vitals. Use that evidence to reprioritize the editorial roadmap.
14. Add the test, lint, build and production `seo:check` commands to release CI.

## 10. Remaining issues

- The fixed code is not live until deployment.
- Existing inline image alt text, social crop framing, author names, publish-date corrections and duplicate-row status require editorial/database actions.
- About, Contact, legal, editorial, corrections and sponsorship policies need real owner-approved content.
- Author profiles and verified credentials do not exist.
- Search Console, backlink and keyword-volume data were unavailable; traffic/ranking conclusions remain hypotheses.
- Field INP/LCP/CLS were unavailable. The Lighthouse table is lab evidence only.
- Mobile LCP of 2.7–3.3 s on tested pages is improved but still above Google’s 2.5 s “good” threshold on two routes. The remaining lab opportunity is mostly image delivery/unused JS; prioritize with field data after deployment.
- Legacy covers have not yet generated the new 16:9 social variant; fallbacks are safe, but editor review is preferable.
- Pagination, controlled topic pages, slug-history redirects and a cautious motion/code-splitting pass remain future scale work.
- `public/Plate-.mp4` remains because deleting a 96 MiB creative asset without owner confirmation would be destructive.
- No News sitemap was added because the current cadence does not satisfy its purpose.

## 11. Maintenance rules

- Add fixed public pages to `shared/seo/pages.ts`; set `indexable: true` only when content is complete.
- Do not add a public route-level `loading.tsx` without verifying raw HTML and 404 status.
- Preserve one canonical per indexable view; noindex transient search/filter combinations.
- Do not change an existing article slug without a permanent redirect and updated internal links/canonical/sitemap.
- Require accurate image alt text and verify the Social & Discover crop before publish.
- Run `npm test`, `npm run lint`, `npm run build` and `npm run seo:check -- <deployment>` for every release.
- Audit sitemap counts, 404s, schema, social previews, RSS and field Core Web Vitals after major CMS or routing changes.

## Sources

- Google Search Central: [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [Google Images best practices](https://developers.google.com/search/docs/appearance/google-images), [Google Discover](https://developers.google.com/search/docs/appearance/google-discover), [Publication dates](https://developers.google.com/search/docs/appearance/publication-dates), [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals), [News sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap), [Organization markup](https://developers.google.com/search/docs/appearance/structured-data/organization), [Site names](https://developers.google.com/search/docs/appearance/site-names), [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [developer SEO basics](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- Google News: [Publisher Center transition](https://support.google.com/news/publisher-center/answer/15898024), [technical article requirements](https://support.google.com/news/publisher-center/answer/9606708)
- Next.js: [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld)
- [Schema.org vocabulary](https://schema.org/), [ISSN Portal record 3144-0541](https://portal.issn.org/resource/ISSN/3144-0541), [Lighthouse](https://github.com/GoogleChrome/lighthouse)

---

> Free & open source — [claude-seo](https://github.com/AgriciDaniel/claude-seo)
