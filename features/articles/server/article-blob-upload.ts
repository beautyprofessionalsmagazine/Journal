import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { hasAdminSession } from "@/features/admin/server/admin-auth";

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
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json(
      { message: "Invalid upload request." },
      { status: 400 },
    );
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        // Only signed-in admins may mint an upload token. The upload-completed
        // callback skips this hook and is verified by Vercel's signature.
        if (!(await hasAdminSession())) {
          throw new Error("Authentication required.");
        }

        return {
          addRandomSuffix: true,
          allowedContentTypes: [...allowedContentTypes],
          maximumSizeInBytes,
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : failureMessage;

    return Response.json({ message }, { status: 400 });
  }
}
