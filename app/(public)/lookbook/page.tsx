import type { Metadata } from "next";

import { LookbookPage } from "@/features/lookbook/components/LookbookPage";

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

  return (
    <LookbookPage
      issueMonth={toIssueNumber(params.month)}
      issueYear={toIssueNumber(params.year)}
    />
  );
}

function toIssueNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;

  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : undefined;
}
