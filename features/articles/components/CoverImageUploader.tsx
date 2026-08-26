"use client";

import { upload } from "@vercel/blob/client";
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

import {
  buildCoverImagePathname,
  MAX_COVER_IMAGE_SIZE_BYTES,
  validateCoverImageFile,
} from "@/features/articles/validation/article-validation";
import { Button } from "@/shared/components/ui";

// Files above this size are re-encoded to WebP before upload to keep stored
// covers lean; smaller files upload untouched to preserve their quality.
const OPTIMIZE_ABOVE_SIZE = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 3840;
const INITIAL_WEBP_QUALITY = 0.9;
const MIN_WEBP_QUALITY = 0.5;
// Uploads larger than this stream to Blob in parallel parts with retries.
const MULTIPART_UPLOAD_THRESHOLD = 5 * 1024 * 1024;
const MAX_COVER_IMAGE_MB = Math.round(
  MAX_COVER_IMAGE_SIZE_BYTES / (1024 * 1024),
);

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

    const validationError = validateCoverImageFile(file);

    if (validationError) {
      setUploadError(validationError);
      setIsUploading(false);
      onUploadStateChange({ error: validationError, isUploading: false });
      return;
    }

    if (file.size > MAX_COVER_IMAGE_SIZE_BYTES) {
      const message = `This image is too large. Choose a file under ${MAX_COVER_IMAGE_MB} MB.`;
      setUploadError(message);
      setIsUploading(false);
      onUploadStateChange({ error: message, isUploading: false });
      return;
    }

    let fileToUpload = file;

    if (file.size > OPTIMIZE_ABOVE_SIZE) {
      setIsUploading(true);
      onUploadStateChange({ error: null, isUploading: true });

      try {
        fileToUpload = await compressCoverImage(file);
      } catch {
        // Optimizing is best effort: the direct-to-Blob upload can handle the
        // original, so fall back to it rather than blocking the upload.
        fileToUpload = file;
      }
    }

    selectedFileRef.current = fileToUpload;
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

    if (fileToUpload.type.startsWith("image/")) {
      const localPreviewUrl = URL.createObjectURL(fileToUpload);
      objectUrlRef.current = localPreviewUrl;
      setPreviewUrl(localPreviewUrl);
    } else {
      setPreviewUrl(null);
    }

    await uploadFile(fileToUpload);
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

    try {
      const blob = await upload(buildCoverImagePathname(slug, file), file, {
        access: "public",
        handleUploadUrl: "/api/articles/cover-upload",
        contentType: file.type || undefined,
        multipart: file.size > MULTIPART_UPLOAD_THRESHOLD,
        abortSignal: controller.signal,
      });

      if (!isSafeUploadedImageUrl(blob.url)) {
        throw new Error(
          "The upload returned an invalid image URL. Please try again.",
        );
      }

      await preloadImage(blob.url, controller.signal);

      if (uploadSequence !== uploadSequenceRef.current) {
        return;
      }

      revokeObjectUrl();
      setPreviewUrl(blob.url);
      onChange(blob.url);
      onUploadStateChange({
        error: null,
        isUploading: false,
      });
    } catch (caughtError) {
      if (controller.signal.aborted) {
        return;
      }

      let message =
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "Cover image upload failed. Please try again.";

      // The Blob SDK reports any non-OK token response (most often an expired
      // admin session) as a generic client-token error, so make it actionable.
      if (message.includes("client token")) {
        message =
          "We couldn't authorize this upload. Refresh the page, confirm you're still signed in, then try again.";
      }

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
          <Button
            className="aspect-[4/3] h-auto w-full flex-col gap-3 border-transparent px-6 normal-case tracking-normal hover:translate-y-0 hover:bg-white"
            onClick={openFilePicker}
            variant="text"
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
              JPG, PNG, WebP, AVIF, or GIF · up to {MAX_COVER_IMAGE_MB} MB, large
              images are optimized automatically
            </span>
          </Button>
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
          <Button
            aria-label={hasImage ? "Replace cover image" : "Choose cover image"}
            onClick={openFilePicker}
            title={hasImage ? "Replace image" : "Choose image"}
            variant="icon"
          >
            <Upload aria-hidden="true" size={17} strokeWidth={1.6} />
          </Button>
          {hasImage || isUploading || uploadError ? (
            <Button
              aria-label="Remove cover image"
              onClick={removeImage}
              title="Remove image"
              variant="destructive"
              size="icon"
            >
              <Trash2 aria-hidden="true" size={17} strokeWidth={1.6} />
            </Button>
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
              <Button
                className="mt-2 min-h-9"
                disabled={isUploading}
                isLoading={isUploading}
                loadingLabel="Retrying"
                onClick={retryUpload}
                size="sm"
                variant="destructive"
              >
                <RefreshCw
                  aria-hidden="true"
                  size={14}
                />
                Retry upload
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function compressCoverImage(file: File) {
  const image = await loadLocalImage(file);
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const largestDimension = Math.max(width, height);

  if (largestDimension > MAX_IMAGE_DIMENSION) {
    const scale = MAX_IMAGE_DIMENSION / largestDimension;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = INITIAL_WEBP_QUALITY;
  let compressed = await canvasToFile(canvas, quality, file.name);

  while (compressed.size > OPTIMIZE_ABOVE_SIZE && quality > MIN_WEBP_QUALITY) {
    quality = Math.max(MIN_WEBP_QUALITY, quality - 0.1);
    compressed = await canvasToFile(canvas, quality, file.name);
  }

  return compressed;
}

function loadLocalImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded."));
    };
    image.src = objectUrl;
  });
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  quality: number,
  fileName: string,
) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Image compression failed."));
        return;
      }

      const name = `${fileName.replace(/\.[^.]+$/, "")}.webp`;
      resolve(new File([blob], name, { type: "image/webp" }));
    }, "image/webp", quality);
  });
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
