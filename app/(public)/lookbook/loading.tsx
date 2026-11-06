/** Mirrors the Lookbook opening spread so the page does not jump on arrival. */
export default function LookbookLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Lookbook"
      className="bg-[var(--paper)]"
    >
      <section className="border-b border-black/12 bg-[linear-gradient(180deg,#f8f6f1_0%,#efebe2_100%)]">
        <div className="site-container grid gap-x-[clamp(2.5rem,7vw,7rem)] gap-y-8 pb-[clamp(3rem,7vw,6.5rem)] pt-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:grid-rows-[auto_1fr]">
          <div>
            <div className="border-b border-black/30 pb-3">
              <div className="skeleton-pulse h-3 w-40" />
            </div>
            <div className="skeleton-pulse mt-7 h-[clamp(3.25rem,15vw,8.5rem)] max-w-2xl" />
          </div>
          <div className="mx-auto w-full max-w-[22rem] pb-5 pr-5 sm:max-w-[26rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:ml-auto lg:max-w-[30rem] lg:self-center">
            <div className="border border-black/10 bg-white p-2 sm:p-2.5">
              <div className="skeleton-pulse aspect-[3/4]" />
            </div>
          </div>
          <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
            <div className="skeleton-pulse h-3 w-24" />
            <div className="skeleton-pulse mt-4 h-14 max-w-md" />
            <div className="skeleton-pulse mt-6 h-4 max-w-xl" />
            <div className="skeleton-pulse mt-3 h-4 max-w-sm" />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="skeleton-pulse h-12 sm:w-48" />
              <div className="skeleton-pulse h-12 sm:w-44" />
            </div>
          </div>
        </div>
      </section>
      <span className="sr-only">Loading the Lookbook archive</span>
    </main>
  );
}
