import { createAdminBlobUploadResponse } from "@/shared/lib/admin-blob-upload";

type ArticleBlobUploadOptions = {
  request: Request;
  /** Content types the minted token will accept, re-enforced by Vercel Blob. */
  allowedContentTypes: readonly string[];
  maximumSizeInBytes: number;
  failureMessage: string;
};

/*
 * Shared token minting for every admin image upload. The browser uploads
 * straight to Vercel Blob and only calls the route to obtain a short-lived,
 * scoped token, which keeps the file out of the serverless request body and
 * clear of Vercel's 4.5 MB function payload limit.
 *
 * Cover images and inline article-body images differ only in which content
 * types and size ceiling they allow, so they share this handler rather than
 * maintaining two upload systems.
 */
export async function createArticleBlobUploadResponse({
  request,
  allowedContentTypes,
  maximumSizeInBytes,
  failureMessage,
}: ArticleBlobUploadOptions) {
  return createAdminBlobUploadResponse({
    request,
    allowedContentTypes,
    maximumSizeInBytes,
    failureMessage,
  });
}
