import { PublicInfoPage } from "@/shared/components/public";
import { ButtonLink } from "@/shared/components/ui";

export function NewsletterPage() {
  return (
    <PublicInfoPage
      description="Receive new interviews, professional notes, and issue updates from Beauty Professionals Magazine."
      title="Newsletter"
    >
      <div className="grid gap-6 border-y border-black py-10 md:grid-cols-[0.7fr_1.3fr] md:items-start">
        <p className="editorial-kicker text-black/45">Dispatch in progress</p>
        <div className="max-w-xl">
          <h2 className="[font-family:var(--font-editorial-title)] text-[clamp(2rem,5vw,3.6rem)] font-bold leading-none">
            A considered letter, not another daily alert.
          </h2>
          <p className="mt-5 text-sm leading-7 text-black/62">
            Subscription access will open with the next issue. Until then,
            follow the Journal archive or contact the editorial desk for
            publication updates.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/archive">
              Read the archive
            </ButtonLink>
            <ButtonLink href="/contacts" variant="secondary">
              Contact editorial
            </ButtonLink>
          </div>
        </div>
      </div>
    </PublicInfoPage>
  );
}
