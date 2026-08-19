import { type ZodError, z } from "zod";

import {
  salonCopiesOptions,
  schoolCopiesOptions,
  schoolOrganizationTypeValues,
  type SubscriptionFieldErrors,
  type SubscriptionFormValues,
  type SubscriptionType,
} from "@/features/subscriptions/types/subscription";
import { usStateCodes } from "@/shared/config/us-states";

const zipPattern = /^\d{5}(?:-\d{4})?$/;

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .toLowerCase();

const stateField = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => usStateCodes.includes(value as never), {
    message: "Select a state.",
  });

const zipField = z
  .string()
  .trim()
  .refine((value) => zipPattern.test(value), {
    message: "Enter a valid ZIP Code (12345 or 12345-6789).",
  });

const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value ? value : null));

const addressFields = {
  addressLine1: z.string().trim().min(1, "Street address is required."),
  addressLine2: optionalText,
  city: z.string().trim().min(1, "City is required."),
  state: stateField,
  zipCode: zipField,
};

const individualSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: emailField,
  profession: z.string().trim().min(1, "Profession is required."),
  ...addressFields,
  emailConsent: z.literal(true, {
    message: "Please confirm you agree to receive the magazine by email.",
  }),
});

const salonSchema = z.object({
  organizationName: z.string().trim().min(1, "Salon name is required."),
  contactPerson: z.string().trim().min(1, "Contact person is required."),
  email: emailField,
  ...addressFields,
  copies: copiesField(salonCopiesOptions),
  emailConsent: z.boolean(),
});

const schoolSchema = z.object({
  organizationName: z.string().trim().min(1, "Organization name is required."),
  contactPerson: z.string().trim().min(1, "Contact person is required."),
  email: emailField,
  organizationType: z.enum(schoolOrganizationTypeValues, {
    message: "Select an organization type.",
  }),
  ...addressFields,
  copies: copiesField(schoolCopiesOptions),
  emailConsent: z.boolean(),
});

export type IndividualSubscriptionInput = z.infer<typeof individualSchema>;
export type SalonSubscriptionInput = z.infer<typeof salonSchema>;
export type SchoolSubscriptionInput = z.infer<typeof schoolSchema>;

export type SubscriptionInput =
  | ({ type: "individual" } & IndividualSubscriptionInput)
  | ({ type: "salon" } & SalonSubscriptionInput)
  | ({ type: "school" } & SchoolSubscriptionInput);

export function validateSubscription(
  type: SubscriptionType,
  values: SubscriptionFormValues,
) {
  if (type === "individual") {
    return individualSchema.safeParse(values);
  }

  if (type === "salon") {
    return salonSchema.safeParse(values);
  }

  return schoolSchema.safeParse(values);
}

export function getSubscriptionFromFormData(
  formData: FormData,
): SubscriptionFormValues {
  return {
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    email: readString(formData, "email"),
    profession: readString(formData, "profession"),
    organizationName: readString(formData, "organizationName"),
    contactPerson: readString(formData, "contactPerson"),
    organizationType: readString(formData, "organizationType"),
    addressLine1: readString(formData, "addressLine1"),
    addressLine2: readString(formData, "addressLine2"),
    city: readString(formData, "city"),
    state: readString(formData, "state"),
    zipCode: readString(formData, "zipCode"),
    copies: readString(formData, "copies"),
    emailConsent: formData.get("emailConsent") === "on" ||
      formData.get("emailConsent") === "true",
  };
}

export function getSubscriptionFieldErrors(error: ZodError) {
  const flattened = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const fieldErrors: SubscriptionFieldErrors = {};

  for (const [fieldName, messages] of Object.entries(flattened)) {
    const firstMessage = messages?.[0];

    if (firstMessage) {
      fieldErrors[fieldName as keyof SubscriptionFieldErrors] = firstMessage;
    }
  }

  return fieldErrors;
}

function copiesField(allowed: readonly number[]) {
  return z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => allowed.includes(value), {
      message: `Choose one of the available quantities: ${allowed.join(", ")}.`,
    });
}

function readString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value : "";
}
