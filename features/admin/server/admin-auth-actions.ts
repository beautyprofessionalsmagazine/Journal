"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  verifyAdminPassword,
} from "@/features/admin/server/admin-auth";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdminAction(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = formData.get("password");

  if (
    typeof password !== "string" ||
    !(await verifyAdminPassword(password))
  ) {
    return {
      error: "Incorrect password.",
    };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
