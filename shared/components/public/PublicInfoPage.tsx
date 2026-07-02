import Link from "next/link";
import type { ReactNode } from "react";

type PublicInfoPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PublicInfoPage({
  title,
  description,
  children,
}: PublicInfoPageProps) {
  return (
    <main className="bg-white">
      <section className="mx-auto flex min-h-[56vh] max-w-[1180px] flex-col gap-10 px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-3xl border-b border-black pb-8">
          <h1 className="[font-family:var(--font-editorial-title)] text-6xl font-bold leading-none text-black sm:text-7xl">
            {title}
          </h1>
          <p className="mt-5 [font-family:var(--font-editorial-sans)] text-lg leading-8 text-black/68">
            {description}
          </p>
        </div>
        {children ?? (
          <div className="border-y border-black/15 py-12">
            <p className="max-w-2xl [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
              No public updates have been published here yet.
            </p>
          </div>
        )}
        <Link
          className="w-fit border border-black px-5 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase transition hover:bg-black hover:text-white"
          href="/articles"
        >
          Browse articles
        </Link>
      </section>
    </main>
  );
}
