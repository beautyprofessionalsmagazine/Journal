"use client";

import { upload } from "@vercel/blob/client";
import {
  AlertCircle,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  HardDrive,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  discardLookbookUploadAction,
  removeLookbookAction,
  saveLookbookAction,
} from "@/features/lookbook/server/lookbook-actions";
import {
  getLookbookIssueKey,
  getLookbookIssueLabel,
  getLookbookMonthName,
  LOOKBOOK_MIN_YEAR,
  LOOKBOOK_MONTHS,
  sortLookbooksNewestFirst,
} from "@/features/lookbook/lib/lookbook-issue";
import { PdfCover, PdfReader } from "@/features/lookbook/components/PdfViewer";
import type { Lookbook, LookbookActionResult } from "@/features/lookbook/types/lookbook";
import { Button, ButtonLink, ConfirmDialog, Select } from "@/shared/components/ui";

const MAX_LOOKBOOK_SIZE_BYTES = 50 * 1024 * 1024;
const MULTIPART_UPLOAD_THRESHOLD = 5 * 1024 * 1024;
const idleResult: LookbookActionResult = { status: "idle", message: "" };

type LookbookAdminPageProps = {
  initialLookbooks: Lookbook[];
};

type PendingLookbook = Pick<Lookbook, "fileUrl" | "fileName" | "fileSize"> & {
  issueMonth: number;
  issueYear: number;
};

export function LookbookAdminPage({ initialLookbooks }: LookbookAdminPageProps) {
  const today = new Date();
  const initialIssue = initialLookbooks[0];
  const [lookbooks, setLookbooks] = useState(
    [...initialLookbooks].sort(sortLookbooksNewestFirst),
  );
  const [selectedYear, setSelectedYear] = useState(
    String(initialIssue?.issueYear ?? today.getFullYear()),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    String(initialIssue?.issueMonth ?? today.getMonth() + 1),
  );
  const [pendingLookbook, setPendingLookbook] = useState<PendingLookbook | null>(null);
  const [result, setResult] = useState<LookbookActionResult>(idleResult);
  const [isUploading, setIsUploading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const [isDiscarding, startDiscarding] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => uploadControllerRef.current?.abort(), []);

  const issueYear = Number(selectedYear);
  const issueMonth = Number(selectedMonth);
  const selectedLookbook = lookbooks.find(
    (lookbook) =>
      lookbook.issueYear === issueYear && lookbook.issueMonth === issueMonth,
  );
  const preview = pendingLookbook ?? selectedLookbook ?? null;
  const hasUnsavedUpload = Boolean(pendingLookbook);
  const isBusy = isUploading || isSaving || isRemoving || isDiscarding;
  const issueLabel = getLookbookIssueLabel({ issueYear, issueMonth });
  const yearOptions = useMemo(() => {
    const maximumYear = new Date().getFullYear() + 1;

    return Array.from(
      { length: maximumYear - LOOKBOOK_MIN_YEAR + 1 },
      (_, index) => maximumYear - index,
    ).map((year) => ({ value: String(year), label: String(year) }));
  }, []);
  const monthOptions = LOOKBOOK_MONTHS.map((month, index) => ({
    value: String(index + 1),
    label: month,
  }));

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validatePdf(file);
    if (validationError) {
      setResult({ status: "error", message: validationError });
      return;
    }

    uploadControllerRef.current?.abort();
    const controller = new AbortController();
    uploadControllerRef.current = controller;
    setIsUploading(true);
    setResult(idleResult);

    try {
      const blob = await upload(
        buildLookbookPathname(file.name, issueYear, issueMonth),
        file,
        {
          access: "public",
          handleUploadUrl: "/api/lookbook/upload",
          contentType: "application/pdf",
          multipart: file.size > MULTIPART_UPLOAD_THRESHOLD,
          abortSignal: controller.signal,
        },
      );

      if (!isSafeHttpsUrl(blob.url)) {
        throw new Error("The upload returned an invalid URL. Please try again.");
      }

      setPendingLookbook({
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
        issueYear,
        issueMonth,
      });
      setResult({
        status: "success",
        message: `${issueLabel} PDF uploaded. Review the preview, then save to publish it.`,
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult({ status: "error", message: toUploadMessage(error) });
      }
    } finally {
      if (uploadControllerRef.current === controller) {
        uploadControllerRef.current = null;
        setIsUploading(false);
      }
    }
  }

  function saveLookbook() {
    if (!pendingLookbook) return;

    setResult(idleResult);
    startSaving(async () => {
      const nextResult = await saveLookbookAction(pendingLookbook);
      setResult(nextResult);

      if (nextResult.status === "success" && nextResult.lookbook) {
        setLookbooks((currentLookbooks) =>
          [
            ...currentLookbooks.filter(
              (lookbook) =>
                getLookbookIssueKey(lookbook) !==
                getLookbookIssueKey(nextResult.lookbook!),
            ),
            nextResult.lookbook!,
          ].sort(sortLookbooksNewestFirst),
        );
        setPendingLookbook(null);
      }
    });
  }

  function discardPendingUpload() {
    if (!pendingLookbook) return;

    setResult(idleResult);
    startDiscarding(async () => {
      const nextResult = await discardLookbookUploadAction(pendingLookbook.fileUrl);

      if (nextResult.status === "success") {
        setPendingLookbook(null);
        setResult({ status: "success", message: "Unpublished upload discarded." });
      } else {
        setResult(nextResult);
      }
    });
  }

  function removeLookbook() {
    setResult(idleResult);
    startRemoving(async () => {
      const nextResult = await removeLookbookAction({ issueYear, issueMonth });

      if (nextResult.status === "success") {
        setLookbooks((currentLookbooks) =>
          currentLookbooks.filter(
            (lookbook) =>
              lookbook.issueYear !== issueYear ||
              lookbook.issueMonth !== issueMonth,
          ),
        );
        setPendingLookbook(null);
        setShowRemoveDialog(false);
      }

      setResult(nextResult);
    });
  }

  function selectIssue(lookbook: Lookbook) {
    if (hasUnsavedUpload) return;

    setSelectedYear(String(lookbook.issueYear));
    setSelectedMonth(String(lookbook.issueMonth));
    setResult(idleResult);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[0.55rem] border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.55fr)] xl:items-end">
          <div>
            <p className="text-xs text-black/42">Lookbook / {issueLabel}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="[font-family:var(--font-editorial-title)] text-[clamp(2.7rem,5vw,4.7rem)] font-bold leading-[0.88] tracking-[-0.045em]">
                {issueLabel}
              </h2>
              <span
                className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-[0.63rem] font-semibold uppercase tracking-[0.08em] ${
                  selectedLookbook
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-black/[0.06] text-black/55"
                }`}
              >
                {selectedLookbook ? <CheckCircle2 aria-hidden="true" size={13} /> : null}
                {selectedLookbook ? "Published" : "Unpublished"}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/56">
              Choose an issue date, upload its PDF, and review the exact two-page
              reading experience before it appears in the public archive.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              disabled={hasUnsavedUpload || isBusy}
              id="lookbook-issue-year"
              label="Year"
              onChange={(value) => {
                setSelectedYear(value);
                setResult(idleResult);
              }}
              options={yearOptions}
              value={selectedYear}
            />
            <Select
              disabled={hasUnsavedUpload || isBusy}
              id="lookbook-issue-month"
              label="Month"
              onChange={(value) => {
                setSelectedMonth(value);
                setResult(idleResult);
              }}
              options={monthOptions}
              value={selectedMonth}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-5 py-3 sm:px-6">
          <nav aria-label="Lookbook admin sections" className="flex gap-6 overflow-x-auto">
            <a className="border-b-2 border-black py-2 text-xs font-semibold" href="#edition-overview">
              Overview
            </a>
            <a className="py-2 text-xs font-semibold text-black/48 hover:text-black" href="#edition-reader">
              PDF &amp; reader
            </a>
            <a className="py-2 text-xs font-semibold text-black/48 hover:text-black" href="#published-archive">
              Archive
            </a>
          </nav>
          <ButtonLink
            href={`/lookbook?year=${issueYear}&month=${issueMonth}`}
            target="_blank"
            variant="secondary"
          >
            View public page <ExternalLink aria-hidden="true" size={15} />
          </ButtonLink>
        </div>

        {hasUnsavedUpload ? (
          <p className="border-t border-[var(--champagne)]/30 bg-[#fbf7ed] px-5 py-3 text-xs leading-5 text-black/62 sm:px-6">
            Save or discard this uploaded PDF before choosing another edition.
          </p>
        ) : null}
      </section>

      <section
        className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.55fr)]"
        id="edition-overview"
      >
        <div className="min-w-0 rounded-[0.55rem] border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 border-b border-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="editorial-kicker text-black/42">Edition overview</p>
              <h3 className="mt-2 [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-3xl font-bold">
                {preview ? preview.fileName : "No PDF published"}
              </h3>
            </div>
            {preview ? (
              <ButtonLink href={preview.fileUrl} rel="noreferrer" target="_blank" variant="secondary">
                Original <ExternalLink aria-hidden="true" size={15} />
              </ButtonLink>
            ) : null}
          </div>

          {preview ? (
            <div className="mt-5 grid min-w-0 gap-6 md:grid-cols-[13rem_minmax(0,1fr)] md:items-center">
              <div className="min-w-0 border border-black/10 bg-[#ebe9e3] p-2 shadow-[0_14px_35px_rgba(0,0,0,0.1)]">
                <PdfCover eager src={preview.fileUrl} title={issueLabel} />
              </div>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[0.35rem] border border-black/10 bg-black/10">
                <AdminFact icon={<CalendarDays aria-hidden="true" size={16} />} label="Issue date" value={issueLabel} />
                <AdminFact icon={<HardDrive aria-hidden="true" size={16} />} label="File size" value={formatFileSize(preview.fileSize)} />
                <AdminFact icon={<BookOpenText aria-hidden="true" size={16} />} label="Reader" value="Two-page spread" />
                <AdminFact icon={<FileText aria-hidden="true" size={16} />} label="Format" value="PDF" />
              </dl>
            </div>
          ) : (
            <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-[0.4rem] border border-dashed border-black/18 bg-[#f7f7f5] px-8 text-center">
              <FileText aria-hidden="true" className="text-black/22" size={48} strokeWidth={1.2} />
              <p className="mt-4 max-w-sm text-sm leading-6 text-black/54">
                Upload a PDF to add {issueLabel} to the public archive.
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit min-w-0 rounded-[0.55rem] border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6 xl:sticky xl:top-4">
          <p className="editorial-kicker text-black/42">PDF file</p>
          <h3 className="mt-2 [font-family:var(--font-editorial-title)] text-3xl font-bold">
            Manage edition
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/54">
            PDF only, up to 50 MB. Replacing the file updates only this month.
          </p>

          <input
            accept="application/pdf,.pdf"
            aria-describedby="lookbook-upload-status"
            className="sr-only"
            id="lookbook-file"
            onChange={handleFileChange}
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
          />

          <div className="mt-5 grid gap-3">
            <Button
              disabled={hasUnsavedUpload || isSaving || isRemoving || isDiscarding}
              isLoading={isUploading}
              loadingLabel="Uploading"
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              variant="secondary"
            >
              {selectedLookbook ? <RefreshCw aria-hidden="true" size={16} /> : <Upload aria-hidden="true" size={16} />}
              {selectedLookbook ? "Replace PDF" : "Choose PDF"}
            </Button>
            {hasUnsavedUpload ? (
              <>
                <Button isLoading={isSaving} loadingLabel="Publishing" onClick={saveLookbook} size="lg">
                  Save and publish
                </Button>
                <Button
                  disabled={isSaving}
                  isLoading={isDiscarding}
                  loadingLabel="Discarding"
                  onClick={discardPendingUpload}
                  variant="text"
                >
                  Discard upload
                </Button>
              </>
            ) : null}
          </div>

          <div className="min-h-20 pt-4" id="lookbook-upload-status">
            {result.status !== "idle" ? (
              <div
                className={`flex items-start gap-2 rounded-[0.35rem] border p-3 text-sm leading-5 ${
                  result.status === "error"
                    ? "border-red-700/25 bg-red-50 text-red-800"
                    : "border-emerald-700/25 bg-emerald-50 text-emerald-900"
                }`}
                role={result.status === "error" ? "alert" : "status"}
              >
                {result.status === "error" ? (
                  <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                )}
                <p>{result.message}</p>
              </div>
            ) : null}
          </div>

          {selectedLookbook && !hasUnsavedUpload ? (
            <div className="border-t border-black/10 pt-5">
              <p className="text-xs leading-5 text-black/45">
                Removing {issueLabel} permanently deletes its PDF. Other editions stay published.
              </p>
              <Button
                className="mt-3"
                onClick={() => {
                  setResult(idleResult);
                  setShowRemoveDialog(true);
                }}
                variant="destructive"
              >
                <Trash2 aria-hidden="true" size={15} /> Remove edition
              </Button>
            </div>
          ) : null}
        </aside>
      </section>

      <section
        className="rounded-[0.55rem] border border-black/10 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6"
        id="edition-reader"
      >
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="editorial-kicker text-black/42">Edition preview</p>
            <h3 className="mt-2 [font-family:var(--font-editorial-title)] text-3xl font-bold">
              Two-page reader
            </h3>
          </div>
          <p className="max-w-lg text-xs leading-5 text-black/45">
            Review consecutive pages as a magazine spread. Full-screen mode keeps two pages visible together.
          </p>
        </div>
        {preview ? (
          <PdfReader fileName={preview.fileName} src={preview.fileUrl} title={issueLabel} />
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-[0.4rem] bg-[#242424] px-8 text-center text-white/55">
            Upload a PDF to preview this edition.
          </div>
        )}
      </section>

      <section
        className="rounded-[0.55rem] border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6"
        id="published-archive"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="editorial-kicker text-black/42">Published archive</p>
            <h3 className="mt-2 [font-family:var(--font-editorial-title)] text-3xl font-bold">
              {lookbooks.length} {lookbooks.length === 1 ? "edition" : "editions"}
            </h3>
          </div>
          <ButtonLink href="/lookbook" target="_blank" variant="secondary">
            View public archive <ExternalLink aria-hidden="true" size={15} />
          </ButtonLink>
        </div>

        {lookbooks.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {lookbooks.map((lookbook) => {
              const isSelected =
                lookbook.issueYear === issueYear && lookbook.issueMonth === issueMonth;
              const label = getLookbookIssueLabel(lookbook);

              return (
                <button
                  aria-pressed={isSelected}
                  className={`group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 rounded-[0.35rem] border p-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:border-black/35 hover:bg-[#f7f7f5]"
                  }`}
                  disabled={hasUnsavedUpload || isBusy}
                  key={lookbook.id}
                  onClick={() => selectIssue(lookbook)}
                  type="button"
                >
                  <PdfCover className="border border-black/10" src={lookbook.fileUrl} title={label} />
                  <span className="min-w-0">
                    <span className={`editorial-kicker ${isSelected ? "text-white/48" : "text-black/38"}`}>
                      {lookbook.issueYear}
                    </span>
                    <span className="mt-1 block [font-family:var(--font-editorial-title)] text-xl font-bold">
                      {getLookbookMonthName(lookbook.issueMonth)}
                    </span>
                    <span className={`mt-1 block truncate text-[0.62rem] ${isSelected ? "text-white/52" : "text-black/38"}`}>
                      {lookbook.fileName}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 rounded-[0.35rem] border border-black/10 bg-[#f7f7f5] p-5 text-sm leading-6 text-black/54">
            No editions are published yet. Choose a year and month above to add the first one.
          </p>
        )}
      </section>

      <ConfirmDialog
        confirmLabel="Remove edition"
        description={`This permanently deletes ${issueLabel} (${selectedLookbook?.fileName ?? "the selected PDF"}) from storage. It cannot be recovered.`}
        error={result.status === "error" ? result.message : null}
        isPending={isRemoving}
        onCancel={() => {
          if (!isRemoving) setShowRemoveDialog(false);
        }}
        onConfirm={removeLookbook}
        open={showRemoveDialog}
        title={`Remove ${issueLabel}?`}
      />
    </div>
  );
}

function AdminFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-black/38">
        {icon}
        <dt className="editorial-kicker">{label}</dt>
      </div>
      <dd className="mt-2 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function validatePdf(file: File) {
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    return "Choose a PDF file.";
  }
  if (file.size === 0) return "The selected PDF is empty.";
  if (file.size > MAX_LOOKBOOK_SIZE_BYTES) return "The PDF is too large. Choose a file under 50 MB.";
  return null;
}

function buildLookbookPathname(fileName: string, issueYear: number, issueMonth: number) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `lookbook/${issueYear}/${String(issueMonth).padStart(2, "0")}/${safeName || "lookbook.pdf"}`;
}

function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function toUploadMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Lookbook upload failed. Please try again.";
  return message.includes("client token")
    ? "We couldn't authorize this upload. Refresh the page, confirm you're still signed in, then try again."
    : message;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
