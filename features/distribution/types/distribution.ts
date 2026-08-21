import type {
  OrganizationType,
  Subscription,
} from "@/features/subscriptions/types/subscription";
import { getUsStateName } from "@/shared/config/us-states";

export type DistributionLocationKind = "office" | "salon" | "school";

export type DistributionLocation = {
  id: string;
  name: string;
  kind: DistributionLocationKind;
  organizationType: OrganizationType | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string;
  stateName: string;
  zipCode: string | null;
};

export const distributionKindLabels: Record<DistributionLocationKind, string> = {
  office: "Editorial office",
  salon: "Official Distribution Partner",
  school: "Official Distribution Partner",
};

/** Why a distributor has no live point on the map yet. */
export type DistributionPointIssue = "pending" | "canceled" | "incomplete";

export const distributionPointIssueLabels: Record<
  DistributionPointIssue,
  string
> = {
  pending: "Awaiting approval",
  canceled: "Canceled",
  incomplete: "Address incomplete",
};

/**
 * The single rule for publishing a distributor's address point, shared by the
 * public map and the admin table so the two can never disagree about what is
 * live. A salon or school goes on the map once it is approved and its address
 * carries an organization name and a recognized U.S. state.
 */
export function getDistributionPointIssue(
  subscription: Subscription,
): DistributionPointIssue | null {
  if (subscription.status === "canceled") {
    return "canceled";
  }

  if (!subscription.organizationName || !getUsStateName(subscription.state)) {
    return "incomplete";
  }

  return subscription.status === "active" ? null : "pending";
}

/**
 * The distributor's address point, or `null` when it is not published yet.
 */
export function toDistributionLocation(
  subscription: Subscription,
): DistributionLocation | null {
  const stateName = getUsStateName(subscription.state);

  if (
    getDistributionPointIssue(subscription) ||
    !subscription.state ||
    !stateName ||
    !subscription.organizationName
  ) {
    return null;
  }

  return {
    id: subscription.id,
    name: subscription.organizationName,
    kind: subscription.type === "salon" ? "salon" : "school",
    organizationType: subscription.organizationType,
    addressLine1: subscription.addressLine1,
    addressLine2: subscription.addressLine2,
    city: subscription.city,
    stateCode: subscription.state.toUpperCase(),
    stateName,
    zipCode: subscription.zipCode,
  };
}

export function formatDistributionAddress(location: DistributionLocation) {
  const street = [location.addressLine1, location.addressLine2]
    .filter(Boolean)
    .join(", ");
  const locality = [location.city, location.stateCode]
    .filter(Boolean)
    .join(", ");

  return [street, [locality, location.zipCode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(" · ");
}
