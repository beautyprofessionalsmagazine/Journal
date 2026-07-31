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
      <section className="site-container min-h-[60vh] py-[var(--section-space)]">
        <header className="reveal grid gap-6 border-b border-black pb-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="editorial-kicker mb-3 text-black/45">
              Beauty Professionals Magazine
            </p>
            <h1 className="page-title">
            {title}
            </h1>
          </div>
          <p className="max-w-xl text-[clamp(1rem,1.8vw,1.25rem)] leading-8 text-black/64 lg:justify-self-end">
            {description}
          </p>
        </header>
        <div className="reveal reveal-delay-1 mt-[clamp(3rem,6vw,6rem)]">
          {children ?? (
            <div className="grid gap-5 border-y border-black/15 py-10 sm:grid-cols-[auto_1fr] sm:items-start">
              <p className="editorial-kicker text-black/42">Editorial note</p>
              <p className="max-w-2xl text-sm leading-7 text-black/62">
                This page is being prepared by the editorial team. New
                information will be published here when it is ready.
              </p>
            </div>
          )}
          <Link className="button-secondary mt-10" href="/articles">
            Browse the journal
          </Link>
        </div>
      </section>
    </main>
  );
}
