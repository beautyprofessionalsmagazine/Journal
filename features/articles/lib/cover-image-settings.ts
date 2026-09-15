import type { CSSProperties } from "react";

export type CoverImageSettings = {
  focalPoint: {
    x: number;
    y: number;
  };
  zoom: number;
  rotation: number;
};

export const defaultCoverImageSettings: CoverImageSettings = {
  focalPoint: { x: 50, y: 50 },
  zoom: 1,
  rotation: 0,
};

const MIN_FOCAL_POINT = 0;
const MAX_FOCAL_POINT = 100;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const MIN_ROTATION = -180;
const MAX_ROTATION = 180;

/** Keeps historical null/malformed settings safe with a centered fallback. */
export function normalizeCoverImageSettings(value: unknown): CoverImageSettings {
  const source = isRecord(value) ? value : {};
  const focalPoint = isRecord(source.focalPoint) ? source.focalPoint : {};

  return {
    focalPoint: {
      x: clampNumber(focalPoint.x, MIN_FOCAL_POINT, MAX_FOCAL_POINT, 50),
      y: clampNumber(focalPoint.y, MIN_FOCAL_POINT, MAX_FOCAL_POINT, 50),
    },
    zoom: clampNumber(source.zoom, MIN_ZOOM, MAX_ZOOM, 1),
    rotation: clampNumber(source.rotation, MIN_ROTATION, MAX_ROTATION, 0),
  };
}

export function getCoverImageStyle(
  settings: CoverImageSettings | null | undefined,
): CSSProperties {
  const normalized = normalizeCoverImageSettings(settings);
  const origin = `${normalized.focalPoint.x}% ${normalized.focalPoint.y}%`;

  return {
    objectPosition: origin,
    transform: `rotate(${normalized.rotation}deg) scale(${normalized.zoom})`,
    transformOrigin: origin,
  };
}

function clampNumber(value: unknown, minimum: number, maximum: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(maximum, Math.max(minimum, value)) * 100) / 100;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
