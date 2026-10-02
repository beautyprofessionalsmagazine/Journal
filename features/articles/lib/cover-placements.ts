import type { CSSProperties } from "react";

/**
 * The single source of truth for every cover placement. The crop editor's
 * frame, the server-generated file, and the frontend container all read their
 * shape from here, so one placement always means one visual shape.
 *
 * Ratios come from the real layouts that render each placement:
 * - homepageFeature: the homepage lead story (4:3 frame; fills the lead panel
 *   on desktop) and the dark editorial spotlight background.
 * - storyCard: every standard story card — article lists, category pages,
 *   related stories, and the homepage recent/latest/archive rails.
 * - portraitRail: compact rail cards and the admin article list.
 * - articleHero: the article page header, which sits beside a tall headline
 *   column on desktop and therefore reads as a portrait.
 */
export const COVER_PLACEMENTS = {
  homepageFeature: {
    label: "Homepage Feature",
    usage: "Homepage lead story",
    width: 1600,
    height: 1200,
  },
  storyCard: {
    label: "Story Card",
    usage: "Story cards, lists and related stories",
    width: 1200,
    height: 900,
  },
  portraitRail: {
    label: "Portrait Rail",
    usage: "Compact rails and admin lists",
    width: 800,
    height: 1000,
  },
  articleHero: {
    label: "Article Hero",
    usage: "Article page header",
    width: 1200,
    height: 1500,
  },
} as const satisfies Record<
  string,
  { label: string; usage: string; width: number; height: number }
>;

export type CoverImagePlacement = keyof typeof COVER_PLACEMENTS;

export type CoverPlacementDefinition = {
  id: CoverImagePlacement;
  label: string;
  usage: string;
  width: number;
  height: number;
  /** Always derived as width / height, never configured separately. */
  aspect: number;
};

/** Display order used by the crop editor. */
export const coverImagePlacementValues = [
  "homepageFeature",
  "storyCard",
  "portraitRail",
  "articleHero",
] as const satisfies readonly CoverImagePlacement[];

export const COVER_PLACEMENT_LIST: readonly CoverPlacementDefinition[] =
  coverImagePlacementValues.map((id) => getCoverPlacement(id));

export function getCoverPlacement(
  placement: CoverImagePlacement,
): CoverPlacementDefinition {
  const { label, usage, width, height } = COVER_PLACEMENTS[placement];
  return { id: placement, label, usage, width, height, aspect: width / height };
}

export function isCoverImagePlacement(value: unknown): value is CoverImagePlacement {
  return typeof value === "string" && Object.hasOwn(COVER_PLACEMENTS, value);
}

/**
 * Props for any element that frames a cover. The matching rule in
 * globals.css turns the variable into `aspect-ratio`, inside a cascade layer
 * so a layout that must fill a text-driven box can still opt out with
 * `lg:aspect-auto`.
 */
export function coverFrameProps(placement: CoverImagePlacement) {
  const { width, height } = COVER_PLACEMENTS[placement];

  return {
    "data-cover-placement": placement,
    style: { "--cover-aspect": `${width} / ${height}` } as CSSProperties,
  };
}

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Relative tolerance for comparing ratios after integer pixel rounding. */
export const ASPECT_TOLERANCE = 0.01;

export function aspectsMatch(left: number, right: number) {
  return Math.abs(left / right - 1) <= ASPECT_TOLERANCE;
}

/** Rejects NaN, negative origins, and zero/negative sizes. */
export function isPositiveArea(area: CropArea | null | undefined): area is CropArea {
  return (
    Boolean(area) &&
    [area!.x, area!.y, area!.width, area!.height].every(Number.isFinite) &&
    area!.x >= 0 &&
    area!.y >= 0 &&
    area!.width > 0 &&
    area!.height > 0
  );
}

/** A positive area that also lies inside the source, allowing 1px of rounding. */
export function isAreaWithinBounds(
  area: CropArea | null | undefined,
  sourceWidth: number,
  sourceHeight: number,
): area is CropArea {
  return (
    isPositiveArea(area) &&
    area.x + area.width <= sourceWidth + 1 &&
    area.y + area.height <= sourceHeight + 1
  );
}

/** The largest centered area of the given aspect, in source pixels. */
export function getCenteredCropArea(
  sourceWidth: number,
  sourceHeight: number,
  aspect: number,
): CropArea {
  return fitCropAreaToAspect(
    { x: 0, y: 0, width: sourceWidth, height: sourceHeight },
    aspect,
    sourceWidth,
    sourceHeight,
  );
}

/**
 * Snaps an area to an exact placement aspect: the largest rectangle of that
 * aspect inside the area, centered on it, rounded to whole pixels and clamped
 * to the source. Idempotent for an area it has already produced.
 */
export function fitCropAreaToAspect(
  area: CropArea,
  aspect: number,
  sourceWidth: number,
  sourceHeight: number,
): CropArea {
  const left = Math.max(0, Math.round(area.x));
  const top = Math.max(0, Math.round(area.y));
  const boundedWidth = Math.max(
    1,
    Math.min(sourceWidth - left, Math.round(area.width)),
  );
  const boundedHeight = Math.max(
    1,
    Math.min(sourceHeight - top, Math.round(area.height)),
  );

  let width: number;
  let height: number;
  if (boundedWidth / boundedHeight > aspect) {
    height = boundedHeight;
    width = Math.max(1, Math.min(boundedWidth, Math.round(height * aspect)));
  } else {
    width = boundedWidth;
    height = Math.max(1, Math.min(boundedHeight, Math.round(width / aspect)));
  }

  const centerX = left + boundedWidth / 2;
  const centerY = top + boundedHeight / 2;

  return {
    x: clamp(Math.round(centerX - width / 2), 0, sourceWidth - width),
    y: clamp(Math.round(centerY - height / 2), 0, sourceHeight - height),
    width,
    height,
  };
}

/** Converts react-easy-crop percentages into source pixels. */
export function percentAreaToPixels(
  area: CropArea,
  sourceWidth: number,
  sourceHeight: number,
): CropArea {
  return {
    x: (area.x / 100) * sourceWidth,
    y: (area.y / 100) * sourceHeight,
    width: (area.width / 100) * sourceWidth,
    height: (area.height / 100) * sourceHeight,
  };
}

/** Converts source pixels into react-easy-crop percentages. */
export function pixelAreaToPercent(
  area: CropArea,
  sourceWidth: number,
  sourceHeight: number,
): CropArea {
  return {
    x: roundTo((area.x / sourceWidth) * 100, 4),
    y: roundTo((area.y / sourceHeight) * 100, 4),
    width: roundTo((area.width / sourceWidth) * 100, 4),
    height: roundTo((area.height / sourceHeight) * 100, 4),
  };
}

/** Editor rotations are quarter turns only; anything else snaps to one. */
export function normalizeQuarterTurn(rotation: number) {
  if (!Number.isFinite(rotation)) return 0;
  const quarter = Math.round(rotation / 90) * 90;
  return ((quarter % 360) + 360) % 360;
}

/** Source dimensions after a quarter-turn rotation. */
export function getRotatedSize(width: number, height: number, rotation: number) {
  return normalizeQuarterTurn(rotation) % 180 === 0
    ? { width, height }
    : { width: height, height: width };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function roundTo(value: number, decimalPlaces: number) {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

/** "1200 × 1500 · 4:5" style label for editor captions. */
export function formatPlacementSize(placement: CoverImagePlacement) {
  const { width, height } = COVER_PLACEMENTS[placement];
  const divisor = greatestCommonDivisor(width, height);
  return `${width} × ${height} · ${width / divisor}:${height / divisor}`;
}

function greatestCommonDivisor(left: number, right: number): number {
  return right === 0 ? left : greatestCommonDivisor(right, left % right);
}
