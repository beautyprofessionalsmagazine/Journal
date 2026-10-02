import sharp, { type Sharp } from "sharp";

import {
  resolveCoverCrop,
  type CoverCropMetadata,
  type CoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import {
  COVER_PLACEMENT_LIST,
  type CoverImagePlacement,
} from "@/features/articles/lib/cover-placements";

const MAX_INPUT_PIXELS = 268_402_689;

type RawImage = {
  data: Buffer;
  info: { width: number; height: number; channels: 1 | 2 | 3 | 4 };
};

export type RenderedCoverVariant = {
  /** The crop that produced the file (see resolveCoverCrop). */
  crop: CoverCropMetadata;
  data: Buffer;
  width: number;
  height: number;
};

/**
 * Renders every placement from the untouched original. Pure: no network or
 * storage, so it can be verified directly against fixture images.
 *
 * Order matters and mirrors react-easy-crop: EXIF orientation first (the
 * browser shows the image upright, so its crop coordinates are upright), then
 * the editor's quarter-turn rotation, then extract in rotated-source pixels,
 * then a resize to the canonical placement size.
 */
export async function renderCoverVariants(
  source: Buffer,
  settings: CoverImageSettings,
): Promise<Record<CoverImagePlacement, RenderedCoverVariant>> {
  // Intermediate steps stay as raw pixels so a JPEG source is encoded once,
  // at the end, instead of losing quality at every step.
  const oriented = await toRaw(
    sharp(source, { animated: false, limitInputPixels: MAX_INPUT_PIXELS }).autoOrient(),
  );
  // Placements usually share a rotation. Cache the in-flight promise, not
  // just the finished buffer, so parallel placements never rotate twice.
  const rotatedImages = new Map<number, Promise<RawImage>>();

  function getRotatedImage(rotation: number) {
    let rotated = rotatedImages.get(rotation);
    if (!rotated) {
      rotated =
        rotation === 0
          ? Promise.resolve(oriented)
          : toRaw(fromRaw(oriented).rotate(rotation));
      rotatedImages.set(rotation, rotated);
    }
    return rotated;
  }

  const variants = await Promise.all(
    COVER_PLACEMENT_LIST.map(async (placement) => {
      const crop = resolveCoverCrop(
        settings.crops[placement.id],
        placement.id,
        oriented.info.width,
        oriented.info.height,
      );
      const rotated = await getRotatedImage(crop.rotation);
      const area = crop.croppedAreaPixels;

      // fit: "cover" rather than "fill": the extract is already the exact
      // aspect to the pixel, so cover only trims sub-pixel rounding instead
      // of ever stretching the photo.
      const { data, info } = await fromRaw(rotated)
        .extract({
          left: area.x,
          top: area.y,
          width: area.width,
          height: area.height,
        })
        .resize(placement.width, placement.height, { fit: "cover" })
        .webp({ effort: 4, quality: 88 })
        .toBuffer({ resolveWithObject: true });

      if (info.width !== placement.width || info.height !== placement.height) {
        throw new Error(
          `${placement.id} rendered at ${info.width}x${info.height}, expected ${placement.width}x${placement.height}.`,
        );
      }

      return [
        placement.id,
        { crop, data, width: info.width, height: info.height },
      ] as const;
    }),
  );

  return Object.fromEntries(variants) as Record<
    CoverImagePlacement,
    RenderedCoverVariant
  >;
}

async function toRaw(image: Sharp): Promise<RawImage> {
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  return {
    data,
    info: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  };
}

function fromRaw(image: RawImage) {
  return sharp(image.data, {
    limitInputPixels: MAX_INPUT_PIXELS,
    raw: image.info,
  });
}
