import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import {
  ALLOWED_COVER_IMAGE_TYPES,
  MAX_COVER_IMAGE_SIZE_BYTES,
} from "@/features/articles/validation/article-validation";

export const dynamic = "force-dynamic";

// The browser uploads cover images straight to Vercel Blob and only calls this
// route to obtain a short-lived, scoped upload token. That keeps the image out
// of the serverless request body, so uploads are no longer capped at Vercel's
// 4.5 MB function payload limit (which caused FUNCTION_PAYLOAD_TOO_LARGE 413s).
export async function POST(request: Request) {
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
        // Only signed-in admins may mint an upload token. The upload-completed
        // callback skips this hook and is verified by Vercel's signature.
        if (!(await hasAdminSession())) {
          throw new Error("Authentication required.");
        }

        return {
          addRandomSuffix: true,
          allowedContentTypes: [...ALLOWED_COVER_IMAGE_TYPES],
          maximumSizeInBytes: MAX_COVER_IMAGE_SIZE_BYTES,
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Cover image upload failed. Please try again.";

    return Response.json({ message }, { status: 400 });
  }
}
