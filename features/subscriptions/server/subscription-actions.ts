"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { subscriptionsTable } from "@/features/subscriptions/db/subscription-schema";
import {
  sendSubscriptionAdminNotification,
  sendSubscriptionApprovedEmail,
  sendSubscriptionReceivedEmail,
} from "@/features/subscriptions/server/subscription-email";
import { getSubscriptionById } from "@/features/subscriptions/server/subscription-queries";
import {
  getDistributorSubscriptionType,
  subscriptionDeliveryStatusValues,
  subscriptionStatusValues,
  type DistributorFormState,
  type Subscription,
  type SubscriptionDeliveryStatus,
  type SubscriptionFormState,
  type SubscriptionStatus,
  type SubscriptionType,
} from "@/features/subscriptions/types/subscription";
import {
  getDistributorFieldErrors,
  getDistributorFromFormData,
  getSubscriptionFieldErrors,
  getSubscriptionFromFormData,
  validateDistributor,
  validateSubscription,
  type IndividualSubscriptionInput,
  type SalonSubscriptionInput,
  type SchoolSubscriptionInput,
} from "@/features/subscriptions/validation/subscription-validation";
import { db } from "@/shared/lib/db";

const successMessages: Record<SubscriptionType, string> = {
  individual:
    "Thank you. Your subscription request is in — watch your inbox for confirmation.",
  salon:
    "Thank you. Once approved, your salon becomes an Official Distribution Partner and appears on the Where to Find map.",
  school:
    "Thank you. The editorial desk will confirm your bulk delivery and add you to the distribution map.",
};

export async function createSubscriptionAction(
  type: SubscriptionType,
  _previousState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const values = getSubscriptionFromFormData(formData);
  const parsed = validateSubscription(type, values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: getSubscriptionFieldErrors(parsed.error),
    };
  }

  let subscription: Subscription;

  try {
    const [record] = await db
      .insert(subscriptionsTable)
      .values(buildInsertValues(type, parsed.data))
      .returning();

    subscription = record;
  } catch (error) {
    console.error("[subscriptions] Failed to store subscription.", error);

    return {
      status: "error",
      message: "Unable to save your subscription right now. Please try again.",
      fieldErrors: {},
    };
  }

  // Delivery is best-effort: a mail outage must never lose a submission.
  await Promise.allSettled([
    sendSubscriptionReceivedEmail(subscription),
    sendSubscriptionAdminNotification(subscription),
  ]);

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/distributors");

  return {
    status: "success",
    message: successMessages[type],
    fieldErrors: {},
  };
}

/**
 * Adds a distributor the desk already agreed with off-site. It skips the
 * approval queue — and the confirmation emails that go with it — and is
 * published on the map straight away.
 */
export async function createDistributorAction(
  _previousState: DistributorFormState,
  formData: FormData,
): Promise<DistributorFormState> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const parsed = validateDistributor(getDistributorFromFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: getDistributorFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;

  try {
    await db.insert(subscriptionsTable).values({
      type: getDistributorSubscriptionType(values.organizationType),
      status: "active",
      deliveryStatus: "prepare",
      email: values.email,
      organizationName: values.organizationName,
      contactPerson: values.contactPerson,
      organizationType: values.organizationType,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.state,
      zipCode: values.zipCode,
      copies: values.copies,
      emailConsent: false,
    });
  } catch (error) {
    console.error("[subscriptions] Failed to add distributor.", error);

    return {
      status: "error",
      message: "Unable to add this distributor right now. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/admin/distributors");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/where-to-find");
  revalidatePath("/");

  return {
    status: "success",
    message: `${values.organizationName} is on the map.`,
    fieldErrors: {},
  };
}

export async function updateSubscriptionStatusAction(
  id: string,
  status: SubscriptionStatus,
) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  if (!subscriptionStatusValues.includes(status)) {
    return { ok: false as const, message: "Unknown subscription status." };
  }

  const current = await getSubscriptionById(id);

  if (!current) {
    return { ok: false as const, message: "This subscription no longer exists." };
  }

  const [subscription] = await db
    .update(subscriptionsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(subscriptionsTable.id, id))
    .returning();

  if (subscription && current.status !== "active" && status === "active") {
    await Promise.allSettled([sendSubscriptionApprovedEmail(subscription)]);
  }

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/distributors");
  revalidatePath("/where-to-find");
  revalidatePath("/");

  return { ok: true as const };
}

export async function updateSubscriptionDeliveryStatusAction(
  id: string,
  deliveryStatus: SubscriptionDeliveryStatus,
) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  if (!subscriptionDeliveryStatusValues.includes(deliveryStatus)) {
    return { ok: false as const, message: "Unknown delivery status." };
  }

  await db
    .update(subscriptionsTable)
    .set({ deliveryStatus, updatedAt: new Date() })
    .where(eq(subscriptionsTable.id, id));

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/distributors");

  return { ok: true as const };
}

type SubscriptionInsert = typeof subscriptionsTable.$inferInsert;

/**
 * `validateSubscription` selects the schema from `type`, so the narrowing casts
 * below are guaranteed by the branch they sit in.
 */
function buildInsertValues(
  type: SubscriptionType,
  input:
    | IndividualSubscriptionInput
    | SalonSubscriptionInput
    | SchoolSubscriptionInput,
): SubscriptionInsert {
  const base = {
    type,
    status: "pending" as const,
    deliveryStatus: "prepare" as const,
    email: input.email,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2,
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
    emailConsent: input.emailConsent === true,
  };

  if (type === "individual") {
    const individual = input as IndividualSubscriptionInput;

    return {
      ...base,
      firstName: individual.firstName,
      lastName: individual.lastName,
      profession: individual.profession,
    };
  }

  if (type === "salon") {
    const salon = input as SalonSubscriptionInput;

    return {
      ...base,
      organizationName: salon.organizationName,
      contactPerson: salon.contactPerson,
      organizationType: "salon",
      copies: salon.copies,
    };
  }

  const school = input as SchoolSubscriptionInput;

  return {
    ...base,
    organizationName: school.organizationName,
    contactPerson: school.contactPerson,
    organizationType: school.organizationType,
    copies: school.copies,
  };
}
