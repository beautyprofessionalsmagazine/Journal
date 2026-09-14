import type { Metadata } from "next";

import { LookbookPage } from "@/features/lookbook";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Read the current Beauty Professionals Magazine Lookbook.",
};

export default function LookbookRoute() {
  return <LookbookPage />;
}
