/** One POST per visible page activation, including browser back/forward.
 * Delaying until the next task lets React Strict Mode cancel its rehearsal.
 * No automatic retries: an ambiguous response must not double-count a view.
 */
export function trackArticleView(id: string, onCount: (count: number) => void) {
  let sent = false;
  let disposed = false;

  function record() {
    if (sent || disposed || document.visibilityState !== "visible") return;
    sent = true;
    void fetch(`/api/articles/${encodeURIComponent(id)}/views`, {
      method: "POST",
      headers: { "X-Article-View": "1" },
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
    })
      .then(async (response) => {
        if (!response.ok || response.status === 204) return;
        const result: unknown = await response.json();
        if (
          !disposed &&
          result &&
          typeof result === "object" &&
          "views" in result &&
          typeof result.views === "number" &&
          Number.isSafeInteger(result.views) &&
          result.views >= 0
        ) {
          onCount(result.views);
        }
      })
      .catch(() => {
        // Analytics failure must never interrupt reading. Keep the server count.
      });
  }

  function onPageShow(event: PageTransitionEvent) {
    if (event.persisted) {
      sent = false;
      record();
    }
  }

  const timer = window.setTimeout(record, 0);
  document.addEventListener("visibilitychange", record);
  window.addEventListener("pageshow", onPageShow);
  return () => {
    disposed = true;
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", record);
    window.removeEventListener("pageshow", onPageShow);
  };
}
