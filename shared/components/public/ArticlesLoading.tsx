export function ArticlesLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading articles"
      className="bg-white py-[var(--section-space)] text-black"
    >
      <div className="site-container">
        <div className="skeleton-pulse h-28 max-w-3xl" />
        <div className="mt-14 h-16 border-y border-black/15 py-3">
          <div className="skeleton-pulse h-full w-48" />
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="space-y-4" key={item}>
              <div className="skeleton-pulse aspect-[4/3]" />
              <div className="skeleton-pulse h-9 w-4/5" />
              <div className="skeleton-pulse h-5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
