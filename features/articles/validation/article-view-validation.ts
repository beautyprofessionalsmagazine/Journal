import { z } from "zod";

import {
  articleViewModeValues,
  MAX_ARTICLE_VIEWS,
} from "@/features/articles/lib/article-views";

export const manualViewsSchema = z
  .union([
    z.number(),
    z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter a non-negative whole number.")
      .transform(Number),
  ])
  .pipe(z.number().int().min(0).max(MAX_ARTICLE_VIEWS));

export const articleViewSettingsSchema = z.object({
  viewCountMode: z.enum(articleViewModeValues, {
    message: "Choose actual or manual views.",
  }),
  manualViews: manualViewsSchema,
});
