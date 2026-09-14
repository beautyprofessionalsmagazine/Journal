"use client";

import Image from "next/image";
import { useState } from "react";

type HomeStoryImageProps = {
  alt: string;
  category: string;
  priority?: boolean;
  sizes: string;
  src: string | null;
};

/** Keeps a failed or missing editorial image from exposing browser error chrome. */
export function HomeStoryImage({
  alt,
  category,
  priority = false,
  sizes,
  src,
}: HomeStoryImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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
      src={src}
    />
  );
}
