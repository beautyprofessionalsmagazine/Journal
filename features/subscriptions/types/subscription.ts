export const subscriptionTypeValues = [
  "individual",
  "salon",
  "school",
] as const;

export type SubscriptionType = (typeof subscriptionTypeValues)[number];

export const subscriptionStatusValues = [
  "pending",
  "active",
  "canceled",
] as const;

export type SubscriptionStatus = (typeof subscriptionStatusValues)[number];

export const subscriptionDeliveryStatusValues = [
  "prepare",
  "pending",
  "completed",
] as const;

export type SubscriptionDeliveryStatus =
  (typeof subscriptionDeliveryStatusValues)[number];

export const organizationTypeValues = [
  "salon",
  "beauty_school",
  "brand",
  "distributor",
  "med_spa",
  "clinic",
] as const;

export type OrganizationType = (typeof organizationTypeValues)[number];

/**
 * Individual subscriptions are fulfilled by email (Resend), organization
 * subscriptions are fulfilled by shipping printed copies.
 */
export const subscriptionChannelValues = ["digital", "physical"] as const;

export type SubscriptionChannel = (typeof subscriptionChannelValues)[number];

export const salonCopiesOptions = [3, 5, 10, 20] as const;

export const schoolCopiesOptions = [25, 50, 100, 250] as const;

export const subscriptionTypeLabels: Record<SubscriptionType, string> = {
  individual: "Individual",
  salon: "Salon",
  school: "School / Company",
};

/** Single-word variants for table badges, where wrapping breaks the layout. */
export const subscriptionTypeShortLabels: Record<SubscriptionType, string> = {
  individual: "Individual",
  salon: "Salon",
  school: "School",
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  pending: "Pending",
  active: "Active",
  canceled: "Canceled",
};

export const subscriptionDeliveryStatusLabels: Record<
  SubscriptionDeliveryStatus,
  string
> = {
  prepare: "Prepare",
  pending: "Pending",
  completed: "Completed",
};

export const organizationTypeLabels: Record<OrganizationType, string> = {
  salon: "Salon",
  beauty_school: "Beauty school",
  brand: "Brand",
  distributor: "Distributor",
  med_spa: "Med Spa",
  clinic: "Clinic",
};

/** Organization types offered on the School / Company form. */
export const schoolOrganizationTypeValues = organizationTypeValues.filter(
  (value) => value !== "salon",
) as Exclude<OrganizationType, "salon">[];

export type Subscription = {
  id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  deliveryStatus: SubscriptionDeliveryStatus;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profession: string | null;
  organizationName: string | null;
  contactPerson: string | null;
  organizationType: OrganizationType | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  copies: number | null;
  emailConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  organizationName: string;
  contactPerson: string;
  organizationType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  copies: string;
  emailConsent: boolean;
};

export type SubscriptionFieldErrors = Partial<
  Record<keyof SubscriptionFormValues, string>
>;

export type SubscriptionFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors: SubscriptionFieldErrors;
};

export const initialSubscriptionFormState: SubscriptionFormState = {
  status: "idle",
  fieldErrors: {},
};

export const emptySubscriptionFormValues: SubscriptionFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  profession: "",
  organizationName: "",
  contactPerson: "",
  organizationType: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  copies: "",
  emailConsent: false,
};

/**
 * Distributors added by hand on `/admin/distributors`. The subscription type is
 * derived from the organization type, so the two can never disagree: a salon is
 * a `salon` subscription, everything else is a `school` one.
 */
export type DistributorFormValues = {
  organizationName: string;
  contactPerson: string;
  email: string;
  organizationType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  copies: string;
};

export type DistributorFieldErrors = Partial<
  Record<keyof DistributorFormValues, string>
>;

export type DistributorFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors: DistributorFieldErrors;
};

export const initialDistributorFormState: DistributorFormState = {
  status: "idle",
  fieldErrors: {},
};

export const emptyDistributorFormValues: DistributorFormValues = {
  organizationName: "",
  contactPerson: "",
  email: "",
  organizationType: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  copies: "",
};

export function getDistributorSubscriptionType(
  organizationType: OrganizationType,
): Exclude<SubscriptionType, "individual"> {
  return organizationType === "salon" ? "salon" : "school";
}

export function getSubscriptionChannel(
  type: SubscriptionType,
): SubscriptionChannel {
  return type === "individual" ? "digital" : "physical";
}

export function getSubscriptionDisplayName(subscription: Subscription) {
  if (subscription.type === "individual") {
    const name = [subscription.firstName, subscription.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || subscription.email;
  }

  return subscription.organizationName ?? subscription.email;
}

export function formatSubscriptionAddress(subscription: {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}) {
  const street = [subscription.addressLine1, subscription.addressLine2]
    .filter(Boolean)
    .join(", ");
  const region = [subscription.city, subscription.state]
    .filter(Boolean)
    .join(", ");
  const locality = [region, subscription.zipCode].filter(Boolean).join(" ");

  return [street, locality].filter(Boolean).join(" · ");
}
