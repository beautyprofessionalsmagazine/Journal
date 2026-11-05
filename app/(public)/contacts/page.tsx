import type { Metadata } from "next";

import { ContactsPage } from "@/features/contacts";
import { getStaticPageMetadata } from "@/shared/seo/pages";

export const metadata: Metadata = getStaticPageMetadata("contacts");

export default function Page() {
  return <ContactsPage />;
}
