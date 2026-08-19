import { getSiteSettings } from "@/features/site-settings/server/site-settings-queries";
import { listDistributionPartners } from "@/features/subscriptions/server/subscription-queries";
import type { DistributionLocation } from "@/features/distribution/types/distribution";
import { getUsStateName } from "@/shared/config/us-states";

/**
 * The public map is assembled from two sources: the editorial office stored in
 * site settings, and every approved salon / school subscription, which becomes
 * an Official Distribution Partner on approval.
 */
export async function listDistributionLocations(): Promise<
  DistributionLocation[]
> {
  const [settings, partners] = await Promise.all([
    getSiteSettings(),
    listDistributionPartners(),
  ]);
  const locations: DistributionLocation[] = [];

  if (settings?.state && getUsStateName(settings.state)) {
    locations.push({
      id: `office-${settings.id}`,
      name: settings.officeName,
      kind: "office",
      organizationType: null,
      addressLine1: settings.addressLine1,
      addressLine2: settings.addressLine2,
      city: settings.city,
      stateCode: settings.state.toUpperCase(),
      stateName: getUsStateName(settings.state) ?? settings.state,
      zipCode: settings.zipCode,
    });
  }

  for (const partner of partners) {
    const stateName = getUsStateName(partner.state);

    if (!partner.state || !stateName || !partner.organizationName) {
      continue;
    }

    locations.push({
      id: partner.id,
      name: partner.organizationName,
      kind: partner.type === "salon" ? "salon" : "school",
      organizationType: partner.organizationType,
      addressLine1: partner.addressLine1,
      addressLine2: partner.addressLine2,
      city: partner.city,
      stateCode: partner.state.toUpperCase(),
      stateName,
      zipCode: partner.zipCode,
    });
  }

  return locations.sort(
    (a, b) =>
      a.stateName.localeCompare(b.stateName) ||
      // The editorial office is listed first within its own state.
      Number(b.kind === "office") - Number(a.kind === "office") ||
      a.name.localeCompare(b.name),
  );
}
