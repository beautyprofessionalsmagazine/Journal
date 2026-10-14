import type { Metadata } from "next";

import { LookbookPage } from "@/features/lookbook";
import { buildLookbookMetadata } from "@/features/lookbook/seo/lookbook-seo";
import { getLookbooks } from "@/features/lookbook/server/lookbook-queries";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import { pageJsonLd } from "@/shared/seo/json-ld";

export const dynamic = "force-dynamic";

const lookbookJsonLd = pageJsonLd({
  path: "/lookbook",
  name: "Lookbook",
  description:
    "Browse Beauty Professionals Magazine Lookbooks by year and month.",
  type: "CollectionPage",
});

type LookbookRouteProps = {
  searchParams: Promise<{
    month?: string | string[];
    year?: string | string[];
  }>;
};

function readNumber(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;

  return first ? Number(first) : undefined;
}

export async function generateMetadata({
  searchParams,
}: LookbookRouteProps): Promise<Metadata> {
  const params = await searchParams;
  // If the editions cannot be read the page itself errors; never index that.
  const lookbooks = await getLookbooks().catch(() => []);

  return buildLookbookMetadata({
    lookbooks,
    requestedMonth: readNumber(params.month),
    requestedYear: readNumber(params.year),
  });
}

export default async function LookbookRoute({
  searchParams,
}: LookbookRouteProps) {
  const params = await searchParams;

  return (
    <>
      <JsonLd data={lookbookJsonLd} />
      <LookbookPage
        issueMonth={readNumber(params.month)}
        issueYear={readNumber(params.year)}
      />
    </>
  );
}
