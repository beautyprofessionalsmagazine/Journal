import { upload } from "@vercel/blob/client";

import {
  compressImageToWebp,
  isSafeUploadedImageUrl,
  loadUploadedImage,
} from "@/features/articles/lib/article-image-files";
import {
  buildArticleImagePathname,
  validateArticleImageFile,
} from "@/features/articles/validation/article-validation";

// Body images never need to exceed a retina rendering of the article column, so
// anything heavier is re-encoded before it leaves the browser.
const OPTIMIZE_ABOVE_SIZE = 4 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2560;
// Uploads larger than this stream to Blob in parallel parts with retries.
const MULTIPART_UPLOAD_THRESHOLD = 5 * 1024 * 1024;

export type ArticleImageUploadResult = {
  src: string;
  /** Natural dimensions, used to reserve space and avoid layout shift. */
  width: number | null;
  height: number | null;
};

type UploadArticleBodyImageOptions = {
  file: File;
  slug: string;
  signal: AbortSignal;
};

/*
 * The single upload path for inline article images, shared by the toolbar
 * button, drag-and-drop, and paste. Files go straight from the browser to
 * Vercel Blob through the same client-token flow the cover uploader uses; only
 * the returned URL and its dimensions ever reach contentJson.
 */
export async function uploadArticleBodyImage({
  file,
  slug,
  signal,
}: UploadArticleBodyImageOptions): Promise<ArticleImageUploadResult> {
  const validationError = validateArticleImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  let fileToUpload = file;

  if (file.size > OPTIMIZE_ABOVE_SIZE) {
    try {
      fileToUpload = await compressImageToWebp(file, {
        maxDimension: MAX_IMAGE_DIMENSION,
        targetSizeBytes: OPTIMIZE_ABOVE_SIZE,
      });
    } catch {
      // Optimising is best effort: the direct-to-Blob upload can handle the
      // original, so fall back to it rather than blocking the upload.
      fileToUpload = file;
    }
  }

  const blob = await upload(
    buildArticleImagePathname(slug, fileToUpload),
    fileToUpload,
    {
      access: "public",
      handleUploadUrl: "/api/articles/body-image-upload",
      contentType: fileToUpload.type || undefined,
      multipart: fileToUpload.size > MULTIPART_UPLOAD_THRESHOLD,
      abortSignal: signal,
    },
  );

  if (!isSafeUploadedImageUrl(blob.url)) {
    throw new Error(
      "The upload returned an invalid image URL. Please try again.",
    );
  }

  const image = await loadUploadedImage(blob.url, signal);

  return {
    src: blob.url,
    width: image.naturalWidth || null,
    height: image.naturalHeight || null,
  };
}

/** Picks the image files out of a drop or paste payload. */
export function getSupportedImageFiles(fileList: FileList | null | undefined) {
  if (!fileList?.length) {
    return [];
  }

  return Array.from(fileList).filter((file) =>
    file.type.startsWith("image/"),
  );
}
