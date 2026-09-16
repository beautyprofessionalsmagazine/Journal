import { createHash } from "node:crypto";

import { put } from "@vercel/blob";
import sharp from "sharp";

import {
  COVER_IMAGE_PLACEMENTS,
  getCoverCrop,
  normalizeCoverImageSettings,
  type CoverCropMetadata,
  type CoverImageSettings,
  type CropArea,
} from "@/features/articles/lib/cover-image-settings";

const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

type GenerateCoverImageVariantsInput = {
  settings: CoverImageSettings;
  slug: string;
  sourceUrl: string;
};

/**
 * Produces the permanent placement files from the untouched original upload.
 * Browser canvas output is deliberately never accepted as a source of truth.
 */
export async function generateCoverImageVariants({
  settings: rawSettings,
  slug,
  sourceUrl,
}: GenerateCoverImageVariantsInput): Promise<CoverImageSettings> {
  const settings = normalizeCoverImageSettings(rawSettings);
  const generationKey = createGenerationKey(sourceUrl, settings);

  if (
    settings.generationKey === generationKey &&
    COVER_IMAGE_PLACEMENTS.every(
      (placement) => settings.generatedImages[placement.id]?.url,
    )
  ) {
    return settings;
  }

  const sourceBuffer = await downloadSourceImage(sourceUrl);
  // autoOrient applies EXIF orientation before any editor rotation or extract.
  const oriented = await sharp(sourceBuffer, {
    animated: false,
    limitInputPixels: 268_402_689,
  })
    .autoOrient()
    .toBuffer();
  const rotatedImages = new Map<
    number,
    { data: Buffer; height: number; width: number }
  >();

  const generatedImages = await Promise.all(
    COVER_IMAGE_PLACEMENTS.map(async (placement) => {
      const crop = getCoverCrop(settings, placement.id);
      const rotation = normalizeRotation(crop.rotation);
      let rotated = rotatedImages.get(rotation);

      if (!rotated) {
        const result = await sharp(oriented)
          .rotate(rotation)
          .toBuffer({ resolveWithObject: true });
        rotated = {
          data: result.data,
          width: result.info.width,
          height: result.info.height,
        };
        rotatedImages.set(rotation, rotated);
      }

      const extract = resolveExtractArea(
        crop,
        rotated.width,
        rotated.height,
        placement.aspect,
      );
      const output = await sharp(rotated.data)
        .extract(extract)
        .resize(placement.width, placement.height, {
          fit: "fill",
        })
        .webp({ effort: 4, quality: 88 })
        .toBuffer();
      const pathname = [
        "articles",
        "covers",
        "generated",
        sanitizePathSegment(slug),
        `${generationKey}-${placement.id}-${placement.width}x${placement.height}.webp`,
      ].join("/");
      const blob = await put(pathname, output, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/webp",
      });

      return [
        placement.id,
        {
          url: blob.url,
          width: placement.width,
          height: placement.height,
        },
      ] as const;
    }),
  );

  return {
    ...settings,
    generatedImages: Object.fromEntries(generatedImages),
    generationKey,
  };
}

async function downloadSourceImage(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    cache: "no-store",
    headers: { Accept: "image/avif,image/webp,image/jpeg,image/png,image/gif" },
  });

  if (!response.ok) {
    throw new Error(`Cover source returned ${response.status}.`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
    throw new Error("Cover source exceeds the server generation limit.");
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error("Cover source is not an image.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_SOURCE_BYTES) {
    throw new Error("Cover source is empty or too large.");
  }

  return buffer;
}

function createGenerationKey(sourceUrl: string, settings: CoverImageSettings) {
  const crops = COVER_IMAGE_PLACEMENTS.map((placement) => {
    const crop = getCoverCrop(settings, placement.id);
    return {
      placement: placement.id,
      croppedAreaPixels: crop.croppedAreaPixels,
      rotation: crop.rotation,
      zoom: crop.zoom,
      aspect: crop.aspect,
    };
  });

  return createHash("sha256")
    .update(JSON.stringify({ sourceUrl, crops }))
    .digest("hex")
    .slice(0, 20);
}

function resolveExtractArea(
  crop: CoverCropMetadata,
  sourceWidth: number,
  sourceHeight: number,
  aspect: number,
) {
  const pixels = crop.croppedAreaPixels;
  if (pixels.width >= 1 && pixels.height >= 1) {
    return clampExtractArea(pixels, sourceWidth, sourceHeight);
  }

  return createCenteredExtract(sourceWidth, sourceHeight, aspect);
}

function clampExtractArea(
  area: CropArea,
  sourceWidth: number,
  sourceHeight: number,
) {
  const left = Math.max(0, Math.min(sourceWidth - 1, Math.round(area.x)));
  const top = Math.max(0, Math.min(sourceHeight - 1, Math.round(area.y)));
  const width = Math.max(
    1,
    Math.min(sourceWidth - left, Math.round(area.width)),
  );
  const height = Math.max(
    1,
    Math.min(sourceHeight - top, Math.round(area.height)),
  );

  return { left, top, width, height };
}

function createCenteredExtract(
  sourceWidth: number,
  sourceHeight: number,
  aspect: number,
) {
  const sourceAspect = sourceWidth / sourceHeight;
  const width = Math.round(
    sourceAspect > aspect ? sourceHeight * aspect : sourceWidth,
  );
  const height = Math.round(
    sourceAspect > aspect ? sourceHeight : sourceWidth / aspect,
  );

  return {
    left: Math.max(0, Math.round((sourceWidth - width) / 2)),
    top: Math.max(0, Math.round((sourceHeight - height) / 2)),
    width: Math.max(1, Math.min(sourceWidth, width)),
    height: Math.max(1, Math.min(sourceHeight, height)),
  };
}

function normalizeRotation(rotation: number) {
  const normalized = Math.round(rotation / 90) * 90;
  return ((normalized % 360) + 360) % 360;
}

function sanitizePathSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "article"
  );
}
