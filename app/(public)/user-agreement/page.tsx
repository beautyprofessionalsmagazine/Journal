import type { Metadata } from "next";

import { UserAgreementPage } from "@/features/user-agreement";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("userAgreement");

export default function Page() {
  return <UserAgreementPage />;
}
