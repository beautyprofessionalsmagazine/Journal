import { createHash } from "node:crypto";

import { put } from "@vercel/blob";

import {
  isGeneratedImageCurrent,
  normalizeCoverImageSettings,
  type CoverImageSettings,
  type GeneratedCoverImage,
} from "@/features/articles/lib/cover-image-settings";
import {
  COVER_PLACEMENT_LIST,
  type CoverImagePlacement,
} from "@/features/articles/lib/cover-placements";
import { renderCoverVariants } from "@/features/articles/server/cover-image-rendering";

const MAX_SOURCE_BYTES = 30 * 1024 * 1024;
/** Bump when rendering changes in a way that should replace existing files. */
const GENERATION_PIPELINE_VERSION = 4;

type GenerateCoverImageVariantsInput = {
  settings: CoverImageSettings;
  slug: string;
  sourceUrl: string;
};

/**
 * Produces the permanent placement files from the untouched original upload.
 * Browser canvas output is deliberately never accepted as a source of truth.
 *
 * The returned settings carry the exact crop each file was cut from, so the
 * stored crop, the generated file, and the editor all describe one area —
 * including placements the editor never opened, which get the centered crop.
 */
export async function generateCoverImageVariants({
  settings: rawSettings,
  slug,
  sourceUrl,
}: GenerateCoverImageVariantsInput): Promise<CoverImageSettings> {
  const settings = normalizeCoverImageSettings(rawSettings);

  if (
    settings.generationKey === createGenerationKey(sourceUrl, settings) &&
    COVER_PLACEMENT_LIST.every((placement) =>
      isGeneratedImageCurrent(placement.id, settings.generatedImages[placement.id]),
    )
  ) {
    return settings;
  }

  const sourceBuffer = await downloadSourceImage(sourceUrl);
  const variants = await renderCoverVariants(sourceBuffer, settings);
  const nextSettings: CoverImageSettings = {
    ...settings,
    crops: { ...settings.crops },
    generatedImages: {},
  };

  for (const placement of COVER_PLACEMENT_LIST) {
    nextSettings.crops[placement.id] = variants[placement.id].crop;
  }

  // Keyed on the crops actually used, so saving again without changes skips
  // generation, and new crops never overwrite files a live page still uses.
  const generationKey = createGenerationKey(sourceUrl, nextSettings);
  const uploads = await Promise.all(
    COVER_PLACEMENT_LIST.map(async (placement) => {
      const variant = variants[placement.id];
      const pathname = [
        "articles",
        "covers",
        "generated",
        sanitizePathSegment(slug),
        `${generationKey}-${placement.id}-${variant.width}x${variant.height}.webp`,
      ].join("/");
      const blob = await put(pathname, variant.data, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/webp",
      });

      return [
        placement.id,
        { url: blob.url, width: variant.width, height: variant.height },
      ] as const;
    }),
  );

  nextSettings.generatedImages = Object.fromEntries(uploads) as Record<
    CoverImagePlacement,
    GeneratedCoverImage
  >;
  nextSettings.generationKey = generationKey;
  return nextSettings;
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

export function createGenerationKey(
  sourceUrl: string,
  settings: CoverImageSettings,
) {
  const crops = COVER_PLACEMENT_LIST.map((placement) => {
    const crop = settings.crops[placement.id];
    return {
      placement: placement.id,
      size: [placement.width, placement.height],
      croppedArea: crop.croppedArea,
      croppedAreaPixels: crop.croppedAreaPixels,
      rotation: crop.rotation,
    };
  });

  return createHash("sha256")
    .update(
      JSON.stringify({ pipeline: GENERATION_PIPELINE_VERSION, sourceUrl, crops }),
    )
    .digest("hex")
    .slice(0, 20);
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
