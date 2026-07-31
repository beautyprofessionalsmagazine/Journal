"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[65vh] items-center bg-white py-[var(--section-space)]">
      <div className="site-container">
        <p className="editorial-kicker text-black/45">Unable to load</p>
        <h1 className="page-title mt-4">The page missed its deadline.</h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-black/62">
          A temporary error interrupted this page. Try once more; your place
          in the Journal will remain here.
        </p>
        <button className="button-primary mt-8" onClick={reset} type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
