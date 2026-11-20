/** A custom header prevents cross-origin form posts; no CORS is enabled. */
export function isArticleViewRequest(request: Request) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  // Next's internal request URL can use localhost even when the browser used
  // 127.0.0.1 or a deployment hostname. Compare the browser-facing Host instead.
  const host = request.headers.get("host") ?? new URL(request.url).host;
  let sameOrigin = !origin;
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      sameOrigin =
        parsedOrigin.origin === origin &&
        ["http:", "https:"].includes(parsedOrigin.protocol) &&
        parsedOrigin.host === host;
    } catch {
      return false;
    }
  }
  return (
    request.headers.get("x-article-view") === "1" &&
    sameOrigin &&
    (!site || site === "same-origin") &&
    !request.headers.get("purpose")?.includes("prefetch") &&
    !request.headers.get("sec-purpose")?.includes("prefetch")
  );
}
