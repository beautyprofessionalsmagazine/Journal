import type { Metadata } from "next";

import { CurrentIssuePage } from "@/features/current-issue";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("currentIssue");

export default function Page() {
  return <CurrentIssuePage />;
}
