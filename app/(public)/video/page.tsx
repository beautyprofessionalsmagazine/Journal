import type { Metadata } from "next";

import { VideoPage } from "@/features/video";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("video");

export default function Page() {
  return <VideoPage />;
}
