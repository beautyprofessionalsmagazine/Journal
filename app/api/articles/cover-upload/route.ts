import {
  ArticleUploadError,
  uploadArticleCoverImageFromFormData,
} from "@/features/articles/server/article-upload";
import { hasAdminSession } from "@/features/admin/server/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return Response.json(
      {
        message: "Authentication required.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const formData = await request.formData();
    const result = await uploadArticleCoverImageFromFormData(formData);

    return Response.json(result);
  } catch (error) {
    if (error instanceof ArticleUploadError) {
      return Response.json(
        {
          message: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    return Response.json(
      {
        message: "Cover image upload failed. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
