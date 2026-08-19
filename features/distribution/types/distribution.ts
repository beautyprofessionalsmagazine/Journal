import type { OrganizationType } from "@/features/subscriptions/types/subscription";

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
