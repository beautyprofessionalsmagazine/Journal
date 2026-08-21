"use client";

import { AlertCircle, Check, Plus, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { createDistributorAction } from "@/features/subscriptions/server/subscription-actions";
import {
  emptyDistributorFormValues,
  initialDistributorFormState,
  organizationTypeLabels,
  organizationTypeValues,
} from "@/features/subscriptions/types/subscription";
import { usStateSelectOptions } from "@/shared/config/us-states";
import { Button, FormField, Select } from "@/shared/components/ui";

const organizationTypeOptions = organizationTypeValues.map((value) => ({
  label: organizationTypeLabels[value],
  value,
}));

export function AddDistributorButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        size="lg"
        variant="secondary"
      >
        <Plus aria-hidden="true" size={15} />
        Add distributor
      </Button>
      {isOpen ? <AddDistributorDialog onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

function AddDistributorDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(
    createDistributorAction,
    initialDistributorFormState,
  );
  const [values, setValues] = useState(emptyDistributorFormValues);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    firstFieldRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // A successful save clears the form so the desk can type the next address.
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);

    if (state.status === "success") {
      setValues(emptyDistributorFormValues);
    }
  }

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-[max(1rem,6vh)]"
      onPointerDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby="add-distributor-heading"
        aria-modal="true"
        className="w-full max-w-xl border border-black bg-white"
        ref={panelRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black px-5 py-4">
          <div>
            <p className="editorial-kicker text-black/45">Distribution desk</p>
            <h2
              className="mt-1 [font-family:var(--font-editorial-title)] text-2xl font-bold leading-none"
              id="add-distributor-heading"
            >
              Add distributor
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-black/55">
              Added by hand, skipping the approval queue — the address point
              goes live on the map right away.
            </p>
          </div>
          <Button
            aria-label="Close"
            className="shrink-0"
            onClick={onClose}
            variant="icon"
          >
            <X aria-hidden="true" size={18} />
          </Button>
        </div>

        <form action={formAction} className="p-5" noValidate>
          {state.message ? (
            <div
              className={`mb-5 flex items-start gap-3 border px-4 py-3 text-sm leading-6 ${
                state.status === "success"
                  ? "border-black bg-black/[0.04] text-black"
                  : "border-red-700 bg-red-50 text-red-900"
              }`}
              role="alert"
            >
              {state.status === "success" ? (
                <Check aria-hidden="true" className="mt-1 shrink-0" size={16} />
              ) : (
                <AlertCircle
                  aria-hidden="true"
                  className="mt-1 shrink-0"
                  size={16}
                />
              )}
              <p>{state.message}</p>
            </div>
          ) : null}

          <fieldset className="grid gap-4 border-0 p-0" disabled={isPending}>
            <legend className="sr-only">Distributor details</legend>

            <FormField
              error={state.fieldErrors.organizationName}
              help="Shown as the location name on the public map."
              id="add-distributor-name"
              label="Organization name"
              required
            >
              <input
                aria-invalid={Boolean(state.fieldErrors.organizationName)}
                className="input-control"
                id="add-distributor-name"
                name="organizationName"
                onChange={(event) =>
                  updateField("organizationName", event.target.value)
                }
                placeholder="Maison Beauty Studio"
                ref={firstFieldRef}
                required
                value={values.organizationName}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                error={state.fieldErrors.organizationType}
                help="A salon is filed as a salon subscription; everything else as a school / company one."
                id="add-distributor-organization-type"
                label="Organization type"
                required
              >
                <Select
                  id="add-distributor-organization-type"
                  invalid={Boolean(state.fieldErrors.organizationType)}
                  name="organizationType"
                  onChange={(value) => updateField("organizationType", value)}
                  options={organizationTypeOptions}
                  placeholder="Select a type"
                  required
                  value={values.organizationType}
                />
              </FormField>

              <FormField
                error={state.fieldErrors.copies}
                help="Leave empty if the print run is not agreed yet."
                id="add-distributor-copies"
                label="Copies per issue"
              >
                <input
                  aria-invalid={Boolean(state.fieldErrors.copies)}
                  className="input-control"
                  id="add-distributor-copies"
                  inputMode="numeric"
                  name="copies"
                  onChange={(event) =>
                    updateField("copies", event.target.value)
                  }
                  placeholder="10"
                  value={values.copies}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                error={state.fieldErrors.contactPerson}
                id="add-distributor-contact"
                label="Contact person"
              >
                <input
                  className="input-control"
                  id="add-distributor-contact"
                  name="contactPerson"
                  onChange={(event) =>
                    updateField("contactPerson", event.target.value)
                  }
                  placeholder="Dana Reyes"
                  value={values.contactPerson}
                />
              </FormField>

              <FormField
                error={state.fieldErrors.email}
                id="add-distributor-email"
                label="Email"
                required
              >
                <input
                  aria-invalid={Boolean(state.fieldErrors.email)}
                  className="input-control"
                  id="add-distributor-email"
                  name="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="desk@example.com"
                  required
                  type="email"
                  value={values.email}
                />
              </FormField>
            </div>

            <FormField
              error={state.fieldErrors.addressLine1}
              id="add-distributor-address-line1"
              label="Street address"
              required
            >
              <input
                aria-invalid={Boolean(state.fieldErrors.addressLine1)}
                className="input-control"
                id="add-distributor-address-line1"
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
              error={state.fieldErrors.addressLine2}
              id="add-distributor-address-line2"
              label="Address line 2"
            >
              <input
                className="input-control"
                id="add-distributor-address-line2"
                name="addressLine2"
                onChange={(event) =>
                  updateField("addressLine2", event.target.value)
                }
                placeholder="Suite 400"
                value={values.addressLine2}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                error={state.fieldErrors.city}
                id="add-distributor-city"
                label="City"
                required
              >
                <input
                  aria-invalid={Boolean(state.fieldErrors.city)}
                  className="input-control"
                  id="add-distributor-city"
                  name="city"
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Los Angeles"
                  required
                  value={values.city}
                />
              </FormField>

              <FormField
                error={state.fieldErrors.state}
                id="add-distributor-state"
                label="State"
                required
              >
                <Select
                  id="add-distributor-state"
                  invalid={Boolean(state.fieldErrors.state)}
                  name="state"
                  onChange={(value) => updateField("state", value)}
                  options={usStateSelectOptions}
                  placeholder="State"
                  required
                  value={values.state}
                />
              </FormField>

              <FormField
                error={state.fieldErrors.zipCode}
                id="add-distributor-zip"
                label="ZIP Code"
                required
              >
                <input
                  aria-invalid={Boolean(state.fieldErrors.zipCode)}
                  className="input-control"
                  id="add-distributor-zip"
                  inputMode="numeric"
                  name="zipCode"
                  onChange={(event) =>
                    updateField("zipCode", event.target.value)
                  }
                  placeholder="90017"
                  required
                  value={values.zipCode}
                />
              </FormField>
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button onClick={onClose} size="lg" type="button" variant="secondary">
              Close
            </Button>
            <Button
              isLoading={isPending}
              loadingLabel="Adding…"
              size="lg"
              type="submit"
            >
              Add distributor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
