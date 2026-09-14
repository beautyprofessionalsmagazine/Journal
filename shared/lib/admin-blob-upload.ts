import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { hasAdminSession } from "@/features/admin/server/admin-auth";

type AdminBlobUploadOptions = {
  request: Request;
  allowedContentTypes: readonly string[];
  maximumSizeInBytes: number;
  failureMessage: string;
};

/** Mints a short-lived, admin-only direct-upload token for Vercel Blob. */
export async function createAdminBlobUploadResponse({
  request,
  allowedContentTypes,
  maximumSizeInBytes,
  failureMessage,
}: AdminBlobUploadOptions) {
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ message: "Invalid upload request." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
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
    const message = error instanceof Error ? error.message : failureMessage;

    return Response.json({ message }, { status: 400 });
  }
}
