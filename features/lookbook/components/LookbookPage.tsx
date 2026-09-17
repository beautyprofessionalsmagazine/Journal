import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";

import { LookbookFilters } from "@/features/lookbook/components/LookbookFilters";
import {
  PdfCover,
  PdfReaderLaunch,
  pdfCoverStackStyle,
} from "@/features/lookbook/components/PdfViewer";
import {
  getLookbookIssueKey,
  getLookbookIssueLabel,
  getLookbookMonthName,
  isValidLookbookIssue,
} from "@/features/lookbook/lib/lookbook-issue";
import { getLookbooks } from "@/features/lookbook/server/lookbook-queries";
import type { Lookbook } from "@/features/lookbook/types/lookbook";
import { ButtonLink } from "@/shared/components/ui";

type LookbookPageProps = {
  issueMonth?: number;
  issueYear?: number;
};

export async function LookbookPage({ issueMonth, issueYear }: LookbookPageProps) {
  const lookbooks = await getLookbooks();
  const requestedIssue =
    issueMonth !== undefined &&
    issueYear !== undefined &&
    isValidLookbookIssue(issueYear, issueMonth)
      ? lookbooks.find(
          (lookbook) =>
            lookbook.issueYear === issueYear &&
            lookbook.issueMonth === issueMonth,
        )
      : null;
  const selectedLookbook = requestedIssue ?? lookbooks[0] ?? null;
  const issuesByYear = groupLookbooksByYear(lookbooks);

  if (!selectedLookbook) {
    return <EmptyLookbook />;
  }

  const selectedLabel = getLookbookIssueLabel(selectedLookbook);

  return (
    <main className="overflow-x-clip bg-[#f7f5f0]">
      <section className="relative overflow-hidden border-b border-black/12 bg-[radial-gradient(circle_at_72%_24%,rgba(184,155,98,0.2),transparent_32%),linear-gradient(108deg,#f7f4ed_0%,#ebe6dc_100%)]">
        <div className="absolute inset-0 opacity-[0.16] [background-image:url('/images/journal-bg.PNG')] [background-size:100%_auto]" />
        <div className="site-container relative grid min-h-[clamp(35rem,72vh,50rem)] items-center gap-10 py-[clamp(3rem,7vw,7rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(23rem,0.72fr)]">
          <div className="relative z-10 max-w-3xl" data-reveal>
            <p className="editorial-kicker text-[var(--champagne-dark)]">
              The collected editions
            </p>
            <h1 className="mt-4 [font-family:var(--font-editorial-title)] text-[clamp(4.8rem,12vw,10.5rem)] font-bold leading-[0.76] tracking-[-0.065em]">
              Lookbook
            </h1>
            <p className="mt-7 max-w-xl text-[clamp(1rem,1.5vw,1.2rem)] leading-8 text-black/68">
              Explore the Beauty Professionals Magazine archive—a visual record
              of the people, techniques, and ideas shaping beauty work now.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PdfReaderLaunch
                fileName={selectedLookbook.fileName}
                src={selectedLookbook.fileUrl}
                title={selectedLabel}
              >
                Read {selectedLabel} <ArrowRight aria-hidden="true" size={15} />
              </PdfReaderLaunch>
              <ButtonLink href="#editions" variant="secondary">
                Browse editions
              </ButtonLink>
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-[27rem] pb-8 pr-8 lg:mr-2"
            data-motion-feature-media
            data-motion-managed
            style={pdfCoverStackStyle}
          >
            <div className="absolute bottom-1 right-1 top-8 w-[78%] border border-black/12 bg-[#cfc8bb] shadow-[0_24px_70px_rgba(46,35,19,0.16)]" />
            <div className="absolute bottom-4 right-4 top-4 w-[84%] border border-black/12 bg-[#e6e0d5]" />
            <div className="relative ml-auto w-[88%] border border-black/15 bg-white p-2 shadow-[0_28px_80px_rgba(36,27,15,0.22)] sm:p-3">
              <PdfCover eager src={selectedLookbook.fileUrl} title={selectedLabel} />
            </div>
            <div className="absolute bottom-0 left-0 bg-black px-4 py-3 text-white shadow-xl">
              <p className="editorial-kicker text-white/55">Featured edition</p>
              <p className="mt-1 [font-family:var(--font-editorial-title)] text-2xl font-bold">
                {selectedLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container relative z-10 -mt-6" data-reveal>
        <div className="border border-black/12 bg-white/95 p-5 shadow-[0_18px_55px_rgba(40,30,17,0.08)] backdrop-blur-sm sm:p-6">
          <LookbookFilters
            issuesByYear={issuesByYear}
            selectedMonth={selectedLookbook.issueMonth}
            selectedYear={selectedLookbook.issueYear}
          />
        </div>
      </section>

      <section className="site-container py-[clamp(4rem,8vw,7rem)]" data-reveal>
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(3rem,8vw,8rem)]">
          <div className="mx-auto min-w-0 w-full max-w-[27rem] border border-black/12 bg-white p-3 shadow-[0_24px_60px_rgba(25,19,11,0.12)]">
            <PdfCover eager src={selectedLookbook.fileUrl} title={selectedLabel} />
          </div>
          <div className="min-w-0 max-w-2xl">
            <p className="editorial-kicker text-black/42">Featured edition</p>
            <h2 className="mt-3 [font-family:var(--font-editorial-title)] text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.86] tracking-[-0.052em]">
              {selectedLabel}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-black/62">
              Open the edition in a custom two-page reader made for magazine
              spreads, with page-pair navigation, zoom, and a distraction-free
              full-screen view.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PdfReaderLaunch
                fileName={selectedLookbook.fileName}
                src={selectedLookbook.fileUrl}
                title={selectedLabel}
              />
              <ButtonLink
                href={selectedLookbook.fileUrl}
                rel="noreferrer"
                target="_blank"
                variant="secondary"
              >
                Original PDF <ArrowUpRight aria-hidden="true" size={15} />
              </ButtonLink>
            </div>
            <dl className="mt-9 grid grid-cols-2 border-y border-black/15 sm:grid-cols-3">
              <EditionDetail label="Year" value={String(selectedLookbook.issueYear)} />
              <EditionDetail label="Edition" value={getLookbookMonthName(selectedLookbook.issueMonth)} />
              <EditionDetail label="File size" value={formatFileSize(selectedLookbook.fileSize)} />
            </dl>
          </div>
        </div>
      </section>

      <section
        className="border-t border-black/15 bg-white py-[clamp(3.5rem,7vw,6rem)]"
        id="editions"
      >
        <div className="site-container">
          <div className="flex items-end justify-between gap-5 border-b border-black pb-5">
            <div>
              <p className="editorial-kicker text-black/42">The archive</p>
              <h2 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.04em]">
                All editions
              </h2>
            </div>
            <p className="text-xs text-black/45">
              {lookbooks.length} {lookbooks.length === 1 ? "issue" : "issues"}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {lookbooks.map((lookbook) => {
              const label = getLookbookIssueLabel(lookbook);
              const isSelected = lookbook.id === selectedLookbook.id;

              return (
                <Link
                  aria-current={isSelected ? "page" : undefined}
                  className="group focus-ring"
                  href={`/lookbook?year=${lookbook.issueYear}&month=${lookbook.issueMonth}`}
                  key={getLookbookIssueKey(lookbook)}
                >
                  <div
                    className={`border bg-[#efede7] p-1.5 transition-[border-color,box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:border-black/35 group-hover:shadow-[0_18px_36px_rgba(24,18,10,0.13)] ${
                      isSelected ? "border-black" : "border-black/10"
                    }`}
                  >
                    <PdfCover src={lookbook.fileUrl} title={label} />
                  </div>
                  <p className="mt-3 [font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.08em] text-black/42">
                    {lookbook.fileName}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function EditionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-black/15 px-3 py-4 first:pl-0 sm:border-r sm:last:border-r-0">
      <dt className="editorial-kicker text-black/38">{label}</dt>
      <dd className="mt-2 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function EmptyLookbook() {
  return (
    <main className="bg-white">
      <div className="site-container flex min-h-[42rem] flex-col items-center justify-center py-16 text-center">
        <FileText aria-hidden="true" className="text-black/20" size={64} strokeWidth={1} />
        <p className="editorial-kicker mt-6 text-[var(--champagne-dark)]">Lookbook archive</p>
        <h1 className="mt-3 [font-family:var(--font-editorial-title)] text-[clamp(3.5rem,8vw,7rem)] font-bold leading-[0.85] tracking-[-0.05em]">
          The first edition is in production.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-black/58">
          Return soon for a new collection of beauty, fashion, and professional work.
        </p>
        <ButtonLink className="mt-7" href="/articles">
          Read the latest stories
        </ButtonLink>
      </div>
    </main>
  );
}

function groupLookbooksByYear(lookbooks: Lookbook[]) {
  const groups: Record<string, number[]> = {};

  lookbooks.forEach((lookbook) => {
    const key = String(lookbook.issueYear);
    groups[key] = [...(groups[key] ?? []), lookbook.issueMonth].sort(
      (a, b) => b - a,
    );
  });

  return groups;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
