import { and, desc, eq, inArray } from "drizzle-orm";

import { subscriptionsTable } from "@/features/subscriptions/db/subscription-schema";
import {
  getSubscriptionChannel,
  type Subscription,
  type SubscriptionStatus,
} from "@/features/subscriptions/types/subscription";
import { db } from "@/shared/lib/db";

export async function listSubscriptions(): Promise<Subscription[]> {
  return db
    .select()
    .from(subscriptionsTable)
    .orderBy(desc(subscriptionsTable.createdAt));
}

export async function getSubscriptionById(
  id: string,
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.id, id))
    .limit(1);

  return subscription ?? null;
}

export type GroupedSubscriptions = {
  digital: Subscription[];
  physical: Subscription[];
  stats: {
    total: number;
    digital: number;
    physical: number;
    pending: number;
    active: number;
    canceled: number;
    copiesPerIssue: number;
  };
};

/**
 * Digital covers individual subscriptions (delivered by email); physical covers
 * salon and school/company subscriptions (printed copies shipped to an address).
 */
export async function getGroupedSubscriptions(): Promise<GroupedSubscriptions> {
  const subscriptions = await listSubscriptions();
  const digital = subscriptions.filter(
    (subscription) => getSubscriptionChannel(subscription.type) === "digital",
  );
  const physical = subscriptions.filter(
    (subscription) => getSubscriptionChannel(subscription.type) === "physical",
  );

  return {
    digital,
    physical,
    stats: {
      total: subscriptions.length,
      digital: digital.length,
      physical: physical.length,
      pending: countStatus(subscriptions, "pending"),
      active: countStatus(subscriptions, "active"),
      canceled: countStatus(subscriptions, "canceled"),
      copiesPerIssue: physical
        .filter((subscription) => subscription.status === "active")
        .reduce((total, subscription) => total + (subscription.copies ?? 0), 0),
    },
  };
}

/**
 * Approved salons and schools are Official Distribution Partners and are the
 * pins rendered on the public "Where to Find" map.
 */
export async function listDistributionPartners(): Promise<Subscription[]> {
  return db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.status, "active"),
        inArray(subscriptionsTable.type, ["salon", "school"]),
      ),
    )
    .orderBy(desc(subscriptionsTable.createdAt));
}

function countStatus(
  subscriptions: Subscription[],
  status: SubscriptionStatus,
) {
  return subscriptions.filter((subscription) => subscription.status === status)
    .length;
}
