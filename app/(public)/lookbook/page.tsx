import type { Metadata } from "next";

import { LookbookPage } from "@/features/lookbook";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Read the current Beauty Professionals Magazine Lookbook.",
};
export const dynamic = "force-dynamic";

export default function LookbookRoute() {
  return <LookbookPage />;
}
