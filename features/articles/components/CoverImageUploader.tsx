"use client";

import {
  AlertCircle,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { validateCoverImageFile } from "@/features/articles/validation/article-validation";

export type CoverImageUploadState = {
  error: string | null;
  isUploading: boolean;
};

type CoverImageUploaderProps = {
  slug: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onUploadStateChange: (state: CoverImageUploadState) => void;
};

type UploadResponse = {
  fileName?: string;
  message?: string;
  url?: string;
};

export function CoverImageUploader({
  slug,
  value,
  error,
  onChange,
  onUploadStateChange,
}: CoverImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value || null,
  );
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const uploadSequenceRef = useRef(0);

  useEffect(() => {
    return () => {
      uploadControllerRef.current?.abort();
      revokeObjectUrl();
    };
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    selectedFileRef.current = file;
    setFileName(file.name);
    setUploadError(null);
    setCanRetry(false);
    onUploadStateChange({
      error: null,
      isUploading: false,
    });
    onChange("");

    uploadControllerRef.current?.abort();
    revokeObjectUrl();

    if (file.type.startsWith("image/")) {
      const localPreviewUrl = URL.createObjectURL(file);
      objectUrlRef.current = localPreviewUrl;
      setPreviewUrl(localPreviewUrl);
    } else {
      setPreviewUrl(null);
    }

    const validationError = validateCoverImageFile(file);

    if (validationError) {
      setUploadError(validationError);
      setIsUploading(false);
      onUploadStateChange({
        error: validationError,
        isUploading: false,
      });
      return;
    }

    await uploadFile(file);
  }

  async function uploadFile(file: File) {
    const uploadSequence = uploadSequenceRef.current + 1;
    uploadSequenceRef.current = uploadSequence;
    const controller = new AbortController();
    uploadControllerRef.current = controller;
    setUploadError(null);
    setCanRetry(false);
    setIsUploading(true);
    onUploadStateChange({
      error: null,
      isUploading: true,
    });
    onChange("");

    const formData = new FormData();
    formData.append("file", file);

    if (slug.trim()) {
      formData.append("slug", slug);
    }

    try {
      const response = await fetch("/api/articles/cover-upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as
        | UploadResponse
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.message ?? "Cover image upload failed. Please try again.",
        );
      }

      if (!isSafeUploadedImageUrl(payload.url)) {
        throw new Error(
          "The upload returned an invalid image URL. Please try again.",
        );
      }

      await preloadImage(payload.url, controller.signal);

      if (uploadSequence !== uploadSequenceRef.current) {
        return;
      }

      revokeObjectUrl();
      setPreviewUrl(payload.url);
      setFileName(payload.fileName ?? file.name);
      onChange(payload.url);
      onUploadStateChange({
        error: null,
        isUploading: false,
      });
    } catch (caughtError) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Cover image upload failed. Please try again.";

      setUploadError(message);
      setCanRetry(true);
      onChange("");
      onUploadStateChange({
        error: message,
        isUploading: false,
      });
    } finally {
      if (uploadSequence === uploadSequenceRef.current) {
        setIsUploading(false);
        uploadControllerRef.current = null;
      }
    }
  }

  function retryUpload() {
    const selectedFile = selectedFileRef.current;

    if (selectedFile) {
      void uploadFile(selectedFile);
    }
  }

  function removeImage() {
    uploadSequenceRef.current += 1;
    uploadControllerRef.current?.abort();
    uploadControllerRef.current = null;
    selectedFileRef.current = null;
    setIsUploading(false);
    setPreviewUrl(null);
    setFileName("");
    setUploadError(null);
    setCanRetry(false);
    revokeObjectUrl();
    onChange("");
    onUploadStateChange({
      error: null,
      isUploading: false,
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handlePreviewError() {
    if (previewUrl?.startsWith("blob:")) {
      return;
    }

    setPreviewUrl(null);
    setUploadError(
      "The uploaded image could not be loaded. Choose the image again.",
    );
    setCanRetry(Boolean(selectedFileRef.current));
    onChange("");
    onUploadStateChange({
      error: "The uploaded image could not be loaded. Choose the image again.",
      isUploading: false,
    });
  }

  function revokeObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  const helperMessage = uploadError ?? error;
  const displayPreviewUrl = previewUrl ?? (value || null);
  const hasImage = Boolean(displayPreviewUrl);

  return (
    <div className="min-w-0">
      <input
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        aria-describedby={helperMessage ? "cover-image-error" : undefined}
        aria-invalid={Boolean(helperMessage)}
        className="sr-only"
        id="coverImageUpload"
        onChange={handleFileChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />

      <div
        className={`relative overflow-hidden border bg-[#f3f3f0] transition ${
          helperMessage ? "border-red-700" : "border-black/15"
        }`}
      >
        {displayPreviewUrl ? (
          <div className="relative aspect-[4/3] w-full">
            <Image
              alt=""
              className="object-cover"
              fill
              onError={handlePreviewError}
              sizes="(min-width: 1280px) 304px, 100vw"
              src={displayPreviewUrl}
              unoptimized={displayPreviewUrl.startsWith("blob:")}
            />
            {isUploading ? (
              <div
                aria-live="polite"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/62 text-white"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={26}
                  strokeWidth={1.5}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.1em]">
                  Uploading
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 px-6 text-center outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
            onClick={openFilePicker}
            type="button"
          >
            {isUploading ? (
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin"
                size={28}
                strokeWidth={1.4}
              />
            ) : (
              <ImagePlus aria-hidden="true" size={30} strokeWidth={1.35} />
            )}
            <span className="text-sm font-semibold uppercase">
              {isUploading ? "Uploading image" : "Add cover image"}
            </span>
            <span className="max-w-52 text-xs font-normal normal-case leading-5 text-black/55">
              JPG, PNG, WebP, AVIF, or GIF · 5 MB max
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 pt-1">
          <p className="break-words text-xs font-semibold uppercase leading-5">
            {fileName || (hasImage ? "Cover image" : "No image selected")}
          </p>
          <p
            aria-live="polite"
            className="mt-0.5 text-xs leading-5 text-black/55"
          >
            {isUploading
              ? "Securing upload…"
              : hasImage
                ? "Ready to use"
                : "Landscape images work best"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            aria-label={hasImage ? "Replace cover image" : "Choose cover image"}
            className="inline-flex size-11 items-center justify-center border border-black/15 outline-none transition hover:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            onClick={openFilePicker}
            title={hasImage ? "Replace image" : "Choose image"}
            type="button"
          >
            <Upload aria-hidden="true" size={17} strokeWidth={1.6} />
          </button>
          {hasImage || isUploading || uploadError ? (
            <button
              aria-label="Remove cover image"
              className="inline-flex size-11 items-center justify-center border border-black/15 outline-none transition hover:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              onClick={removeImage}
              title="Remove image"
              type="button"
            >
              <Trash2 aria-hidden="true" size={17} strokeWidth={1.6} />
            </button>
          ) : null}
        </div>
      </div>

      {helperMessage ? (
        <div
          className="mt-3 flex items-start gap-2 border border-red-700/25 bg-red-50 p-3 text-xs leading-5 text-red-800"
          id="cover-image-error"
          role="alert"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={15}
          />
          <div className="min-w-0 flex-1">
            <p>{helperMessage}</p>
            {uploadError && canRetry ? (
              <button
                className="mt-2 inline-flex min-h-9 items-center gap-2 border border-red-800 px-3 text-[0.7rem] font-semibold uppercase transition hover:bg-red-800 hover:text-white"
                disabled={isUploading}
                onClick={retryUpload}
                type="button"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={isUploading ? "animate-spin" : undefined}
                  size={14}
                />
                Retry upload
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isSafeUploadedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function preloadImage(url: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const image = new window.Image();

    function cleanUp() {
      signal.removeEventListener("abort", handleAbort);
      image.onload = null;
      image.onerror = null;
    }

    function handleAbort() {
      cleanUp();
      reject(new Error("Upload cancelled."));
    }

    image.onload = () => {
      cleanUp();
      resolve();
    };
    image.onerror = () => {
      cleanUp();
      reject(
        new Error(
          "The uploaded image could not be verified. Please try again.",
        ),
      );
    };
    signal.addEventListener("abort", handleAbort, { once: true });
    image.src = url;
  });
}
