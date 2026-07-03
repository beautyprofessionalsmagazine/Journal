"use client";

import Image from "next/image";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

type CoverImageUploaderProps = {
  slug: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onUploadStateChange: (state: {
    error: string | null;
    isUploading: boolean;
  }) => void;
};

export function CoverImageUploader({
  slug,
  value,
  error,
  onChange,
  onUploadStateChange,
}: CoverImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onUploadStateChange({
      error: uploadError,
      isUploading,
    });
  }, [isUploading, onUploadStateChange, uploadError]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    clearError();

    if (!file) {
      clearPreview();
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setFileName(file.name);
    onChange("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    if (slug.trim()) {
      formData.append("slug", slug);
    }

    try {
      const response = await fetch("/api/articles/cover-upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            fileName?: string;
            message?: string;
            url?: string;
          }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.message ?? "Cover image upload failed. Please try again.",
        );
      }

      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(payload.url);
      setFileName(payload.fileName ?? file.name);
      onChange(payload.url);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Cover image upload failed. Please try again.";

      setUploadError(message);
      onChange("");
    } finally {
      setIsUploading(false);
    }
  }

  function clearPreview() {
    const input = inputRef.current;

    if (input) {
      input.value = "";
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setFileName("");
    clearError();
    onChange("");
    setIsUploading(false);
  }

  function clearError() {
    setUploadError(null);
  }

  const helperMessage = uploadError ?? error;
  const displayPreviewUrl = previewUrl ?? value ?? null;

  return (
    <div className="flex flex-col gap-3">
      <label
        className="flex cursor-pointer flex-col gap-4 border border-dashed border-black/20 bg-black/[0.02] p-5 transition hover:border-black"
        htmlFor="coverImageUpload"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center border border-black/15 bg-white">
            {isUploading ? (
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin"
                strokeWidth={1.5}
              />
            ) : (
              <ImagePlus aria-hidden="true" strokeWidth={1.5} />
            )}
          </span>
          <div className="min-w-0">
            <p className="[font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black">
              {fileName || "Upload cover image"}
            </p>
            <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
              {isUploading
                ? "Uploading image to Vercel Blob..."
                : "JPG, PNG, WebP, AVIF, or GIF. Max 5 MB."}
            </p>
          </div>
        </div>
        {displayPreviewUrl ? (
          <div className="relative h-48 w-full overflow-hidden border border-black/10">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(min-width: 1280px) 360px, 100vw"
              src={displayPreviewUrl}
              unoptimized={displayPreviewUrl.startsWith("blob:")}
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center border border-black/10 bg-white [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/50">
            No image selected
          </div>
        )}
      </label>
      <input
        accept="image/*"
        aria-invalid={Boolean(helperMessage)}
        className="sr-only"
        id="coverImageUpload"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
          Optional cover image stored in Vercel Blob.
        </span>
        <button
          className="inline-flex min-h-11 items-center gap-2 border border-black/15 px-4 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase transition hover:border-black"
          onClick={clearPreview}
          type="button"
        >
          <X aria-hidden="true" strokeWidth={1.5} />
          Clear
        </button>
      </div>
      {helperMessage ? (
        <p className="[font-family:var(--font-editorial-body-sans)] text-xs italic text-black/62">
          {helperMessage}
        </p>
      ) : null}
    </div>
  );
}
