import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function ContactsPage() {
  return (
    <PublicLayout>
      <InfoPage
        description="For editorial, partnership, and general inquiries, use the contact channel that will be connected to the publishing workflow."
        title="Contacts"
      >
        <div className="border-y border-black/15 py-12">
          <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
            Contact details will be published here when the magazine opens submissions.
          </p>
        </div>
      </InfoPage>
    </PublicLayout>
  );
}
