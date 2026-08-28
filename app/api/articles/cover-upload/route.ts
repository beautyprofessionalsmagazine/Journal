import { createArticleBlobUploadResponse } from "@/features/articles/server/article-blob-upload";
import {
  ALLOWED_COVER_IMAGE_TYPES,
  MAX_COVER_IMAGE_SIZE_BYTES,
} from "@/features/articles/validation/article-validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return createArticleBlobUploadResponse({
    request,
    allowedContentTypes: ALLOWED_COVER_IMAGE_TYPES,
    maximumSizeInBytes: MAX_COVER_IMAGE_SIZE_BYTES,
    failureMessage: "Cover image upload failed. Please try again.",
  });
}
