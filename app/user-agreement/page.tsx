import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function UserAgreementPage() {
  return (
    <PublicLayout>
      <InfoPage
        description="Terms for using the Beauty Professionals Magazine website will be maintained here."
        title="User Agreement"
      />
    </PublicLayout>
  );
}
