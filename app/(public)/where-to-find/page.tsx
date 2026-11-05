import type { Metadata } from "next";

import { WhereToFindPage } from "@/features/distribution";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import { getStaticPageJsonLd, getStaticPageMetadata } from "@/shared/seo/pages";

/**
 * Approving a subscription calls `revalidatePath("/where-to-find")`, so the map
 * refreshes immediately. This is a backstop for partner rows edited directly in
 * the database.
 */
export const revalidate = 300;

// `?location=<id>` only highlights a pin on the same map, so it shares this
// page's canonical URL (the registry entry declares it).
export const metadata: Metadata = getStaticPageMetadata("whereToFind");

type WhereToFindRouteProps = {
  searchParams: Promise<{ location?: string | string[] }>;
};

export default async function Page({ searchParams }: WhereToFindRouteProps) {
  const { location } = await searchParams;

  return (
    <>
      <JsonLd data={getStaticPageJsonLd("whereToFind")} />
      <WhereToFindPage
        focusId={Array.isArray(location) ? location[0] : location}
      />
    </>
  );
}
