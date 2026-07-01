import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <InfoPage
        description="Privacy practices, data handling, and reader rights will be maintained here."
        title="Privacy Policy"
      />
    </PublicLayout>
  );
}
