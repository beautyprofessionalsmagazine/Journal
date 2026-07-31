import { PublicInfoPage } from "@/shared/components/public";
import { ButtonLink } from "@/shared/components/ui";

export function AccountPage() {
  return (
    <PublicInfoPage
      description="Reader and contributor account access will live here when authentication is connected."
      title="Account"
    >
      <div className="max-w-2xl border-y border-black py-10">
        <p className="editorial-kicker text-black/45">Access not yet open</p>
        <h2 className="mt-4 [font-family:var(--font-editorial-title)] text-[clamp(2rem,5vw,3.6rem)] font-bold leading-none">
          Reader accounts are still in development.
        </h2>
        <p className="mt-5 text-sm leading-7 text-black/62">
          No credentials are being collected at this stage. The public
          Journal remains available without an account.
        </p>
        <ButtonLink className="mt-7" href="/articles">
          Continue reading
        </ButtonLink>
      </div>
    </PublicInfoPage>
  );
}
