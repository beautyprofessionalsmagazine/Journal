export function ArticlesLoading() {
  return (
    <main className="bg-white px-5 py-14 text-black sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <div className="h-36 max-w-3xl border-y border-black/15" />
        <div className="h-20 border-y border-black/15" />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-96 border border-black/15" />
          <div className="h-96 border border-black/15" />
          <div className="h-96 border border-black/15" />
        </div>
      </div>
    </main>
  );
}
