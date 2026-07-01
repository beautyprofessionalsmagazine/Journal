import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function PhotoVoguePage() {
  return (
    <PublicLayout>
      <InfoPage
        description="A visual project page for future image-led editorials, portfolios, and beauty community submissions."
        title="PhotoVogue"
      >
        <div className="border-y border-black/15 py-12">
          <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
            No photo projects have been published yet.
          </p>
        </div>
      </InfoPage>
    </PublicLayout>
  );
}
