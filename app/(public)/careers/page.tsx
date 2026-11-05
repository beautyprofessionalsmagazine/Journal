import type { Metadata } from "next";

import { CareersPage } from "@/features/careers";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("careers");

export default function Page() {
  return <CareersPage />;
}
