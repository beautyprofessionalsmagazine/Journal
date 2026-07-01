import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function NewsletterPage() {
  return (
    <PublicLayout>
      <InfoPage
        description="Receive new interviews, professional notes, and issue updates from Beauty Professionals Magazine."
        title="Newsletter"
      >
        <form className="grid max-w-xl gap-4 border-y border-black/15 py-12 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="newsletter-email">
            Email
          </label>
          <input
            className="input-control"
            id="newsletter-email"
            placeholder="name@example.com"
            type="email"
          />
          <button
            className="border border-black bg-black px-5 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-white transition hover:bg-white hover:text-black"
            type="button"
          >
            Subscribe
          </button>
        </form>
      </InfoPage>
    </PublicLayout>
  );
}
