"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";

import {
  getCoverImageSource,
  type CoverImageData,
} from "@/features/articles/lib/cover-image-settings";
import type { CoverImagePlacement } from "@/features/articles/lib/cover-placements";
import { cn } from "@/shared/lib/cn";

type ArticleCoverImageProps = {
  alt: string;
  className?: string;
  coverImage: CoverImageData | null;
  /** Shown when the article has no cover or the file fails to load. */
  fallback: ReactNode;
  placement: CoverImagePlacement;
  priority?: boolean;
  sizes: string;
};

/**
 * Fills a placement frame (see coverFrameProps) with that placement's
 * generated file. The frame and the file share one aspect, so object-cover
 * never trims a generated crop; it only centers the original upload for
 * articles whose variants have not been generated yet.
 */
export function ArticleCoverImage({
  alt,
  className,
  coverImage,
  fallback,
  placement,
  priority = false,
  sizes,
}: ArticleCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const source = getCoverImageSource(coverImage, placement);

  if (!source || failed) return fallback;

  return (
    <Image
      alt={alt}
      className={cn("object-cover object-center", className)}
      fill
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={source}
    />
  );
}
