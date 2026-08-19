import type { Metadata } from "next";

import { SubscribePage } from "@/features/subscriptions";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Free individual subscriptions for beauty professionals, printed copies for salons, and bulk delivery for schools, brands, distributors, Med Spas, and clinics.",
};

export default function Page() {
  return <SubscribePage />;
}
