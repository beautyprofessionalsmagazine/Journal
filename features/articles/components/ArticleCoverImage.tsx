"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";

import {
  normalizeCoverImageSettings,
  type CoverImageData,
} from "@/features/articles/lib/cover-image-settings";
import { CoverCropImage } from "@/features/articles/components/CoverCropImage";
import type { CoverImagePlacement } from "@/features/articles/lib/cover-placements";
import { cn } from "@/shared/lib/cn";

type ArticleCoverImageProps = {
  alt: string;
  className?: string;
  coverImage: CoverImageData | null;
  fallback: ReactNode;
  placement: CoverImagePlacement;
  priority?: boolean;
  sizes: string;
};

/** Renders a derivative or the same resolved crop directly from the original. */
export function ArticleCoverImage({
  alt,
  className,
  coverImage,
  fallback,
  placement,
  priority = false,
  sizes,
}: ArticleCoverImageProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const settings = normalizeCoverImageSettings(coverImage?.settings);
  const generated = settings.generatedImages[placement]?.url;
  const source = generated && !failedSources.includes(generated) ? generated : coverImage?.src;

  if (!source || failedSources.includes(source) || !coverImage) return fallback;

  if (source === coverImage.src) {
    return (
      <div className={cn("absolute inset-0", className)}>
        <CoverCropImage
          alt={alt}
          crop={settings.crops[placement]}
          imageUrl={source}
          onError={() => setFailedSources((current) => [...current, source])}
          placement={placement}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={cn("object-cover object-center", className)}
      // The LCP image: besides the preload `priority` adds, tell the browser
      // to fetch it ahead of the sponsor strip and other early images.
      fetchPriority={priority ? "high" : undefined}
      fill
      onError={() => setFailedSources((current) => [...current, source])}
      priority={priority}
      sizes={sizes}
      src={source}
    />
  );
}
