export type SiteSettings = {
  id: string;
  officeName: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SiteSettingsFormValues = {
  officeName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
};

export type SiteSettingsFieldErrors = Partial<
  Record<keyof SiteSettingsFormValues, string>
>;

export type SiteSettingsFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors: SiteSettingsFieldErrors;
};

export const initialSiteSettingsFormState: SiteSettingsFormState = {
  status: "idle",
  fieldErrors: {},
};

export function getSiteSettingsFormValues(
  settings: SiteSettings | null,
): SiteSettingsFormValues {
  return {
    officeName: settings?.officeName ?? "IBPA Office",
    addressLine1: settings?.addressLine1 ?? "",
    addressLine2: settings?.addressLine2 ?? "",
    city: settings?.city ?? "",
    state: settings?.state ?? "",
    zipCode: settings?.zipCode ?? "",
  };
}
