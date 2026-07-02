import type { Metadata } from "next";

import { ArticlesPage } from "@/features/articles";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Search and filter Beauty Professionals Magazine articles by category, tag, author, and popularity.",
};

export default function Page() {
  return <ArticlesPage />;
}
