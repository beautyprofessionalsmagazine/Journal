"use client";

import { type CSSProperties, useCallback, useState } from "react";
import { resolveCoverCrop, type CoverCropMetadata } from "@/features/articles/lib/cover-image-settings";
import { getRotatedSize, type CoverImagePlacement } from "@/features/articles/lib/cover-placements";

type NaturalSize = { width: number; height: number };

/** The same source-pixel crop for editor previews and covers without derivatives. */
export function CoverCropImage({
  alt, crop, imageUrl, placement, naturalSize, priority = false, onError,
}: {
  alt: string;
  crop: CoverCropMetadata;
  imageUrl: string;
  placement: CoverImagePlacement;
  naturalSize?: NaturalSize;
  priority?: boolean;
  onError?: () => void;
}) {
  const [decoded, setDecoded] = useState<(NaturalSize & { url: string }) | null>(null);
  // Cached originals can finish before hydration attaches onLoad. Read them
  // at mount as well, otherwise a valid legacy cover stays invisible.
  const readSize = useCallback((image: HTMLImageElement | null) => {
    if (image?.naturalWidth && image.naturalHeight) {
      setDecoded({ url: imageUrl, width: image.naturalWidth, height: image.naturalHeight });
    }
  }, [imageUrl]);
  const size = naturalSize ?? (decoded?.url === imageUrl ? decoded : null);
  const resolved = size ? resolveCoverCrop(crop, placement, size.width, size.height) : null;
  const area = resolved?.croppedArea;
  const rotation = resolved?.rotation ?? 0;
  const rotated = size ? getRotatedSize(size.width, size.height, rotation) : null;
  const quarterTurned = rotation % 180 !== 0;
  const boxStyle: CSSProperties = area ? {
    position: "absolute",
    left: `${(-area.x / area.width) * 100}%`,
    top: `${(-area.y / area.height) * 100}%`,
    width: `${10000 / area.width}%`,
    height: `${10000 / area.height}%`,
  } : { position: "absolute", inset: 0, opacity: 0 };

  return (
    <div style={boxStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element -- original pixels are required to resolve legacy crops and quarter-turn rotation */}
      <img
        alt={alt}
        className="cover-cropper-preview-media"
        draggable={false}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        onError={onError}
        onLoad={(event) => readSize(event.currentTarget)}
        ref={readSize}
        src={imageUrl}
        style={{
          position: "absolute", left: "50%", top: "50%", maxWidth: "none",
          width: quarterTurned && rotated ? `${rotated.height / rotated.width * 100}%` : "100%",
          height: quarterTurned && rotated ? `${rotated.width / rotated.height * 100}%` : "100%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
}
