import type { Metadata } from "next";

import { HomePage } from "@/features/home";
import { buildPageMetadata } from "@/shared/seo/metadata";
import { SITE } from "@/shared/seo/site";

// The home page carries the fuller brand description Google recommends; every
// other page uses the "%s | Beauty Professionals Magazine" template.
export const metadata: Metadata = buildPageMetadata({
  title: SITE.homeTitle,
  absoluteTitle: true,
  description: SITE.description,
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
