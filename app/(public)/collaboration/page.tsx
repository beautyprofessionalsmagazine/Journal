import type { Metadata } from "next";

import { CollaborationPage } from "@/features/collaboration";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("collaboration");

export default function Page() {
  return <CollaborationPage />;
}
