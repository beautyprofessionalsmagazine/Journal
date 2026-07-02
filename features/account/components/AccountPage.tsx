import { PublicInfoPage } from "@/shared/components/public";

export function AccountPage() {
  return (
    <PublicInfoPage
      description="Reader and contributor account access will live here when authentication is connected."
      title="Account"
    >
      <div className="max-w-md border border-black/15 p-5">
        <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
          Email
          <input
            className="input-control"
            placeholder="name@example.com"
            type="email"
          />
        </label>
        <button className="mt-5 border border-black bg-black px-5 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-white">
          Continue
        </button>
      </div>
    </PublicInfoPage>
  );
}
