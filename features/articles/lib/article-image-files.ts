/*
 * Browser-side image helpers shared by the cover uploader and the inline
 * article-body uploader. Both go through the same pipeline — optimise oversized
 * files, upload to Vercel Blob, then verify the returned URL actually loads —
 * so the pieces live here instead of being duplicated per uploader.
 */

const INITIAL_WEBP_QUALITY = 0.9;
const MIN_WEBP_QUALITY = 0.5;

export type CompressImageOptions = {
  /** Longest edge kept after downscaling. */
  maxDimension: number;
  /** Quality is stepped down until the result fits under this size. */
  targetSizeBytes: number;
};

/** Re-encodes an oversized image to WebP so stored assets stay lean. */
export async function compressImageToWebp(
  file: File,
  { maxDimension, targetSizeBytes }: CompressImageOptions,
) {
  const image = await loadImageFromFile(file);
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const largestDimension = Math.max(width, height);

  if (largestDimension > maxDimension) {
    const scale = maxDimension / largestDimension;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = INITIAL_WEBP_QUALITY;
  let compressed = await canvasToWebpFile(canvas, quality, file.name);

  while (compressed.size > targetSizeBytes && quality > MIN_WEBP_QUALITY) {
    quality = Math.max(MIN_WEBP_QUALITY, quality - 0.1);
    compressed = await canvasToWebpFile(canvas, quality, file.name);
  }

  return compressed;
}

export function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded."));
    };
    image.src = objectUrl;
  });
}

/**
 * Confirms an uploaded URL renders before it is committed, and hands back the
 * loaded element so callers can read the image's natural dimensions.
 */
export function loadUploadedImage(url: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    function cleanUp() {
      signal.removeEventListener("abort", handleAbort);
      image.onload = null;
      image.onerror = null;
    }

    function handleAbort() {
      cleanUp();
      reject(new Error("Upload cancelled."));
    }

    image.onload = () => {
      cleanUp();
      resolve(image);
    };
    image.onerror = () => {
      cleanUp();
      reject(
        new Error(
          "The uploaded image could not be verified. Please try again.",
        ),
      );
    };
    signal.addEventListener("abort", handleAbort, { once: true });
    image.src = url;
  });
}

export function isSafeUploadedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * The Blob SDK reports any non-OK token response (most often an expired admin
 * session) as a generic client-token error, so make it actionable.
 */
export function toUploadErrorMessage(error: unknown, fallback: string) {
  const message =
    error instanceof Error && error.message ? error.message : fallback;

  if (message.includes("client token")) {
    return "We couldn't authorize this upload. Refresh the page, confirm you're still signed in, then try again.";
  }

  return message;
}

function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  quality: number,
  fileName: string,
) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed."));
          return;
        }

        const name = `${fileName.replace(/.[^.]+$/, "")}.webp`;
        resolve(new File([blob], name, { type: "image/webp" }));
      },
      "image/webp",
      quality,
    );
  });
}
