import { listDistributorSubscriptions } from "@/features/subscriptions/server/subscription-queries";
import type { Subscription } from "@/features/subscriptions/types/subscription";
import {
  getDistributionPointIssue,
  toDistributionLocation,
  type DistributionLocation,
  type DistributionPointIssue,
} from "@/features/distribution/types/distribution";
import { getUsStateName } from "@/shared/config/us-states";

/**
 * Every pin on the public map is an approved salon / school subscription, which
 * becomes an Official Distribution Partner on approval.
 */
export async function listDistributionLocations(): Promise<
  DistributionLocation[]
> {
  const distributors = await listDistributorSubscriptions();
  const locations: DistributionLocation[] = [];

  for (const distributor of distributors) {
    const location = toDistributionLocation(distributor);

    if (location) {
      locations.push(location);
    }
  }

  return locations.sort(
    (a, b) =>
      a.stateName.localeCompare(b.stateName) || a.name.localeCompare(b.name),
  );
}

export type Distributor = {
  subscription: Subscription;
  /** The published address point, or `null` while `issue` explains why not. */
  location: DistributionLocation | null;
  issue: DistributionPointIssue | null;
  stateName: string | null;
};

export type DistributorDirectory = {
  distributors: Distributor[];
  stats: {
    total: number;
    onMap: number;
    states: number;
    copiesPerIssue: number;
  };
};

/**
 * Everything `/admin/distributors` renders: every salon and school with its
 * address point, and whether that point is live on the map.
 */
export async function getDistributorDirectory(): Promise<DistributorDirectory> {
  const subscriptions = await listDistributorSubscriptions();

  const distributors = subscriptions.map((subscription) => ({
    subscription,
    location: toDistributionLocation(subscription),
    issue: getDistributionPointIssue(subscription),
    stateName: getUsStateName(subscription.state),
  }));
  const onMap = distributors.filter((distributor) => distributor.location);

  return {
    distributors,
    stats: {
      total: distributors.length,
      onMap: onMap.length,
      states: new Set(
        onMap.map((distributor) => distributor.location?.stateCode),
      ).size,
      copiesPerIssue: onMap.reduce(
        (total, distributor) => total + (distributor.subscription.copies ?? 0),
        0,
      ),
    },
  };
}
