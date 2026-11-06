import type { Metadata } from "next";

import { ArchivePage } from "@/features/archive";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("archive");

export default function Page() {
  return <ArchivePage />;
}
