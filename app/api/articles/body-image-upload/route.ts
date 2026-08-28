import { createArticleBlobUploadResponse } from "@/features/articles/server/article-blob-upload";
import {
  ALLOWED_ARTICLE_IMAGE_TYPES,
  MAX_ARTICLE_IMAGE_SIZE_BYTES,
} from "@/features/articles/validation/article-validation";

export const dynamic = "force-dynamic";

// Inline images placed inside the Article Body editor. Covers use their own
// route because they accept a wider set of formats and a larger ceiling.
export async function POST(request: Request) {
  return createArticleBlobUploadResponse({
    request,
    allowedContentTypes: ALLOWED_ARTICLE_IMAGE_TYPES,
    maximumSizeInBytes: MAX_ARTICLE_IMAGE_SIZE_BYTES,
    failureMessage: "Image upload failed. Please try again.",
  });
}
