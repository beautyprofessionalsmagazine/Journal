import { PublicInfoPage } from "@/shared/components/public";

export function VideoPage() {
  return (
    <PublicInfoPage
      description="A future home for interviews, behind-the-scenes reporting, and beauty industry video features."
      title="Video"
    >
      <div className="border-y border-black/15 py-12">
        <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          No videos have been published yet.
        </p>
      </div>
    </PublicInfoPage>
  );
}
