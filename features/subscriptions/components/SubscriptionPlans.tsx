"use client";

import { useState } from "react";

import { DigitalUnavailableNotice } from "@/features/subscriptions/components/DigitalUnavailableNotice";
import { SubscriptionForm } from "@/features/subscriptions/components/SubscriptionForm";
import {
  digitalSubscriptionsEnabled,
  type SubscriptionType,
} from "@/features/subscriptions/types/subscription";

type Plan = {
  type: SubscriptionType;
  name: string;
  audience: string;
  /** The one figure that sets this route apart, shown on the selector. */
  fact: string;
  description: string;
  points: string[];
  note: string;
};

const plans: Plan[] = [
  {
    type: "individual",
    name: "Individual",
    audience: "For professionals",
    fact: "One copy, by email",
    description:
      "Any licensed professional can subscribe and receive the magazine free of charge.",
    points: [
      "Free for every licensed professional",
      "Issues and related news by email",
      "Cancel any time",
    ],
    note: "Delivered by email, free of charge, for as long as you want it.",
  },
  {
    type: "salon",
    name: "Salon",
    audience: "For salons",
    fact: "3–20 copies per issue",
    description:
      "Printed copies delivered to your salon for the front desk and the styling floor.",
    points: [
      "3, 5, 10, or 20 copies per issue",
      "Official Distribution Partner status after approval",
      "Listed on the Where to Find map",
    ],
    note: "After approval your salon becomes an Official Distribution Partner and appears on the Where to Find map.",
  },
  {
    type: "school",
    name: "School / Company",
    audience: "For schools & clinics",
    fact: "25–250 copies per issue",
    description:
      "Bulk deliveries for beauty schools, brands, distributors, Med Spas, and clinics.",
    points: [
      "25 to 250 copies per issue",
      "Bulk shipment to one address",
      "Listed on the Where to Find map",
    ],
    note: "After approval your location becomes an Official Distribution Partner and appears on the Where to Find map.",
  },
];

export function SubscriptionPlans() {
  const [activeType, setActiveType] = useState<SubscriptionType>("individual");
  const [formKey, setFormKey] = useState(0);
  const activePlan = plans.find((plan) => plan.type === activeType) ?? plans[0];
  const isDigitalPaused =
    activePlan.type === "individual" && !digitalSubscriptionsEnabled;

  return (
    <div className="min-w-0">
      <p className="editorial-kicker mb-4 text-black/45">
        Choose your subscription
      </p>

      <div
        aria-label="Subscription types"
        className="grid border-y border-black md:grid-cols-3 md:divide-x md:divide-black"
        role="tablist"
      >
        {plans.map((plan) => {
          const isActive = plan.type === activeType;
          const paused =
            plan.type === "individual" && !digitalSubscriptionsEnabled;

          return (
            <button
              aria-controls="subscription-panel"
              aria-selected={isActive}
              className={`focus-ring flex min-h-11 flex-col items-start gap-3 border-b border-black/15 p-[clamp(1.25rem,2.5vw,1.85rem)] text-left transition-colors duration-150 last:border-b-0 md:border-b-0 ${
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
              <span className="flex w-full items-center justify-between gap-3">
                <span
                  className={`editorial-kicker ${isActive ? "text-white/60" : "text-black/45"}`}
                >
                  {plan.audience}
                </span>
                {paused ? (
                  <span
                    className={`shrink-0 border px-2 py-[0.15rem] text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                      isActive
                        ? "border-white/40 text-white/85"
                        : "border-black/25 text-black/55"
                    }`}
                  >
                    Paused
                  </span>
                ) : null}
              </span>
              <span className="[font-family:var(--font-editorial-title)] text-[clamp(1.6rem,2.6vw,2.15rem)] font-bold leading-[0.95] tracking-[-0.03em]">
                {plan.name}
              </span>
              <span
                className={`text-xs leading-5 ${isActive ? "text-white/72" : "text-black/55"}`}
              >
                {plan.fact}
              </span>
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
          <h2 className="[font-family:var(--font-editorial-title)] text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            {activePlan.name}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-black/64">
            {activePlan.description}
          </p>
          <ul className="mt-6 space-y-2.5 border-t border-black/12 pt-6 text-sm leading-6 text-black/70">
            {activePlan.points.map((point) => (
              <li className="flex gap-3" key={point}>
                <span aria-hidden="true" className="text-black/35">
                  —
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {isDigitalPaused ? null : (
            <p className="mt-6 border-l-2 border-black pl-4 [font-family:var(--font-editorial-body-sans)] text-sm italic leading-7 text-black/70">
              {activePlan.note}
            </p>
          )}
        </div>

        <div className="min-w-0">
          {isDigitalPaused ? (
            <DigitalUnavailableNotice onChoosePrint={() => setActiveType("salon")} />
          ) : (
            <SubscriptionForm
              key={`${activePlan.type}-${formKey}`}
              onReset={() => setFormKey((current) => current + 1)}
              type={activePlan.type}
            />
          )}
        </div>
      </div>
    </div>
  );
}
