import {
  ArticleUploadError,
  uploadArticleCoverImageFromFormData,
} from "@/features/articles/server/article-upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
