"use client";

import { AlertCircle, Check, Send } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { createSubscriptionAction } from "@/features/subscriptions/server/subscription-actions";
import {
  emptySubscriptionFormValues,
  initialSubscriptionFormState,
  organizationTypeLabels,
  salonCopiesOptions,
  schoolCopiesOptions,
  schoolOrganizationTypeValues,
  type SubscriptionFormValues,
  type SubscriptionType,
} from "@/features/subscriptions/types/subscription";
import { usStateSelectOptions } from "@/shared/config/us-states";
import { Button, FormField, Select } from "@/shared/components/ui";

type SubscriptionFormProps = {
  type: SubscriptionType;
  /** Remounts the form so the action state and every field start clean. */
  onReset: () => void;
};

const submitLabels: Record<SubscriptionType, string> = {
  individual: "Send my subscription",
  salon: "Request salon copies",
  school: "Request bulk delivery",
};

export function SubscriptionForm({ type, onReset }: SubscriptionFormProps) {
  const action = useMemo(
    () => createSubscriptionAction.bind(null, type),
    [type],
  );
  const [state, formAction, isPending] = useActionState(
    action,
    initialSubscriptionFormState,
  );
  const [values, setValues] = useState<SubscriptionFormValues>(
    emptySubscriptionFormValues,
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof SubscriptionFormValues, boolean>>
  >({});

  const isOrganization = type !== "individual";
  const copiesOptions = type === "salon" ? salonCopiesOptions : schoolCopiesOptions;

  function updateField<Key extends keyof SubscriptionFormValues>(
    field: Key,
    value: SubscriptionFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function getError(field: keyof SubscriptionFormValues) {
    return touched[field] ? undefined : state.fieldErrors[field];
  }

  if (state.status === "success") {
    return (
      <div
        className="border border-black bg-white p-[clamp(1.5rem,4vw,3rem)]"
        role="status"
      >
        <span className="inline-flex size-11 items-center justify-center border border-black bg-black text-white">
          <Check aria-hidden="true" size={20} strokeWidth={2} />
        </span>
        <h3 className="mt-6 [font-family:var(--font-editorial-title)] text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95]">
          Request received
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-black/64">
          {state.message}
        </p>
        <Button className="mt-7" onClick={onReset} size="lg" variant="secondary">
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="min-w-0" noValidate>
      {state.status === "error" && state.message ? (
        <div
          className="mb-7 flex items-start gap-3 border border-red-700 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-1 shrink-0" size={18} />
          <p>{state.message}</p>
        </div>
      ) : null}

      <fieldset className="min-w-0 border-0 p-0" disabled={isPending}>
        <legend className="sr-only">
          {isOrganization ? "Organization details" : "Your details"}
        </legend>

        <FieldsetHeading
          label={isOrganization ? "Organization" : "Professional"}
        />

        <div className="grid gap-5 md:grid-cols-2">
          {isOrganization ? (
            <>
              <FormField
                error={getError("organizationName")}
                id="subscription-organization-name"
                label={type === "salon" ? "Salon name" : "Organization name"}
                required
              >
                <input
                  aria-invalid={Boolean(getError("organizationName"))}
                  autoComplete="organization"
                  className="input-control"
                  id="subscription-organization-name"
                  name="organizationName"
                  onChange={(event) =>
                    updateField("organizationName", event.target.value)
                  }
                  placeholder={
                    type === "salon" ? "Bella Beauty Salon" : "Luxury Med Spa"
                  }
                  required
                  value={values.organizationName}
                />
              </FormField>

              <FormField
                error={getError("contactPerson")}
                id="subscription-contact-person"
                label="Contact person"
                required
              >
                <input
                  aria-invalid={Boolean(getError("contactPerson"))}
                  autoComplete="name"
                  className="input-control"
                  id="subscription-contact-person"
                  name="contactPerson"
                  onChange={(event) =>
                    updateField("contactPerson", event.target.value)
                  }
                  placeholder="Full name"
                  required
                  value={values.contactPerson}
                />
              </FormField>
            </>
          ) : (
            <>
              <FormField
                error={getError("firstName")}
                id="subscription-first-name"
                label="First name"
                required
              >
                <input
                  aria-invalid={Boolean(getError("firstName"))}
                  autoComplete="given-name"
                  className="input-control"
                  id="subscription-first-name"
                  name="firstName"
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                  placeholder="First name"
                  required
                  value={values.firstName}
                />
              </FormField>

              <FormField
                error={getError("lastName")}
                id="subscription-last-name"
                label="Last name"
                required
              >
                <input
                  aria-invalid={Boolean(getError("lastName"))}
                  autoComplete="family-name"
                  className="input-control"
                  id="subscription-last-name"
                  name="lastName"
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                  placeholder="Last name"
                  required
                  value={values.lastName}
                />
              </FormField>
            </>
          )}

          <FormField
            error={getError("email")}
            help={
              isOrganization
                ? "Approval and shipping updates are sent here."
                : undefined
            }
            id="subscription-email"
            label="Email"
            required
          >
            <input
              aria-invalid={Boolean(getError("email"))}
              autoComplete="email"
              className="input-control"
              id="subscription-email"
              name="email"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={values.email}
            />
          </FormField>

          {type === "individual" ? (
            <FormField
              error={getError("profession")}
              id="subscription-profession"
              label="Profession"
              required
            >
              <input
                aria-invalid={Boolean(getError("profession"))}
                className="input-control"
                id="subscription-profession"
                list="subscription-profession-options"
                name="profession"
                onChange={(event) =>
                  updateField("profession", event.target.value)
                }
                placeholder="Hairstylist, esthetician, nail artist…"
                required
                value={values.profession}
              />
              <datalist id="subscription-profession-options">
                <option value="Hairstylist" />
                <option value="Barber" />
                <option value="Colorist" />
                <option value="Esthetician" />
                <option value="Nail artist" />
                <option value="Makeup artist" />
                <option value="Lash technician" />
                <option value="Massage therapist" />
                <option value="Salon owner" />
                <option value="Educator" />
              </datalist>
            </FormField>
          ) : null}

          {type === "school" ? (
            <FormField
              error={getError("organizationType")}
              id="subscription-organization-type"
              label="Organization type"
              required
            >
              <Select
                ariaDescribedBy={
                  getError("organizationType")
                    ? "subscription-organization-type-error"
                    : undefined
                }
                id="subscription-organization-type"
                invalid={Boolean(getError("organizationType"))}
                name="organizationType"
                onChange={(value) => updateField("organizationType", value)}
                options={schoolOrganizationTypeValues.map((value) => ({
                  label: organizationTypeLabels[value],
                  value,
                }))}
                placeholder="Select organization type"
                required
                value={values.organizationType}
              />
            </FormField>
          ) : null}
        </div>

        <FieldsetHeading
          className="mt-10"
          label={isOrganization ? "Shipping address" : "Postal address"}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            className="md:col-span-2"
            error={getError("addressLine1")}
            id="subscription-address-line1"
            label="Street address"
            required
          >
            <input
              aria-invalid={Boolean(getError("addressLine1"))}
              autoComplete="address-line1"
              className="input-control"
              id="subscription-address-line1"
              name="addressLine1"
              onChange={(event) =>
                updateField("addressLine1", event.target.value)
              }
              placeholder="1200 Wilshire Blvd"
              required
              value={values.addressLine1}
            />
          </FormField>

          <FormField
            className="md:col-span-2"
            error={getError("addressLine2")}
            help="Apartment, suite, floor, or unit."
            id="subscription-address-line2"
            label="Address line 2"
          >
            <input
              autoComplete="address-line2"
              className="input-control"
              id="subscription-address-line2"
              name="addressLine2"
              onChange={(event) =>
                updateField("addressLine2", event.target.value)
              }
              placeholder="Suite 400"
              value={values.addressLine2}
            />
          </FormField>

          <FormField
            error={getError("city")}
            id="subscription-city"
            label="City"
            required
          >
            <input
              aria-invalid={Boolean(getError("city"))}
              autoComplete="address-level2"
              className="input-control"
              id="subscription-city"
              name="city"
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="Los Angeles"
              required
              value={values.city}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              error={getError("state")}
              id="subscription-state"
              label="State"
              required
            >
              <Select
                ariaDescribedBy={
                  getError("state") ? "subscription-state-error" : undefined
                }
                id="subscription-state"
                invalid={Boolean(getError("state"))}
                name="state"
                onChange={(value) => updateField("state", value)}
                options={usStateSelectOptions}
                placeholder="Select a state"
                required
                value={values.state}
              />
            </FormField>

            <FormField
              error={getError("zipCode")}
              id="subscription-zip"
              label="ZIP Code"
              required
            >
              <input
                aria-invalid={Boolean(getError("zipCode"))}
                autoComplete="postal-code"
                className="input-control"
                id="subscription-zip"
                inputMode="numeric"
                name="zipCode"
                onChange={(event) => updateField("zipCode", event.target.value)}
                placeholder="90017"
                required
                value={values.zipCode}
              />
            </FormField>
          </div>
        </div>

        {isOrganization ? (
          <>
            <FieldsetHeading className="mt-10" label="Copies per issue" />
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                error={getError("copies")}
                help={
                  type === "salon"
                    ? "Copies delivered to your salon for every new issue."
                    : "Bulk quantities for schools, brands, distributors, and clinics."
                }
                id="subscription-copies"
                label="How many copies"
                required
              >
                <Select
                  ariaDescribedBy={
                    getError("copies") ? "subscription-copies-error" : undefined
                  }
                  id="subscription-copies"
                  invalid={Boolean(getError("copies"))}
                  name="copies"
                  onChange={(value) => updateField("copies", value)}
                  options={copiesOptions.map((count) => ({
                    label: `${count} copies`,
                    value: String(count),
                  }))}
                  placeholder="Select a quantity"
                  required
                  value={values.copies}
                />
              </FormField>
            </div>
          </>
        ) : null}

        <div className="mt-10 border-t border-black/15 pt-7">
          <label
            className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-black/70"
            htmlFor="subscription-email-consent"
          >
            <input
              aria-invalid={Boolean(getError("emailConsent"))}
              checked={values.emailConsent}
              className="mt-0.5 size-5 shrink-0 accent-black"
              id="subscription-email-consent"
              name="emailConsent"
              onChange={(event) =>
                updateField("emailConsent", event.target.checked)
              }
              required={type === "individual"}
              type="checkbox"
            />
            <span>
              I agree to receive Beauty Professionals Magazine and related news
              by email.
              {type === "individual" ? (
                <span aria-hidden="true"> *</span>
              ) : (
                <span className="text-black/45"> (optional)</span>
              )}
            </span>
          </label>
          {getError("emailConsent") ? (
            <p
              className="mt-2 text-xs leading-5 text-red-700"
              id="subscription-email-consent-error"
              role="alert"
            >
              {getError("emailConsent")}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-black/48">
              You can unsubscribe at any time. We never share your address.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            className="min-w-56"
            isLoading={isPending}
            loadingLabel="Sending…"
            size="lg"
            type="submit"
          >
            <Send aria-hidden="true" size={16} />
            {submitLabels[type]}
          </Button>
          <p className="[font-family:var(--font-editorial-body-sans)] text-xs italic text-black/55">
            Subscriptions are free. Requests are reviewed by the editorial desk.
          </p>
        </div>
      </fieldset>
    </form>
  );
}

type FieldsetHeadingProps = {
  label: string;
  className?: string;
};

function FieldsetHeading({ label, className }: FieldsetHeadingProps) {
  return (
    <p
      className={`editorial-kicker mb-5 border-b border-black/15 pb-3 text-black/45 ${className ?? ""}`}
    >
      {label}
    </p>
  );
}
