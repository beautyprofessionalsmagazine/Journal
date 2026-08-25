"use client";

import { useState, useTransition } from "react";

import {
  updateSubscriptionDeliveryStatusAction,
  updateSubscriptionStatusAction,
} from "@/features/subscriptions/server/subscription-actions";
import {
  subscriptionDeliveryStatusLabels,
  subscriptionDeliveryStatusValues,
  subscriptionStatusLabels,
  subscriptionStatusValues,
  type SubscriptionDeliveryStatus,
  type SubscriptionStatus,
} from "@/features/subscriptions/types/subscription";
import { Select } from "@/shared/components/ui";

type SubscriptionStatusControlsProps = {
  id: string;
  status: SubscriptionStatus;
  deliveryStatus: SubscriptionDeliveryStatus;
  layout?: "row" | "stack";
};

const statusOptions = subscriptionStatusValues.map((value) => ({
  label: subscriptionStatusLabels[value],
  value,
}));

const deliveryStatusOptions = subscriptionDeliveryStatusValues.map((value) => ({
  label: subscriptionDeliveryStatusLabels[value],
  value,
}));

export function SubscriptionStatusControls({
  id,
  status,
  deliveryStatus,
  layout = "stack",
}: SubscriptionStatusControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDeliveryStatus, setCurrentDeliveryStatus] =
    useState(deliveryStatus);
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(value: string) {
    const nextStatus = value as SubscriptionStatus;
    const previousStatus = currentStatus;

    setCurrentStatus(nextStatus);
    setError(null);
    startTransition(async () => {
      const result = await updateSubscriptionStatusAction(id, nextStatus);

      if (!result.ok) {
        setCurrentStatus(previousStatus);
        setError(result.message);
      }
    });
  }

  function handleDeliveryStatusChange(value: string) {
    const nextStatus = value as SubscriptionDeliveryStatus;
    const previousStatus = currentDeliveryStatus;

    setCurrentDeliveryStatus(nextStatus);
    setError(null);
    startTransition(async () => {
      const result = await updateSubscriptionDeliveryStatusAction(
        id,
        nextStatus,
      );

      if (!result.ok) {
        setCurrentDeliveryStatus(previousStatus);
        setError(result.message);
      }
    });
  }

  return (
    <div
      className={
        layout === "row"
          ? "grid min-w-0 gap-2 sm:grid-cols-2"
          : "grid min-w-0 gap-2"
      }
      data-pending={isPending || undefined}
    >
      <Select
        disabled={isPending}
        label="Status"
        onChange={handleStatusChange}
        options={statusOptions}
        triggerClassName="min-h-11 text-xs uppercase tracking-[0.06em]"
        value={currentStatus}
      />
      <Select
        disabled={isPending}
        label="Delivery"
        onChange={handleDeliveryStatusChange}
        options={deliveryStatusOptions}
        triggerClassName="min-h-11 text-xs uppercase tracking-[0.06em]"
        value={currentDeliveryStatus}
      />
      {error ? (
        <p className="text-xs leading-5 text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
