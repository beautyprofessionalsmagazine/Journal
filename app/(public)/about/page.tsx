import type { Metadata } from "next";

import { AboutPage } from "@/features/about";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("about");

export default function Page() {
  return <AboutPage />;
}
