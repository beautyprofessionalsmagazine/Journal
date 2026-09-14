import { createAdminBlobUploadResponse } from "@/shared/lib/admin-blob-upload";

const MAX_LOOKBOOK_SIZE_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  return createAdminBlobUploadResponse({
    request,
    allowedContentTypes: ["application/pdf"],
    maximumSizeInBytes: MAX_LOOKBOOK_SIZE_BYTES,
    failureMessage: "Lookbook upload failed.",
  });
}
