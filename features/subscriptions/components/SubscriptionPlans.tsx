"use client";

import { useState } from "react";

import { SubscriptionForm } from "@/features/subscriptions/components/SubscriptionForm";
import type { SubscriptionType } from "@/features/subscriptions/types/subscription";

const plans: {
  type: SubscriptionType;
  name: string;
  audience: string;
  description: string;
  points: string[];
}[] = [
  {
    type: "individual",
    name: "Individual",
    audience: "For beauty professionals",
    description:
      "Any working professional can subscribe and receive the magazine free of charge.",
    points: [
      "Free for every licensed professional",
      "Issues and related news by email",
      "Cancel any time",
    ],
  },
  {
    type: "salon",
    name: "Salon",
    audience: "For salons",
    description:
      "Printed copies delivered to your salon for the front desk and styling floor.",
    points: [
      "3, 5, 10, or 20 copies per issue",
      "Official Distribution Partner status after approval",
      "Listed on the Where to Find map",
    ],
  },
  {
    type: "school",
    name: "School / Company",
    // Kept to one line so the three card titles stay aligned; the full list of
    // organization types is spelled out in the description below.
    audience: "For schools & clinics",
    description:
      "Bulk deliveries for beauty schools, brands, distributors, Med Spas, and clinics.",
    points: [
      "25 to 250 copies per issue",
      "Bulk shipment to one address",
      "Listed on the Where to Find map",
    ],
  },
];

export function SubscriptionPlans() {
  const [activeType, setActiveType] = useState<SubscriptionType>("individual");
  const [formKey, setFormKey] = useState(0);
  const activePlan = plans.find((plan) => plan.type === activeType) ?? plans[0];

  return (
    <div className="min-w-0">
      <div
        aria-label="Subscription types"
        className="grid border-y border-black md:grid-cols-3 md:divide-x md:divide-black"
        role="tablist"
      >
        {plans.map((plan) => {
          const isActive = plan.type === activeType;

          return (
            <button
              aria-controls="subscription-panel"
              aria-selected={isActive}
              className={`focus-ring flex min-h-11 flex-col items-start gap-2 border-b border-black/15 p-[clamp(1.25rem,2.5vw,2rem)] text-left transition-colors duration-150 last:border-b-0 md:border-b-0 ${
                isActive
                  ? "bg-black text-white"
                  : "bg-transparent text-black hover:bg-black/[0.04]"
              }`}
              id={`subscription-tab-${plan.type}`}
              key={plan.type}
              onClick={() => setActiveType(plan.type)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <span
                className={`editorial-kicker ${isActive ? "text-white/60" : "text-black/45"}`}
              >
                {plan.audience}
              </span>
              <span className="[font-family:var(--font-editorial-title)] text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
                {plan.name}
              </span>
              <ul
                className={`mt-1 space-y-1 text-xs leading-5 ${isActive ? "text-white/72" : "text-black/58"}`}
              >
                {plan.points.map((point) => (
                  <li className="flex gap-2" key={point}>
                    <span aria-hidden="true">—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`subscription-tab-${activePlan.type}`}
        className="grid gap-[clamp(2rem,5vw,4rem)] pt-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-[0.62fr_1.38fr] lg:items-start"
        id="subscription-panel"
        role="tabpanel"
        tabIndex={-1}
      >
        <div className="lg:sticky lg:top-32">
          <h2 className="section-title">{activePlan.name}</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-black/64">
            {activePlan.description}
          </p>
          {activePlan.type !== "individual" ? (
            <p className="mt-6 border-l-2 border-black pl-4 [font-family:var(--font-editorial-body-sans)] text-sm italic leading-7 text-black/70">
              After approval your location automatically becomes an Official
              Distribution Partner and appears on the Where to Find map.
            </p>
          ) : (
            <p className="mt-6 border-l-2 border-black pl-4 [font-family:var(--font-editorial-body-sans)] text-sm italic leading-7 text-black/70">
              Delivered by email, free of charge, for as long as you want it.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <SubscriptionForm
            key={`${activePlan.type}-${formKey}`}
            onReset={() => setFormKey((current) => current + 1)}
            type={activePlan.type}
          />
        </div>
      </div>
    </div>
  );
}
