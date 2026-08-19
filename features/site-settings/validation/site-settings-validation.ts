import { type ZodError, z } from "zod";

import type {
  SiteSettingsFieldErrors,
  SiteSettingsFormValues,
} from "@/features/site-settings/types/site-settings";
import { usStateCodes } from "@/shared/config/us-states";

const zipPattern = /^\d{5}(?:-\d{4})?$/;

const siteSettingsSchema = z.object({
  officeName: z.string().trim().min(1, "Office name is required."),
  addressLine1: z.string().trim().min(1, "Street address is required."),
  addressLine2: z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value ? value : null)),
  city: z.string().trim().min(1, "City is required."),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => usStateCodes.includes(value as never), {
      message: "Select a US state.",
    }),
  zipCode: z
    .string()
    .trim()
    .refine((value) => zipPattern.test(value), {
      message: "Enter a valid ZIP Code (12345 or 12345-6789).",
    }),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export function validateSiteSettings(values: SiteSettingsFormValues) {
  return siteSettingsSchema.safeParse(values);
}

export function getSiteSettingsFromFormData(
  formData: FormData,
): SiteSettingsFormValues {
  return {
    officeName: readString(formData, "officeName"),
    addressLine1: readString(formData, "addressLine1"),
    addressLine2: readString(formData, "addressLine2"),
    city: readString(formData, "city"),
    state: readString(formData, "state"),
    zipCode: readString(formData, "zipCode"),
  };
}

export function getSiteSettingsFieldErrors(error: ZodError) {
  const flattened = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const fieldErrors: SiteSettingsFieldErrors = {};

  for (const [fieldName, messages] of Object.entries(flattened)) {
    const firstMessage = messages?.[0];

    if (firstMessage) {
      fieldErrors[fieldName as keyof SiteSettingsFieldErrors] = firstMessage;
    }
  }

  return fieldErrors;
}

function readString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value : "";
}
