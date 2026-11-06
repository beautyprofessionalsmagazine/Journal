import { ArrowRight, ArrowUpRight, BookOpen, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

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
  LOOKBOOK_MONTHS,
} from "@/features/lookbook/lib/lookbook-issue";
import { getLookbookArchive } from "@/features/lookbook/server/lookbook-queries";
import type { Lookbook } from "@/features/lookbook/types/lookbook";
import { ButtonLink } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type LookbookPageProps = {
  issueMonth?: number;
  issueYear?: number;
};

export async function LookbookPage({ issueMonth, issueYear }: LookbookPageProps) {
  const archive = await getLookbookArchive();

  if (archive.status === "unavailable") {
    return <LookbookUnavailable />;
  }

  const { lookbooks } = archive;
  const hasRequestedIssue =
    issueMonth !== undefined &&
    issueYear !== undefined &&
    isValidLookbookIssue(issueYear, issueMonth);
  const requestedLookbook = hasRequestedIssue
    ? lookbooks.find(
        (lookbook) =>
          lookbook.issueYear === issueYear && lookbook.issueMonth === issueMonth,
      )
    : undefined;
  const latestLookbook = lookbooks[0];
  const selectedLookbook = requestedLookbook ?? latestLookbook;

  if (!selectedLookbook) {
    return <EmptyLookbook />;
  }

  const selectedLabel = getLookbookIssueLabel(selectedLookbook);
  const isLatest = selectedLookbook.id === latestLookbook.id;
  const yearGroups = groupLookbooksByYear(lookbooks);
  const selectedYearGroup =
    yearGroups.find((group) => group.year === selectedLookbook.issueYear) ??
    yearGroups[0];
  const missedIssueLabel =
    hasRequestedIssue && !requestedLookbook
      ? getLookbookIssueLabel({ issueYear: issueYear!, issueMonth: issueMonth! })
      : null;

  return (
    <main className="overflow-x-clip bg-[var(--paper)] text-[var(--foreground)]">
      {/* ─── Cover-led opening spread ─────────────────────────────────── */}
      <section
        aria-labelledby="lookbook-title"
        className="relative border-b border-black/12 bg-[linear-gradient(180deg,#f8f6f1_0%,#efebe2_100%)]"
      >
        <div className="site-container grid gap-x-[clamp(2.5rem,7vw,7rem)] gap-y-8 pb-[clamp(3rem,7vw,6.5rem)] pt-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:grid-rows-[auto_1fr]">
          <header className="@container min-w-0" data-motion-feature-copy>
            <div className="flex items-center justify-between gap-4 border-b border-black pb-3">
              <p className="editorial-kicker text-[var(--champagne-dark)]">
                The collected editions
              </p>
              <p className="editorial-kicker text-black/45">
                {lookbooks.length} {lookbooks.length === 1 ? "issue" : "issues"}
              </p>
            </div>
            <h1
              className="mt-5 [font-family:var(--font-editorial-title)] text-[min(21cqw,11rem)] font-bold leading-[0.8] tracking-[-0.065em] sm:mt-7"
              id="lookbook-title"
            >
              Lookbook
            </h1>
          </header>

          <div
            className="relative mx-auto w-full max-w-[22rem] min-w-0 pb-5 pr-5 sm:max-w-[26rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:ml-auto lg:max-w-[30rem] lg:self-center"
            data-motion-feature-media
            data-motion-managed
            style={pdfCoverStackStyle}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 left-5 top-5 border border-black/10 bg-[#d9d2c4]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bottom-2.5 left-2.5 right-2.5 top-2.5 border border-black/10 bg-[#e9e4da]"
            />
            <div className="relative border border-black/15 bg-white p-2 shadow-[0_30px_80px_rgba(36,27,15,0.22)] sm:p-2.5">
              <PdfCover
                eager
                fileSize={selectedLookbook.fileSize}
                src={selectedLookbook.fileUrl}
                title={selectedLabel}
              />
              <p className="flex items-center justify-between gap-3 px-0.5 pb-0.5 pt-2.5 sm:pt-3">
                <span className="editorial-kicker text-[var(--champagne-dark)]">
                  {isLatest ? "Latest edition" : "From the archive"}
                </span>
                <span className="editorial-kicker text-black/45">{selectedLabel}</span>
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-end" data-reveal>
            {missedIssueLabel ? (
              <p
                className="mb-6 border-l-2 border-[var(--champagne)] bg-white/70 px-4 py-3 text-sm leading-6 text-black/70"
                role="status"
              >
                There is no Lookbook for {missedIssueLabel} yet, so the latest
                edition is shown instead.
              </p>
            ) : null}

            <p className="editorial-kicker text-black/45">Now reading</p>
            <h2 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.6rem,6.5vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.045em]">
              {getLookbookMonthName(selectedLookbook.issueMonth)}{" "}
              <span className="text-black/35">{selectedLookbook.issueYear}</span>
            </h2>
            <p className="mt-5 max-w-xl text-[clamp(1rem,1.4vw,1.15rem)] leading-8 text-black/66">
              A visual record of the people, techniques, and ideas shaping beauty
              work now — read it as a magazine spread, page by page.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PdfReaderLaunch
                className="w-full sm:w-auto"
                fileName={selectedLookbook.fileName}
                fileSize={selectedLookbook.fileSize}
                size="lg"
                src={selectedLookbook.fileUrl}
                title={selectedLabel}
              >
                Read the issue <BookOpen aria-hidden="true" size={16} />
              </PdfReaderLaunch>
              <ButtonLink
                className="w-full sm:w-auto"
                href={selectedLookbook.fileUrl}
                rel="noreferrer"
                size="lg"
                target="_blank"
                variant="secondary"
              >
                Download PDF <ArrowUpRight aria-hidden="true" size={16} />
              </ButtonLink>
            </div>

            <dl className="mt-9 grid grid-cols-3 border-y border-black/15">
              <EditionDetail label="Year" value={String(selectedLookbook.issueYear)} />
              <EditionDetail
                label="Edition"
                value={getLookbookMonthName(selectedLookbook.issueMonth)}
              />
              <EditionDetail label="File" value={formatFileSize(selectedLookbook.fileSize)} />
            </dl>
          </div>
        </div>
      </section>

      {/* ─── Edition navigator ────────────────────────────────────────── */}
      <section
        aria-labelledby="lookbook-browse-title"
        className="scroll-mt-4 border-b border-black/12 bg-white py-[clamp(2.75rem,5vw,4.5rem)]"
        id="editions"
      >
        <div className="site-container">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="editorial-kicker text-black/42">Browse by issue</p>
              <h2
                className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.2rem,4.5vw,3.75rem)] font-bold leading-none tracking-[-0.04em]"
                id="lookbook-browse-title"
              >
                Choose an edition
              </h2>
            </div>
            <nav aria-label="Lookbook years">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {yearGroups.map((group) => {
                  const isActive = group.year === selectedYearGroup.year;

                  return (
                    <li key={group.year}>
                      <Link
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "focus-ring link-transition inline-flex min-h-11 items-center border-b-2 [font-family:var(--font-editorial-title)] text-2xl font-bold tabular-nums",
                          isActive
                            ? "border-black text-black"
                            : "border-transparent text-black/38 hover:border-black/30 hover:text-black",
                        )}
                        href={issueHref(group.lookbooks[0])}
                      >
                        {group.year}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <ol
            aria-label={`${selectedYearGroup.year} editions`}
            className="mt-8 grid grid-cols-3 border-l border-t border-black/15 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12"
          >
            {LOOKBOOK_MONTHS.map((monthName, index) => {
              const month = index + 1;
              const lookbook = selectedYearGroup.lookbooks.find(
                (item) => item.issueMonth === month,
              );
              const isSelected = lookbook?.id === selectedLookbook.id;
              const cellClass =
                "flex min-h-[5.25rem] flex-col justify-between border-b border-r border-black/15 p-3";

              return (
                <li className="min-w-0" key={monthName}>
                  {lookbook ? (
                    <Link
                      aria-current={isSelected ? "page" : undefined}
                      aria-label={`${monthName} ${selectedYearGroup.year} Lookbook`}
                      className={cn(
                        cellClass,
                        "focus-ring surface-transition group h-full",
                        isSelected
                          ? "bg-black text-white"
                          : "bg-white hover:bg-[var(--paper)]",
                      )}
                      href={issueHref(lookbook)}
                    >
                      <span className="editorial-kicker">{monthName.slice(0, 3)}</span>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[0.68rem] font-semibold",
                          isSelected ? "text-[var(--champagne)]" : "text-black/55",
                        )}
                      >
                        {isSelected ? "Reading" : "Open"}
                        {isSelected ? null : (
                          <ArrowRight
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-x-0.5"
                            size={12}
                          />
                        )}
                      </span>
                    </Link>
                  ) : (
                    <span
                      aria-label={`${monthName} ${selectedYearGroup.year}: no edition`}
                      className={cn(cellClass, "h-full bg-[#fbfaf7] text-black/28")}
                    >
                      <span className="editorial-kicker">{monthName.slice(0, 3)}</span>
                      <span aria-hidden="true" className="text-[0.68rem]">—</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── Archive by year ──────────────────────────────────────────── */}
      <section
        aria-labelledby="lookbook-archive-title"
        className="py-[clamp(3.5rem,7vw,6rem)]"
      >
        <div className="site-container">
          <div className="flex items-end justify-between gap-5 border-b border-black pb-4">
            <div>
              <p className="editorial-kicker text-black/42">The archive</p>
              <h2
                className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.2rem,4.5vw,3.75rem)] font-bold leading-none tracking-[-0.04em]"
                id="lookbook-archive-title"
              >
                Every edition
              </h2>
            </div>
          </div>

          {yearGroups.map((group) => (
            <div className="mt-10 first-of-type:mt-8" key={group.year} data-reveal>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="[font-family:var(--font-editorial-title)] text-3xl font-bold tabular-nums">
                  {group.year}
                </h3>
                <p className="text-xs text-black/45">
                  {group.lookbooks.length}{" "}
                  {group.lookbooks.length === 1 ? "edition" : "editions"}
                </p>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
                {group.lookbooks.map((lookbook) => (
                  <li className="min-w-0" key={getLookbookIssueKey(lookbook)}>
                    <ArchiveCard
                      isSelected={lookbook.id === selectedLookbook.id}
                      lookbook={lookbook}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Print edition band ───────────────────────────────────────── */}
      <section className="site-header-surface">
        <div className="site-container grid gap-8 py-[clamp(3rem,6vw,5rem)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl" data-reveal>
            <p className="editorial-kicker text-[var(--champagne)]">In print</p>
            <p className="mt-3 [font-family:var(--font-editorial-title)] text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[0.95] tracking-[-0.035em]">
              Hold the next edition in your hands.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/62">
              Salons and schools receive printed copies every issue. Find a
              distribution partner near you, or subscribe your team.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              className="border-white bg-white text-black hover:bg-transparent hover:text-white"
              href="/subscribe"
              size="lg"
            >
              Subscribe <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
            <ButtonLink
              className="border-white/35 bg-transparent text-white hover:border-white hover:bg-white hover:text-black"
              href="/where-to-find"
              size="lg"
              variant="outline"
            >
              <MapPin aria-hidden="true" size={16} /> Where to find
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}

function ArchiveCard({
  isSelected,
  lookbook,
}: {
  isSelected: boolean;
  lookbook: Lookbook;
}) {
  const label = getLookbookIssueLabel(lookbook);

  return (
    <Link
      aria-current={isSelected ? "page" : undefined}
      className="group focus-ring block"
      href={issueHref(lookbook)}
    >
      <div
        className={cn(
          "relative border bg-white p-1.5 transition-[border-color,box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_36px_rgba(24,18,10,0.14)] motion-reduce:transform-none sm:p-2",
          isSelected ? "border-black" : "border-black/10 group-hover:border-black/30",
        )}
      >
        <PdfCover fileSize={lookbook.fileSize} src={lookbook.fileUrl} title={label} />
        {isSelected ? (
          <span className="editorial-kicker absolute left-0 top-3 bg-black px-2 py-1 text-[0.58rem] text-[var(--champagne)]">
            Reading
          </span>
        ) : null}
      </div>
      <p className="mt-3 [font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
        {getLookbookMonthName(lookbook.issueMonth)}
      </p>
      <p className="mt-1 flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-black/45 group-hover:text-black">
        {lookbook.issueYear} · Open
        <ArrowRight
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
          size={12}
        />
      </p>
    </Link>
  );
}

function EditionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-r border-black/15 py-4 pl-3 first:pl-0 last:border-r-0">
      <dt className="editorial-kicker text-black/40">{label}</dt>
      <dd className="mt-2 truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}

function EmptyLookbook() {
  return (
    <LookbookNotice
      action={<ButtonLink href="/articles">Read the latest stories</ButtonLink>}
      body="Return soon for a new collection of beauty, fashion, and professional work."
      title="The first edition is in production."
    />
  );
}

function LookbookUnavailable() {
  return (
    <LookbookNotice
      action={
        <ButtonLink href="/lookbook" variant="secondary">
          Try again
        </ButtonLink>
      }
      body="The archive is temporarily unavailable. Please try again in a moment."
      title="The editions are on their way."
    />
  );
}

function LookbookNotice({
  action,
  body,
  title,
}: {
  action: ReactNode;
  body: string;
  title: string;
}) {
  return (
    <main className="bg-[var(--paper)]">
      <div className="site-container flex min-h-[38rem] flex-col items-center justify-center py-16 text-center">
        <FileText aria-hidden="true" className="text-black/20" size={56} strokeWidth={1} />
        <p className="editorial-kicker mt-6 text-[var(--champagne-dark)]">Lookbook archive</p>
        <h1 className="mt-3 max-w-3xl [font-family:var(--font-editorial-title)] text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-black/58">{body}</p>
        <div className="mt-7">{action}</div>
      </div>
    </main>
  );
}

type LookbookYearGroup = { year: number; lookbooks: Lookbook[] };

function groupLookbooksByYear(lookbooks: Lookbook[]): LookbookYearGroup[] {
  const groups = new Map<number, Lookbook[]>();

  lookbooks.forEach((lookbook) => {
    groups.set(lookbook.issueYear, [...(groups.get(lookbook.issueYear) ?? []), lookbook]);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({
      year,
      lookbooks: items.sort((a, b) => b.issueMonth - a.issueMonth),
    }));
}

function issueHref(lookbook: Pick<Lookbook, "issueYear" | "issueMonth">) {
  return `/lookbook?year=${lookbook.issueYear}&month=${lookbook.issueMonth}`;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
