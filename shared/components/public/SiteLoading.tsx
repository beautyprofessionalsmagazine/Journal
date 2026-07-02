export function SiteLoading() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <div className="h-24 w-full border-y border-black/15" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 border border-black/15" />
          <div className="h-72 border border-black/15" />
          <div className="h-72 border border-black/15" />
        </div>
      </div>
    </main>
  );
}
