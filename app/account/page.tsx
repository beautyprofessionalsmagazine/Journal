import type { Metadata } from "next";

import { AccountPage } from "@/features/account";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("account");

export default function Page() {
  return <AccountPage />;
}
