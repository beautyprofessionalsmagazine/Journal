import { NextRequest, NextResponse, userAgent } from "next/server";
import { z } from "zod";

import { isArticleViewRequest } from "@/features/articles/server/article-view-request";
import { recordArticleView } from "@/features/articles/server/article-view-queries";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const headers = { "Cache-Control": "no-store" };
  if (!isArticleViewRequest(request)) {
    return new NextResponse(null, { status: 403, headers });
  }
  if (userAgent(request).isBot) {
    return new NextResponse(null, { status: 204, headers });
  }

  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return new NextResponse(null, { status: 400, headers });
  }

  try {
    const views = await recordArticleView(id);
    return views === null
      ? new NextResponse(null, { status: 404, headers })
      : NextResponse.json({ views }, { headers });
  } catch (error) {
    console.error("[article-views] Unable to record view", error);
    return new NextResponse(null, { status: 503, headers });
  }
}
