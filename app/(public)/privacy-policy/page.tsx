import type { Metadata } from "next";

import { PrivacyPolicyPage } from "@/features/privacy-policy";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("privacyPolicy");

export default function Page() {
  return <PrivacyPolicyPage />;
}
