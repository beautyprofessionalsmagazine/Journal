import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[65vh] items-center bg-white py-[var(--section-space)]">
      <div className="site-container">
        <p className="editorial-kicker text-black/45">Error 404</p>
        <h1 className="page-title mt-4">This page left the issue.</h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-black/62">
          The story may have moved, or the address may be incomplete. Return
          to the Journal to continue reading.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="button-primary" href="/">
            Return home
          </Link>
          <Link className="button-secondary" href="/articles">
            Browse articles
          </Link>
        </div>
      </div>
    </main>
  );
}
