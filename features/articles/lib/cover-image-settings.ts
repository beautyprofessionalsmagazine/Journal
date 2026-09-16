export const coverImagePlacementValues = [
  "homepageFeature",
  "storyCard",
  "portraitRail",
  "articleHero",
] as const;

export type CoverImagePlacement = (typeof coverImagePlacementValues)[number];

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CoverCropMetadata = {
  /** Controlled react-easy-crop position, in cropper pixels. */
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  /** Normalized percentage result emitted by react-easy-crop. */
  croppedArea: CropArea;
  /** Pixel result emitted by react-easy-crop and used by Sharp. */
  croppedAreaPixels: CropArea;
  aspect: number;
};

export type GeneratedCoverImage = {
  url: string;
  width: number;
  height: number;
};

export type CoverImageSettings = {
  version: 2;
  /** Aspect-specific results that share one editor adjustment. */
  sharedCrops: Record<CoverImagePlacement, CoverCropMetadata>;
  /** An entry exists only after an editor chooses Customize crop. */
  customCrops: Partial<Record<CoverImagePlacement, CoverCropMetadata>>;
  /** Server-rendered derivatives. The original coverImage remains untouched. */
  generatedImages: Partial<Record<CoverImagePlacement, GeneratedCoverImage>>;
  /** Hash of source + effective crops used to avoid needless regeneration. */
  generationKey?: string;
};

export type CoverImagePlacementDefinition = {
  id: CoverImagePlacement;
  label: string;
  aspect: number;
  width: number;
  height: number;
  previewClassName: string;
};

/**
 * Ratios sourced from FeaturedStory, standard/compact ArticleCard, and
 * ArticleHeroMedia rather than from guessed export presets.
 */
export const COVER_IMAGE_PLACEMENTS: readonly CoverImagePlacementDefinition[] = [
  {
    id: "homepageFeature",
    label: "Homepage Feature",
    aspect: 4 / 3,
    width: 1600,
    height: 1200,
    previewClassName: "aspect-[4/3]",
  },
  {
    id: "storyCard",
    label: "Story Card",
    aspect: 4 / 3,
    width: 1200,
    height: 900,
    previewClassName: "aspect-[4/3]",
  },
  {
    id: "portraitRail",
    label: "Portrait Rail",
    aspect: 4 / 5,
    width: 800,
    height: 1000,
    previewClassName: "aspect-[4/5]",
  },
  {
    id: "articleHero",
    label: "Article Hero",
    aspect: 3 / 2,
    width: 1800,
    height: 1200,
    previewClassName: "aspect-[3/2]",
  },
] as const;

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const MIN_ROTATION = -360;
const MAX_ROTATION = 360;

function createDefaultCrop(aspect: number): CoverCropMetadata {
  return {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0,
    croppedArea: { x: 0, y: 0, width: 100, height: 100 },
    croppedAreaPixels: { x: 0, y: 0, width: 0, height: 0 },
    aspect,
  };
}

export function createDefaultCoverImageSettings(): CoverImageSettings {
  return {
    version: 2,
    sharedCrops: Object.fromEntries(
      COVER_IMAGE_PLACEMENTS.map((placement) => [
        placement.id,
        createDefaultCrop(placement.aspect),
      ]),
    ) as Record<CoverImagePlacement, CoverCropMetadata>,
    customCrops: {},
    generatedImages: {},
  };
}

export const defaultCoverImageSettings = createDefaultCoverImageSettings();

/** Keeps historical null, v1, or malformed settings safe with a centered crop. */
export function normalizeCoverImageSettings(value: unknown): CoverImageSettings {
  const defaults = createDefaultCoverImageSettings();
  if (!isRecord(value) || value.version !== 2) return defaults;

  const sharedCrops = isRecord(value.sharedCrops) ? value.sharedCrops : {};
  const customCrops = isRecord(value.customCrops) ? value.customCrops : {};
  const generatedImages = isRecord(value.generatedImages)
    ? value.generatedImages
    : {};

  if (typeof value.generationKey === "string" && value.generationKey.length > 0) {
    defaults.generationKey = value.generationKey;
  }

  for (const placement of COVER_IMAGE_PLACEMENTS) {
    defaults.sharedCrops[placement.id] = normalizeCropMetadata(
      sharedCrops[placement.id],
      placement.aspect,
    );

    if (isRecord(customCrops[placement.id])) {
      defaults.customCrops[placement.id] = normalizeCropMetadata(
        customCrops[placement.id],
        placement.aspect,
      );
    }

    const generated = generatedImages[placement.id];
    if (
      isRecord(generated) &&
      typeof generated.url === "string" &&
      generated.url.length > 0
    ) {
      defaults.generatedImages[placement.id] = {
        url: generated.url,
        width: clampNumber(generated.width, 1, 10000, placement.width),
        height: clampNumber(generated.height, 1, 10000, placement.height),
      };
    }
  }

  return defaults;
}

export function getEffectiveCoverCrop(
  settings: CoverImageSettings,
  placement: CoverImagePlacement,
) {
  return settings.customCrops[placement] ?? settings.sharedCrops[placement];
}

export function getCoverImageSource(
  originalUrl: string | null | undefined,
  settings: CoverImageSettings | null | undefined,
  placement: CoverImagePlacement,
) {
  if (!originalUrl) return null;
  return normalizeCoverImageSettings(settings).generatedImages[placement]?.url ?? originalUrl;
}

function normalizeCropMetadata(
  value: unknown,
  aspect: number,
): CoverCropMetadata {
  const source = isRecord(value) ? value : {};

  return {
    x: clampNumber(source.x, -10000, 10000, 0),
    y: clampNumber(source.y, -10000, 10000, 0),
    zoom: clampNumber(source.zoom, MIN_ZOOM, MAX_ZOOM, 1),
    rotation: clampNumber(source.rotation, MIN_ROTATION, MAX_ROTATION, 0),
    croppedArea: normalizeArea(source.croppedArea, false),
    croppedAreaPixels: normalizeArea(source.croppedAreaPixels, true),
    aspect,
  };
}

function normalizeArea(value: unknown, pixels: boolean): CropArea {
  const source = isRecord(value) ? value : {};
  const maximum = pixels ? 100000 : 100;

  return {
    x: clampNumber(source.x, 0, maximum, 0),
    y: clampNumber(source.y, 0, maximum, 0),
    width: clampNumber(source.width, 0, maximum, pixels ? 0 : 100),
    height: clampNumber(source.height, 0, maximum, pixels ? 0 : 100),
  };
}

function clampNumber(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(maximum, Math.max(minimum, value)) * 10000) / 10000;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
