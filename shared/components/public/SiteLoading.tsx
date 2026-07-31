export function SiteLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className="min-h-screen bg-white py-[var(--section-space)] text-black"
    >
      <div className="site-container">
        <div className="skeleton-pulse h-28 max-w-3xl" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="space-y-4" key={item}>
              <div className="skeleton-pulse aspect-[4/3]" />
              <div className="skeleton-pulse h-8 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
