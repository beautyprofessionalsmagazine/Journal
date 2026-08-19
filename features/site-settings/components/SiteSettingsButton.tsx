"use client";

import { AlertCircle, Check, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import { updateSiteSettingsAction } from "@/features/site-settings/server/site-settings-actions";
import {
  getSiteSettingsFormValues,
  initialSiteSettingsFormState,
  type SiteSettings,
} from "@/features/site-settings/types/site-settings";
import { usStateSelectOptions } from "@/shared/config/us-states";
import { Button, FormField, Select } from "@/shared/components/ui";

type SiteSettingsButtonProps = {
  settings: SiteSettings | null;
};

export function SiteSettingsButton({ settings }: SiteSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        size="lg"
        variant="secondary"
      >
        <MapPin aria-hidden="true" size={15} />
        Office address
      </Button>
      {isOpen ? (
        <SiteSettingsDialog
          onClose={() => setIsOpen(false)}
          settings={settings}
        />
      ) : null}
    </>
  );
}

type SiteSettingsDialogProps = {
  settings: SiteSettings | null;
  onClose: () => void;
};

function SiteSettingsDialog({ settings, onClose }: SiteSettingsDialogProps) {
  const [state, formAction, isPending] = useActionState(
    updateSiteSettingsAction,
    initialSiteSettingsFormState,
  );
  const [values, setValues] = useState(() =>
    getSiteSettingsFormValues(settings),
  );
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
        aria-labelledby="site-settings-heading"
        aria-modal="true"
        className="w-full max-w-xl border border-black bg-white"
        ref={panelRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black px-5 py-4">
          <div>
            <p className="editorial-kicker text-black/45">Site settings</p>
            <h2
              className="mt-1 [font-family:var(--font-editorial-title)] text-2xl font-bold leading-none"
              id="site-settings-heading"
            >
              Office address
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-black/55">
              This address is the anchor pin on the public distribution map.
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
            <legend className="sr-only">Office address</legend>

            <FormField
              error={state.fieldErrors.officeName}
              help="Shown as the location name on the map, e.g. IBPA Office."
              id="site-settings-office-name"
              label="Office name"
              required
            >
              <input
                aria-invalid={Boolean(state.fieldErrors.officeName)}
                className="input-control"
                id="site-settings-office-name"
                name="officeName"
                onChange={(event) =>
                  updateField("officeName", event.target.value)
                }
                placeholder="IBPA Office"
                ref={firstFieldRef}
                required
                value={values.officeName}
              />
            </FormField>

            <FormField
              error={state.fieldErrors.addressLine1}
              id="site-settings-address-line1"
              label="Street address"
              required
            >
              <input
                aria-invalid={Boolean(state.fieldErrors.addressLine1)}
                className="input-control"
                id="site-settings-address-line1"
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
              id="site-settings-address-line2"
              label="Address line 2"
            >
              <input
                className="input-control"
                id="site-settings-address-line2"
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
                id="site-settings-city"
                label="City"
                required
              >
                <input
                  aria-invalid={Boolean(state.fieldErrors.city)}
                  className="input-control"
                  id="site-settings-city"
                  name="city"
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Los Angeles"
                  required
                  value={values.city}
                />
              </FormField>

              <FormField
                error={state.fieldErrors.state}
                id="site-settings-state"
                label="State"
                required
              >
                <Select
                  id="site-settings-state"
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
                id="site-settings-zip"
                label="ZIP Code"
                required
              >
                <input
                  aria-invalid={Boolean(state.fieldErrors.zipCode)}
                  className="input-control"
                  id="site-settings-zip"
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
              loadingLabel="Saving…"
              size="lg"
              type="submit"
            >
              Save address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
