import type { Metadata } from "next";

import { LookbookPage } from "@/features/lookbook/components/LookbookPage";
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
  if (!first) return undefined;

  const parsed = Number(first);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export async function generateMetadata({
  searchParams,
}: LookbookRouteProps): Promise<Metadata> {
  const params = await searchParams;
  // getLookbooks never throws; an unreadable archive is an empty list (noindex).
  const lookbooks = await getLookbooks();

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
