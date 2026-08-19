import type { Metadata } from "next";

import { WhereToFindPage } from "@/features/distribution";

/**
 * Approving a subscription calls `revalidatePath("/where-to-find")`, so the map
 * refreshes immediately. This is a backstop for partner rows edited directly in
 * the database.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Where to Find Beauty Professionals Magazine",
  description:
    "Find Beauty Professionals Magazine at salons, beauty schools, Med Spas, and clinics across the United States. Search by state, city, or ZIP Code.",
};

export default function Page() {
  return <WhereToFindPage />;
}
