import { put } from "@vercel/blob";

import {
  ALLOWED_COVER_IMAGE_TYPES,
  MAX_COVER_IMAGE_SIZE,
  normalizeSlug,
} from "@/features/articles/validation/article-validation";

export class ArticleUploadError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "ArticleUploadError";
  }
}

type UploadArticleCoverImageInput = {
  file: File;
  slug?: string | null;
};

export async function uploadArticleCoverImage({
  file,
  slug,
}: UploadArticleCoverImageInput) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    throw new ArticleUploadError(
      "BLOB_READ_WRITE_TOKEN is missing. Add it before uploading cover images.",
      500,
    );
  }

  validateCoverImage(file);

  const baseName =
    normalizeSlug(slug ?? getFileBaseName(file.name)) ||
    `article-cover-${Date.now()}`;
  const extension = getSafeExtension(file.name, file.type);
  const fileName = `articles/${baseName}-${Date.now()}.${extension}`;

  try {
    const uploadedFile = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: blobToken,
    });

    return {
      fileName: file.name,
      url: uploadedFile.url,
    };
  } catch {
    throw new ArticleUploadError(
      "Cover image upload failed. Please try again.",
      500,
    );
  }
}

export async function uploadArticleCoverImageFromFormData(formData: FormData) {
  const file = formData.get("file");
  const slug = formData.get("slug");

  if (!(file instanceof File) || file.size === 0) {
    throw new ArticleUploadError("Select an image file to upload.");
  }

  return uploadArticleCoverImage({
    file,
    slug: typeof slug === "string" ? slug : null,
  });
}

function validateCoverImage(file: File) {
  if (!ALLOWED_COVER_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_COVER_IMAGE_TYPES)[number])) {
    throw new ArticleUploadError(
      "Cover image must be a JPG, PNG, WebP, AVIF, or GIF file.",
    );
  }

  if (file.size > MAX_COVER_IMAGE_SIZE) {
    throw new ArticleUploadError("Cover image must be 5 MB or smaller.");
  }
}

function getFileBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function getSafeExtension(fileName: string, mimeType: string) {
  const extensionFromName = fileName
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (extensionFromName) {
    return extensionFromName;
  }

  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}
