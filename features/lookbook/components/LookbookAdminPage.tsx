"use client";

import { upload } from "@vercel/blob/client";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState, useTransition } from "react";

import {
  removeLookbookAction,
  saveLookbookAction,
} from "@/features/lookbook/server/lookbook-actions";
import type { Lookbook, LookbookActionResult } from "@/features/lookbook/types/lookbook";
import { Button, ButtonLink, ConfirmDialog } from "@/shared/components/ui";

const MAX_LOOKBOOK_SIZE_BYTES = 50 * 1024 * 1024;
const MULTIPART_UPLOAD_THRESHOLD = 5 * 1024 * 1024;
const idleResult: LookbookActionResult = { status: "idle", message: "" };

type LookbookAdminPageProps = {
  initialLookbook: Lookbook | null;
};

type PendingLookbook = Pick<Lookbook, "fileUrl" | "fileName" | "fileSize">;

export function LookbookAdminPage({ initialLookbook }: LookbookAdminPageProps) {
  const [currentLookbook, setCurrentLookbook] = useState(initialLookbook);
  const [pendingLookbook, setPendingLookbook] = useState<PendingLookbook | null>(null);
  const [result, setResult] = useState<LookbookActionResult>(idleResult);
  const [isUploading, setIsUploading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => uploadControllerRef.current?.abort(), []);

  const preview = pendingLookbook ?? currentLookbook;
  const hasUnsavedUpload = Boolean(pendingLookbook);

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
      const blob = await upload(buildLookbookPathname(file.name), file, {
        access: "public",
        handleUploadUrl: "/api/lookbook/upload",
        contentType: "application/pdf",
        multipart: file.size > MULTIPART_UPLOAD_THRESHOLD,
        abortSignal: controller.signal,
      });

      if (!isSafeHttpsUrl(blob.url)) {
        throw new Error("The upload returned an invalid URL. Please try again.");
      }

      setPendingLookbook({
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
      });
      setResult({
        status: "success",
        message: "PDF uploaded. Review the preview, then save to publish it.",
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult({
          status: "error",
          message: toUploadMessage(error),
        });
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
        setCurrentLookbook(nextResult.lookbook);
        setPendingLookbook(null);
      }
    });
  }

  function removeLookbook() {
    setResult(idleResult);
    startRemoving(async () => {
      const nextResult = await removeLookbookAction();

      if (nextResult.status === "success") {
        setCurrentLookbook(null);
        setPendingLookbook(null);
        setShowRemoveDialog(false);
        setResult(nextResult);
      } else {
        setResult(nextResult);
      }
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)]">
      <section className="min-w-0 border border-black/15">
        <div className="flex flex-col gap-4 border-b border-black/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="editorial-kicker text-black/45">Active publication</p>
            <h2 className="mt-1 [font-family:var(--font-editorial-title)] text-3xl font-bold">
              {preview ? preview.fileName : "No Lookbook uploaded"}
            </h2>
          </div>
          {preview ? (
            <ButtonLink href={preview.fileUrl} target="_blank" rel="noreferrer" variant="secondary">
              Open original <ExternalLink aria-hidden="true" size={15} />
            </ButtonLink>
          ) : null}
        </div>

        <div className="relative min-h-[32rem] bg-[#eceae4]">
          {preview ? (
            <iframe
              className="absolute inset-0 size-full border-0"
              src={`${preview.fileUrl}#view=FitH&toolbar=0`}
              title={`Preview of ${preview.fileName}`}
            />
          ) : (
            <div className="flex min-h-[32rem] flex-col items-center justify-center px-8 text-center">
              <FileText aria-hidden="true" className="text-black/25" size={58} strokeWidth={1.1} />
              <p className="mt-5 max-w-sm text-sm leading-6 text-black/58">
                Upload one PDF to make the current Lookbook available from the public header.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="h-fit border-t border-black pt-5 xl:sticky xl:top-8">
        <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">Manage PDF</h2>
        <p className="mt-2 text-sm leading-6 text-black/60">
          One Lookbook is active at a time. PDF only, up to 50 MB.
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

        <div className="mt-6 grid gap-3">
          <Button
            disabled={isSaving || isRemoving}
            isLoading={isUploading}
            loadingLabel="Uploading"
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            variant="secondary"
          >
            {currentLookbook ? <RefreshCw aria-hidden="true" size={16} /> : <Upload aria-hidden="true" size={16} />}
            {currentLookbook ? "Choose replacement" : "Choose PDF"}
          </Button>
          {hasUnsavedUpload ? (
            <>
              <Button isLoading={isSaving} loadingLabel="Saving" onClick={saveLookbook} size="lg">
                Save and publish
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => {
                  setPendingLookbook(null);
                  setResult(idleResult);
                }}
                variant="text"
              >
                Discard preview
              </Button>
            </>
          ) : null}
        </div>

        <div className="min-h-20 pt-5" id="lookbook-upload-status">
          {result.status !== "idle" ? (
            <div
              className={`flex items-start gap-2 border p-3 text-sm leading-5 ${
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

        {currentLookbook && !hasUnsavedUpload ? (
          <div className="mt-6 border-t border-black/15 pt-6">
            <p className="text-xs leading-5 text-black/48">
              Removing the active Lookbook permanently deletes the stored PDF and shows the public empty state.
            </p>
            <Button className="mt-3" onClick={() => setShowRemoveDialog(true)} variant="destructive">
              <Trash2 aria-hidden="true" size={15} /> Remove Lookbook
            </Button>
          </div>
        ) : null}

        <ConfirmDialog
          confirmLabel="Remove Lookbook"
          description={`This permanently deletes ${currentLookbook?.fileName ?? "the active PDF"} from storage. It cannot be recovered.`}
          error={result.status === "error" ? result.message : null}
          isPending={isRemoving}
          onCancel={() => {
            if (!isRemoving) setShowRemoveDialog(false);
          }}
          onConfirm={removeLookbook}
          open={showRemoveDialog}
          title="Remove Lookbook?"
        />
      </aside>
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

function buildLookbookPathname(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `lookbook/${safeName || "lookbook.pdf"}`;
}

function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com")
    );
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
