import { HomeDistribution } from "@/features/home/components/HomeDistribution";
import { HomeEditorialLead } from "@/features/home/components/HomeEditorialLead";

export function HomePage() {
  return (
    <main>
      <HomeEditorialLead />
      <HomeDistribution />
    </main>
  );
}
