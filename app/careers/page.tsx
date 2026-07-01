import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function CareersPage() {
  return (
    <PublicLayout>
      <InfoPage
        description="Open roles and contributor opportunities will be listed here as the editorial team grows."
        title="Careers"
      >
        <div className="border-y border-black/15 py-12">
          <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
            There are no open roles posted right now.
          </p>
        </div>
      </InfoPage>
    </PublicLayout>
  );
}
