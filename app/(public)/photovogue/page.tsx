import type { Metadata } from "next";

import { PhotoVoguePage } from "@/features/photovogue";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("photovogue");

export default function Page() {
  return <PhotoVoguePage />;
}
