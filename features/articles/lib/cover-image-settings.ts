import {
  COVER_PLACEMENTS,
  coverImagePlacementValues,
  fitCropAreaToAspect,
  getCenteredCropArea,
  getCoverPlacement,
  getRotatedSize,
  isAreaWithinBounds,
  isPositiveArea,
  normalizeQuarterTurn,
  percentAreaToPixels,
  pixelAreaToPercent,
  type CoverImagePlacement,
  type CropArea,
} from "@/features/articles/lib/cover-placements";

export {
  coverImagePlacementValues,
  type CoverImagePlacement,
  type CropArea,
} from "@/features/articles/lib/cover-placements";

/**
 * User-controlled crop state for one placement. The placement — never the
 * crop — defines the aspect and output size, so neither is stored here.
 * Older records may still carry an `aspect` key; normalization drops it.
 */
export type CoverCropMetadata = {
  /** Controlled react-easy-crop position, in pixels of the editor stage. */
  x: number;
  y: number;
  zoom: number;
  /** Quarter turns only: 0, 90, 180, or 270. */
  rotation: number;
  /** Percentages of the rotated source. Restores the editor exactly. */
  croppedArea: CropArea;
  /**
   * Pixels of the rotated source used by Sharp. A zero-sized area means the
   * placement has never been framed and falls back to a centered crop.
   */
  croppedAreaPixels: CropArea;
};

export type GeneratedCoverImage = {
  url: string;
  width: number;
  height: number;
};

export type CoverImageSettings = {
  version: 4;
  /** Every placement always owns its crop. There is no shared crop state. */
  crops: Record<CoverImagePlacement, CoverCropMetadata>;
  /** Server-rendered derivatives. The original coverImage remains untouched. */
  generatedImages: Partial<Record<CoverImagePlacement, GeneratedCoverImage>>;
  /** Hash of source + effective crops used to avoid needless regeneration. */
  generationKey?: string;
};

/** JSON value stored in the single articles.cover_image column. */
export type CoverImageData = {
  src: string;
  alt: string;
  settings: CoverImageSettings;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const EMPTY_AREA: CropArea = { x: 0, y: 0, width: 0, height: 0 };
const FULL_PERCENT_AREA: CropArea = { x: 0, y: 0, width: 100, height: 100 };

export function createDefaultCrop(rotation = 0): CoverCropMetadata {
  return {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: normalizeQuarterTurn(rotation),
    croppedArea: { ...FULL_PERCENT_AREA },
    croppedAreaPixels: { ...EMPTY_AREA },
  };
}

export function createDefaultCoverImageSettings(): CoverImageSettings {
  return {
    version: 4,
    crops: Object.fromEntries(
      coverImagePlacementValues.map((placement) => [
        placement,
        createDefaultCrop(),
      ]),
    ) as Record<CoverImagePlacement, CoverCropMetadata>,
    generatedImages: {},
  };
}

export const defaultCoverImageSettings = createDefaultCoverImageSettings();

/**
 * Whether the editor or server has framed this placement. Records written
 * before this check persisted `{ width: 0, height: 0 }` for any placement the
 * editor never opened; those must read as "not framed", never as a crop.
 */
export function hasSavedCrop(crop: CoverCropMetadata) {
  return (
    isPositiveArea(crop.croppedAreaPixels) &&
    isPositiveArea(crop.croppedArea) &&
    crop.croppedArea.x + crop.croppedArea.width <= 100.01 &&
    crop.croppedArea.y + crop.croppedArea.height <= 100.01
  );
}

/** Whether a stored derivative was rendered at this placement's current size. */
export function isGeneratedImageCurrent(
  placement: CoverImagePlacement,
  image: GeneratedCoverImage | undefined,
): image is GeneratedCoverImage {
  const { width, height } = COVER_PLACEMENTS[placement];
  return Boolean(image?.url) && image!.width === width && image!.height === height;
}

export function createCoverImageData(
  src: string,
  alt: string,
  settings: unknown,
): CoverImageData {
  return {
    src,
    alt,
    settings: normalizeCoverImageSettings(settings),
  };
}

export function normalizeCoverImageData(value: unknown): CoverImageData | null {
  if (typeof value === "string" && value.trim()) {
    return createCoverImageData(value.trim(), "", null);
  }

  if (!isRecord(value) || typeof value.src !== "string" || !value.src.trim()) {
    return null;
  }

  return createCoverImageData(
    value.src.trim(),
    typeof value.alt === "string" ? value.alt : "",
    value.settings,
  );
}

/**
 * Accepts every historical shape — null, v1, v2 shared/custom crops, v3 with
 * a persisted `aspect`, empty `{}` crops, zero-sized pixel areas — and returns
 * a v4 record. User crop data is kept as-is; only unusable values are
 * replaced, and stale derivatives are dropped so the frontend never shows a
 * file whose shape no longer matches its placement.
 */
export function normalizeCoverImageSettings(value: unknown): CoverImageSettings {
  const defaults = createDefaultCoverImageSettings();
  if (!isRecord(value)) return defaults;

  const crops = isRecord(value.crops) ? value.crops : {};
  // Migrate v2 shared/custom records without carrying the shared concept
  // forward. A customized crop wins; otherwise the former shared crop does.
  const sharedCrops = isRecord(value.sharedCrops) ? value.sharedCrops : {};
  const customCrops = isRecord(value.customCrops) ? value.customCrops : {};
  const generatedImages = isRecord(value.generatedImages) ? value.generatedImages : {};

  if (typeof value.generationKey === "string" && value.generationKey.length > 0) {
    defaults.generationKey = value.generationKey;
  }

  for (const placement of coverImagePlacementValues) {
    const legacyCrop = isRecord(customCrops[placement])
      ? customCrops[placement]
      : sharedCrops[placement];
    defaults.crops[placement] = normalizeCropMetadata(
      crops[placement] ?? legacyCrop,
    );

    const generated = normalizeGeneratedImage(generatedImages[placement]);
    if (isGeneratedImageCurrent(placement, generated)) {
      defaults.generatedImages[placement] = generated;
    }
  }

  return defaults;
}

export function getCoverCrop(
  settings: CoverImageSettings,
  placement: CoverImagePlacement,
) {
  return settings.crops[placement];
}

/**
 * The URL to render for a placement: its generated derivative when that file
 * was produced at the placement's canonical size, otherwise the original
 * upload (which a placement frame then centers, matching the default crop).
 */
export function getCoverImageSource(
  coverImage: CoverImageData | null | undefined,
  placement: CoverImagePlacement,
) {
  if (!coverImage?.src) return null;
  const settings = normalizeCoverImageSettings(coverImage.settings);
  return settings.generatedImages[placement]?.url ?? coverImage.src;
}

/**
 * Picks the source-pixel area a saved crop refers to: the stored pixels when
 * they fit the source, else the stored percentages (resolution independent),
 * else nothing. Callers snap the result to the placement aspect.
 */
export function getSavedCropPixels(
  crop: CoverCropMetadata,
  sourceWidth: number,
  sourceHeight: number,
): CropArea | null {
  if (!hasSavedCrop(crop)) return null;

  if (isAreaWithinBounds(crop.croppedAreaPixels, sourceWidth, sourceHeight)) {
    return crop.croppedAreaPixels;
  }

  return percentAreaToPixels(crop.croppedArea, sourceWidth, sourceHeight);
}

/**
 * The one rule, shared by the crop editor and the generator, for which area
 * of the source a placement shows: the saved crop when there is one (from its
 * pixels, else its percentages), otherwise the centered default — always
 * snapped to the placement aspect. A legacy crop saved for another ratio
 * (e.g. the former 3:2 article hero) keeps its center and is re-fitted, so
 * the editor and the generated file never disagree about it.
 *
 * `uprightWidth`/`uprightHeight` are the source size after EXIF orientation
 * and before the editor's own rotation — what both the browser and Sharp's
 * autoOrient() report.
 */
export function resolveCoverCrop(
  crop: CoverCropMetadata,
  placement: CoverImagePlacement,
  uprightWidth: number,
  uprightHeight: number,
): CoverCropMetadata {
  const { aspect } = getCoverPlacement(placement);
  const rotation = normalizeQuarterTurn(crop.rotation);
  const { width, height } = getRotatedSize(uprightWidth, uprightHeight, rotation);
  const area = fitCropAreaToAspect(
    getSavedCropPixels(crop, width, height) ??
      getCenteredCropArea(width, height, aspect),
    aspect,
    width,
    height,
  );

  return {
    ...crop,
    rotation,
    croppedArea: pixelAreaToPercent(area, width, height),
    croppedAreaPixels: area,
  };
}

function normalizeCropMetadata(value: unknown): CoverCropMetadata {
  const source = isRecord(value) ? value : {};

  return {
    x: clampNumber(source.x, -10000, 10000, 0),
    y: clampNumber(source.y, -10000, 10000, 0),
    zoom: clampNumber(source.zoom, MIN_ZOOM, MAX_ZOOM, 1),
    // Safari trackpad gestures used to leak free-angle rotations (e.g. 3.7°)
    // into storage; the generator only ever honoured quarter turns.
    rotation: normalizeQuarterTurn(clampNumber(source.rotation, -360, 360, 0)),
    croppedArea: normalizeArea(source.croppedArea, false),
    croppedAreaPixels: normalizeArea(source.croppedAreaPixels, true),
  };
}

function normalizeArea(value: unknown, pixels: boolean): CropArea {
  const source = isRecord(value) ? value : {};
  const maximum = pixels ? 100000 : 100;

  const area = {
    x: clampNumber(source.x, 0, maximum, 0),
    y: clampNumber(source.y, 0, maximum, 0),
    width: clampNumber(source.width, 0, maximum, pixels ? 0 : 100),
    height: clampNumber(source.height, 0, maximum, pixels ? 0 : 100),
  };

  if (isPositiveArea(area)) return area;
  return pixels ? { ...EMPTY_AREA } : { ...FULL_PERCENT_AREA };
}

function normalizeGeneratedImage(value: unknown): GeneratedCoverImage | undefined {
  if (!isRecord(value) || typeof value.url !== "string" || !value.url) {
    return undefined;
  }

  return {
    url: value.url,
    width: typeof value.width === "number" ? value.width : 0,
    height: typeof value.height === "number" ? value.height : 0,
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
