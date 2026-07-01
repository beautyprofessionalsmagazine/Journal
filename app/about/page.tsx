import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <InfoPage
        description="Beauty Professionals Magazine publishes interviews, industry notes, beauty reporting, and culture coverage for professionals and readers."
        title="About"
      />
    </PublicLayout>
  );
}
