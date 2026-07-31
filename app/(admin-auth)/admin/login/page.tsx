import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { hasAdminSession } from "@/features/admin/server/admin-auth";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-12 text-black">
      <section className="w-full max-w-md border border-black p-7 sm:p-10">
        <p className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.2em]">
          Beauty Professionals Magazine
        </p>
        <h1 className="mt-5 [font-family:var(--font-editorial-title)] text-5xl font-bold leading-none">
          Admin
        </h1>
        <p className="mt-4 [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          Enter the admin password to continue.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
