"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

type CoverImageUploaderProps = {
  error?: string;
};

export function CoverImageUploader({ error }: CoverImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setPreviewUrl(null);
      setFileName("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function clearPreview() {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.value = "";

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setFileName("");
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        className="flex cursor-pointer flex-col gap-4 border border-dashed border-black/20 bg-black/[0.02] p-5 transition hover:border-black"
        htmlFor="coverImage"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center border border-black/15 bg-white">
            <ImagePlus aria-hidden="true" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="[font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black">
              {fileName || "Upload cover image"}
            </p>
            <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
              JPG, PNG, WebP, AVIF, or GIF. Max 5 MB.
            </p>
          </div>
        </div>
        {previewUrl ? (
          <div className="relative h-48 w-full overflow-hidden border border-black/10">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(min-width: 1280px) 360px, 100vw"
              src={previewUrl}
              unoptimized
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
        aria-invalid={Boolean(error)}
        className="sr-only"
        id="coverImage"
        name="coverImage"
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
      {error ? (
        <p className="[font-family:var(--font-editorial-body-sans)] text-xs italic text-black/62">
          {error}
        </p>
      ) : null}
    </div>
  );
}
