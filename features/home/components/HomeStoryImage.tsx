"use client";

import Image from "next/image";
import { useState } from "react";

import {
  getCoverImageSource,
  type CoverImageData,
  type CoverImagePlacement,
} from "@/features/articles/lib/cover-image-settings";

type HomeStoryImageProps = {
  alt: string;
  category: string;
  priority?: boolean;
  placement: CoverImagePlacement;
  sizes: string;
  coverImage: CoverImageData | null;
};

/** Keeps a failed or missing editorial image from exposing browser error chrome. */
export function HomeStoryImage({
  alt,
  category,
  priority = false,
  placement,
  sizes,
  coverImage,
}: HomeStoryImageProps) {
  const [failed, setFailed] = useState(false);

  const imageSource = getCoverImageSource(coverImage, placement);

  if (!imageSource || failed) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-[#eceae4] [font-family:var(--font-editorial-title)] text-[clamp(4rem,12vw,9rem)] font-bold text-black/12">
        {category.charAt(0)}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className="story-image object-cover"
      fill
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={imageSource}
    />
  );
}
