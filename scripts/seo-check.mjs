// HTTP-level SEO regression check. Run it against any deployment:
//
//   npm run seo:check                              # http://localhost:3000
//   npm run seo:check -- https://beautyprofessionalsmagazine.com
//
// It fetches robots.txt, the sitemap, the feed, and every URL the sitemap
// lists, then asserts the things that decide whether a page can be crawled,
// indexed and understood: status codes, canonical tags, robots directives,
// titles, headings, structured data, and whether the real content is in the
// initial HTML. It needs only Node 18+ (global fetch) and exits non-zero on
// any failure, so it can gate a deploy.
//
// The unit tests (`npm test`) cover the logic; this covers the rendered result.

const base = (process.argv[2] ?? process.env.SEO_CHECK_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const TIMEOUT_MS = 60_000;

const failures = [];
let total = 0;

function check(ok, message) {
  total += 1;
  if (ok) {
    console.log(`  \u2714 ${message}`);
  } else {
    failures.push(message);
    console.log(`  \u2716 ${message}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function get(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "journal-seo-check/1.0" },
    ...init,
  });
  const body = init.method === "HEAD" ? "" : await response.text();

  return { response, body, status: response.status };
}

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));

  return match ? (match[2] ?? match[3]) : undefined;
};
const decode = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const stripTags = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<template[\s\S]*?<\/template>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

/** Pulls the SEO-relevant facts out of one HTML document. */
function analyze(html) {
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : "";
  // Streamed metadata can land in <body>; search the whole document for tags.
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (name) => {
    const tag = metas.find((m) => (attr(m, "name") ?? attr(m, "property")) === name);

    return tag ? decode(attr(tag, "content")) : undefined;
  };
  const canonicalTag = links.find((l) => attr(l, "rel") === "canonical");
  const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    },
  );
  // Real content must be in the initial HTML, not parked in a hidden Suspense
  // segment that only JavaScript reveals.
  const hiddenSegments = (html.match(/<div hidden id="S:\d+"/g) ?? []).length;
  const bodyHtml = (html.match(/<body[\s\S]*<\/body>/i) ?? [""])[0].replace(/<div hidden[^>]*>[\s\S]*?<\/div>/g, " ");

  return {
    lang: (html.match(/<html[^>]*\slang="([^"]*)"/i) ?? [])[1],
    title: decode((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1]),
    description: meta("description"),
    canonical: canonicalTag ? attr(canonicalTag, "href") : undefined,
    robots: meta("robots"),
    ogTitle: meta("og:title"),
    ogImage: meta("og:image"),
    ogType: meta("og:type"),
    twitterCard: meta("twitter:card"),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    mainCount: (html.match(/<main\b/gi) ?? []).length,
    jsonLd,
    hiddenSegments,
    loadingSkeleton: /aria-label="Loading page"/.test(html),
    visibleText: stripTags(bodyHtml).length,
    iconLinks: links.filter((l) => /\bicon\b/.test(attr(l, "rel") ?? "")).length,
    feedLink: links.some((l) => attr(l, "rel") === "alternate" && attr(l, "type") === "application/rss+xml"),
  };
}

const pathOf = (url) => {
  const { pathname, search } = new URL(url);

  return pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}${search}`;
};

async function main() {
  console.log(`SEO check against ${base}`);

  // ---------------------------------------------------------------- robots.txt
  section("robots.txt");
  const robots = await get("/robots.txt");
  check(robots.status === 200, "robots.txt returns 200");
  check(/text\/plain/.test(robots.response.headers.get("content-type") ?? ""), "robots.txt is served as text/plain");
  check(/^user-agent:\s*\*/im.test(robots.body), "robots.txt has a wildcard user-agent group");
  check(/^disallow:\s*\/admin/im.test(robots.body), "robots.txt blocks /admin");
  check(/^disallow:\s*\/api\//im.test(robots.body), "robots.txt blocks /api/");
  check(!/^disallow:\s*\/\s*$/im.test(robots.body), "robots.txt does not block the whole site");
  const sitemapDirective = robots.body.match(/^sitemap:\s*(\S+)/im)?.[1];
  check(Boolean(sitemapDirective) && sitemapDirective.startsWith("https://"), `robots.txt declares an absolute https sitemap (${sitemapDirective ?? "none"})`);

  // ---------------------------------------------------------------- sitemap
  section("sitemap.xml");
  const sitemap = await get("/sitemap.xml");
  check(sitemap.status === 200, "sitemap.xml returns 200");
  check(/xml/.test(sitemap.response.headers.get("content-type") ?? ""), "sitemap.xml is served as XML");
  const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  check(locs.length > 0, `sitemap lists ${locs.length} URLs`);
  check(new Set(locs).size === locs.length, "sitemap has no duplicate URLs");
  check(locs.every((loc) => /^https:\/\//.test(loc)), "every sitemap URL is absolute https");
  const origins = new Set(locs.map((loc) => new URL(loc).origin));
  check(origins.size === 1, `every sitemap URL is on one origin (${[...origins].join(", ")})`);
  const canonicalOrigin = [...origins][0];
  check(locs.some((loc) => /\/articles\/[^/]+$/.test(loc)), "sitemap includes article URLs");
  check(!locs.some((loc) => /\/admin|\/api\//.test(loc)), "sitemap contains no admin or API URLs");
  check(!locs.some((loc) => /[?&](q|tag|sort|category)=/.test(loc)), "sitemap contains no filter or search URLs");

  // ---------------------------------------------------------------- listed pages
  section("Every sitemap URL");
  const titles = new Map();
  let sampledJsonLd = null;
  for (const loc of locs) {
    const path = pathOf(loc);
    const { status, body } = await get(path);
    const page = analyze(body);
    const label = path;

    check(status === 200, `${label}: 200`);
    if (status !== 200) continue;
    check(page.lang === "en", `${label}: <html lang="en">`);
    check(Boolean(page.title) && page.title.length > 0, `${label}: has a <title> (${page.title})`);
    check(page.title.length <= 120, `${label}: title is not excessively long (${page.title.length})`);
    check(Boolean(page.description), `${label}: has a meta description`);
    check(page.canonical !== undefined && pathOf(page.canonical) === path && new URL(page.canonical).origin === canonicalOrigin, `${label}: canonical is itself (${page.canonical ?? "missing"})`);
    check(!/noindex/i.test(page.robots ?? ""), `${label}: is not noindex`);
    check(page.h1Count === 1, `${label}: exactly one <h1> (found ${page.h1Count})`);
    check(page.mainCount === 1, `${label}: exactly one <main> (found ${page.mainCount})`);
    check(Boolean(page.ogTitle) && /^https:\/\//.test(page.ogImage ?? ""), `${label}: Open Graph title and absolute image`);
    check(page.twitterCard === "summary_large_image", `${label}: Twitter large-image card`);
    check(page.jsonLd.length > 0 && page.jsonLd.every(Boolean), `${label}: structured data parses`);
    check(page.hiddenSegments === 0 && !page.loadingSkeleton, `${label}: content is in the initial HTML (no hidden Suspense segments or skeleton)`);
    check(page.visibleText > 200, `${label}: ${page.visibleText} characters of visible text without JavaScript`);
    check(page.iconLinks > 0, `${label}: declares a favicon`);
    check(page.feedLink, `${label}: advertises the RSS feed`);

    const duplicate = titles.get(page.title);
    check(duplicate === undefined, `${label}: title is unique${duplicate ? ` (also on ${duplicate})` : ""}`);
    titles.set(page.title, label);

    if (/^\/articles\/[^/?]+$/.test(path)) {
      const graph = page.jsonLd.flatMap((block) => block?.["@graph"] ?? [block]);
      const types = graph.map((node) => node?.["@type"]);
      check(types.includes("Article") && types.includes("BreadcrumbList"), `${label}: Article and BreadcrumbList structured data`);
      check(page.ogType === "article", `${label}: og:type is article`);
      sampledJsonLd ??= graph;
    }
    if (path === "/") {
      const types = page.jsonLd.flatMap((block) => block?.["@graph"] ?? [block]).map((node) => node?.["@type"]);
      check(types.includes("WebSite") && types.includes("Organization"), "/: WebSite and Organization structured data");
    }
  }
  if (sampledJsonLd) {
    const article = sampledJsonLd.find((node) => node?.["@type"] === "Article");
    check(!/ISSN/i.test(JSON.stringify(article?.author ?? {})), "article author markup carries the name only (no ISSN)");
  }

  // ---------------------------------------------------------------- noindex
  section("Pages that must stay out of the index");
  for (const path of [
    "/admin/login",
    "/articles?q=hair",
    "/articles?sort=popular",
    "/category/beauty?tag=Hair",
    "/about",
    "/contacts",
    "/privacy-policy",
    "/account",
  ]) {
    const { status, body, response } = await get(path);
    const page = analyze(body);
    const header = response.headers.get("x-robots-tag") ?? "";

    check(status === 200, `${path}: reachable (${status})`);
    check(/noindex/i.test(page.robots ?? "") || /noindex/i.test(header), `${path}: noindex (${page.robots ?? header ?? "none"})`);
  }

  // ---------------------------------------------------------------- duplicates
  section("Duplicates and parameters");
  const archive = analyze((await get("/archive")).body);
  check(archive.canonical !== undefined && pathOf(archive.canonical) === "/articles", `/archive canonicalizes to /articles (${archive.canonical})`);
  const where = analyze((await get("/where-to-find?location=zz")).body);
  check(where.canonical !== undefined && pathOf(where.canonical) === "/where-to-find", "/where-to-find?location=... canonicalizes to /where-to-find");
  const lookbookQuery = analyze((await get("/lookbook?year=1999&month=99")).body);
  check(lookbookQuery.canonical === undefined || pathOf(lookbookQuery.canonical) === "/lookbook" || /noindex/i.test(lookbookQuery.robots ?? ""), "/lookbook with junk parameters does not mint a canonical URL");

  const redirect = await get("/articles/why-beauty-compe", { redirect: "manual" });
  check([301, 308].includes(redirect.status) && /why-beauty-competitions-have-become/.test(redirect.response.headers.get("location") ?? ""), `duplicate article slug is permanently redirected (${redirect.status})`);

  // ---------------------------------------------------------------- status codes
  section("Status codes");
  for (const path of ["/zz-not-a-page", "/articles/zz-not-an-article", "/category/zz-not-a-section"]) {
    const { status } = await get(path);

    check(status === 404, `${path}: returns a real 404 (${status})`);
  }

  // ---------------------------------------------------------------- feed + icons
  section("Feed and brand assets");
  const feed = await get("/feed.xml");
  check(feed.status === 200 && /xml/.test(feed.response.headers.get("content-type") ?? ""), "feed.xml returns 200 as XML");
  const items = (feed.body.match(/<item>/g) ?? []).length;
  check(items > 0 && items === (feed.body.match(/<\/item>/g) ?? []).length, `feed.xml has ${items} balanced items`);
  check(!/&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(feed.body), "feed.xml has no unescaped ampersands");

  const favicon = await get("/favicon.ico", { method: "HEAD" });
  check(favicon.status === 200, `/favicon.ico returns 200 (${favicon.status})`);
  const share = await get("/images/og-default.png", { method: "HEAD" });
  check(share.status === 200 && /image\/png/.test(share.response.headers.get("content-type") ?? ""), "default share image is served");

  const adminHeaders = await get("/admin", { method: "HEAD" });
  check(/noindex/i.test(adminHeaders.response.headers.get("x-robots-tag") ?? ""), "/admin sends an X-Robots-Tag: noindex header");

  // ---------------------------------------------------------------- summary
  console.log(`\n${total - failures.length}/${total} checks passed`);
  if (failures.length > 0) {
    console.log(`\n${failures.length} failure(s):`);
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
