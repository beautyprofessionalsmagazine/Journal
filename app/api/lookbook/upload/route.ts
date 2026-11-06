import { MAX_LOOKBOOK_SIZE_BYTES } from "@/features/lookbook/lib/lookbook-issue";
import { createAdminBlobUploadResponse } from "@/shared/lib/admin-blob-upload";

export async function POST(request: Request) {
  return createAdminBlobUploadResponse({
    request,
    allowedContentTypes: ["application/pdf"],
    maximumSizeInBytes: MAX_LOOKBOOK_SIZE_BYTES,
    failureMessage: "Lookbook upload failed.",
  });
}
