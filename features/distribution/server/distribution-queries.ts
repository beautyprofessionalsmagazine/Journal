import { getSiteSettings } from "@/features/site-settings/server/site-settings-queries";
import type { SiteSettings } from "@/features/site-settings/types/site-settings";
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
 * The public map is assembled from two sources: the editorial office stored in
 * site settings, and every approved salon / school subscription, which becomes
 * an Official Distribution Partner on approval.
 */
export async function listDistributionLocations(): Promise<
  DistributionLocation[]
> {
  const [settings, distributors] = await Promise.all([
    getSiteSettings(),
    listDistributorSubscriptions(),
  ]);
  const office = toOfficeLocation(settings);
  const locations = office ? [office] : [];

  for (const distributor of distributors) {
    const location = toDistributionLocation(distributor);

    if (location) {
      locations.push(location);
    }
  }

  return locations.sort(
    (a, b) =>
      a.stateName.localeCompare(b.stateName) ||
      // The editorial office is listed first within its own state.
      Number(b.kind === "office") - Number(a.kind === "office") ||
      a.name.localeCompare(b.name),
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
  office: DistributionLocation | null;
  distributors: Distributor[];
  stats: {
    total: number;
    onMap: number;
    states: number;
    copiesPerIssue: number;
  };
};

/**
 * Everything `/admin/distributors` renders: the office pin, every salon and
 * school with its address point, and whether that point is live on the map.
 */
export async function getDistributorDirectory(): Promise<DistributorDirectory> {
  const [settings, subscriptions] = await Promise.all([
    getSiteSettings(),
    listDistributorSubscriptions(),
  ]);

  const distributors = subscriptions.map((subscription) => ({
    subscription,
    location: toDistributionLocation(subscription),
    issue: getDistributionPointIssue(subscription),
    stateName: getUsStateName(subscription.state),
  }));
  const onMap = distributors.filter((distributor) => distributor.location);

  return {
    office: toOfficeLocation(settings),
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

function toOfficeLocation(
  settings: SiteSettings | null,
): DistributionLocation | null {
  const stateName = getUsStateName(settings?.state);

  if (!settings?.state || !stateName) {
    return null;
  }

  return {
    id: `office-${settings.id}`,
    name: settings.officeName,
    kind: "office",
    organizationType: null,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    city: settings.city,
    stateCode: settings.state.toUpperCase(),
    stateName,
    zipCode: settings.zipCode,
  };
}
