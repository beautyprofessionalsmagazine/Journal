import type { Metadata } from "next";

import { LookbookPage } from "@/features/lookbook";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Browse Beauty Professionals Magazine Lookbooks by year and month.",
};
export const dynamic = "force-dynamic";

type LookbookRouteProps = {
  searchParams: Promise<{
    month?: string | string[];
    year?: string | string[];
  }>;
};

export default async function LookbookRoute({
  searchParams,
}: LookbookRouteProps) {
  const params = await searchParams;
  const rawMonth = Array.isArray(params.month) ? params.month[0] : params.month;
  const rawYear = Array.isArray(params.year) ? params.year[0] : params.year;

  return (
    <LookbookPage
      issueMonth={rawMonth ? Number(rawMonth) : undefined}
      issueYear={rawYear ? Number(rawYear) : undefined}
    />
  );
}
