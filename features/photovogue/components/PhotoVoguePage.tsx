import { PublicInfoPage } from "@/shared/components/public";

export function PhotoVoguePage() {
  return (
    <PublicInfoPage
      description="A visual project page for future image-led editorials, portfolios, and beauty community submissions."
      title="PhotoVogue"
    >
      <div className="border-y border-black/15 py-12">
        <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          No photo projects have been published yet.
        </p>
      </div>
    </PublicInfoPage>
  );
}
