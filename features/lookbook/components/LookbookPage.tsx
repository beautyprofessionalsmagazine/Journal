import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";

import { getActiveLookbook } from "@/features/lookbook/server/lookbook-queries";
import { ButtonLink } from "@/shared/components/ui";

export async function LookbookPage() {
  const lookbook = await getActiveLookbook();

  return (
    <main className="bg-white">
      <section className="site-container py-[clamp(2rem,5vw,4rem)]">
        <div className="flex flex-col gap-5 border-b border-black pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="editorial-kicker text-[var(--champagne-dark)]">The current edition</p>
            <h1 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.05em]">
              Lookbook
            </h1>
            {lookbook ? <p className="mt-3 text-sm text-black/55">{lookbook.fileName}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/" variant="secondary">
              <ArrowLeft aria-hidden="true" size={15} /> Back to Journal
            </ButtonLink>
            {lookbook ? (
              <ButtonLink href={lookbook.fileUrl} target="_blank" rel="noreferrer">
                Open original <Download aria-hidden="true" size={15} />
              </ButtonLink>
            ) : null}
          </div>
        </div>

        {lookbook ? (
          <div className="relative mt-6 min-h-[70vh] overflow-hidden border border-black/20 bg-[#eceae4] lg:min-h-[calc(100vh-19rem)]">
            <iframe
              className="absolute inset-0 size-full border-0"
              src={`${lookbook.fileUrl}#view=FitH`}
              title={`Beauty Professionals Magazine Lookbook: ${lookbook.fileName}`}
            />
          </div>
        ) : (
          <div className="mt-6 flex min-h-[32rem] flex-col items-center justify-center border border-black/15 bg-[var(--paper)] px-6 text-center">
            <FileText aria-hidden="true" className="text-black/20" size={64} strokeWidth={1} />
            <h2 className="mt-5 [font-family:var(--font-editorial-title)] text-4xl font-bold">The next Lookbook is in production.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-black/58">Return soon for the newest collection of beauty, fashion, and professional work.</p>
            <Link className="focus-ring mt-6 text-xs font-semibold uppercase tracking-[0.1em] underline underline-offset-4" href="/articles">
              Read the latest stories
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
