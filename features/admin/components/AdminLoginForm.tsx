"use client";

import { useActionState } from "react";

import {
  loginAdminAction,
  type AdminLoginState,
} from "@/features/admin/server/admin-auth-actions";
import { Button } from "@/shared/components/ui";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdminAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
        Password
        <input
          aria-describedby={state.error ? "admin-login-error" : undefined}
          aria-invalid={Boolean(state.error)}
          autoComplete="current-password"
          autoFocus
          className="min-h-12 border border-black/25 bg-white px-4 text-base font-normal normal-case outline-none transition focus:border-black"
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p
          className="[font-family:var(--font-editorial-sans)] text-sm text-red-700"
          id="admin-login-error"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Button
        disabled={isPending}
        isLoading={isPending}
        loadingLabel="Signing in…"
        size="lg"
        type="submit"
      >
        Sign in
      </Button>
    </form>
  );
}
