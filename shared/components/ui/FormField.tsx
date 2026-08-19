import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  error?: string;
  help?: string;
  meta?: string;
  required?: boolean;
};

export function FormField({
  id,
  label,
  children,
  className,
  error,
  help,
  meta,
  required = false,
}: FormFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 flex min-h-4 items-center justify-between gap-3">
        <label
          className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]"
          htmlFor={id}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
        {meta ? (
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-black/42">
            {meta}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          className="mt-2 text-xs leading-5 text-red-700"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : help ? (
        <p className="mt-2 text-xs leading-5 text-black/48" id={`${id}-help`}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
