import { ButtonLink } from "@/shared/components/ui";

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
          <ButtonLink href="/">
            Return home
          </ButtonLink>
          <ButtonLink href="/articles" variant="secondary">
            Browse articles
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
