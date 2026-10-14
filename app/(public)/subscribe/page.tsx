import type { Metadata } from "next";

import { SubscribePage } from "@/features/subscriptions";
import { digitalSubscriptionsEnabled } from "@/features/subscriptions/types/subscription";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import { getStaticPageJsonLd, getStaticPageMetadata } from "@/shared/seo/pages";

// The description must match what the page offers. Individual (email)
// subscriptions are paused behind `digitalSubscriptionsEnabled`; advertising
// them in the search snippet while the form is closed would mislead readers.
const copy = digitalSubscriptionsEnabled
  ? {}
  : {
      description:
        "Request free printed copies of Beauty Professionals Magazine for your salon, school, Med Spa, or clinic. Individual email subscriptions are currently paused.",
    };

export const metadata: Metadata = getStaticPageMetadata("subscribe", copy);

export default function Page() {
  return (
    <>
      <JsonLd data={getStaticPageJsonLd("subscribe", copy)} />
      <SubscribePage />
    </>
  );
}
