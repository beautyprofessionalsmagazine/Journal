import { CategorySections } from "@/features/categories";

export function HomeFeaturedCategories() {
  return (
    <section className="border-t border-black bg-[#f6f4ef] py-[var(--section-space)]">
      <div className="site-container">
        <CategorySections />
      </div>
    </section>
  );
}
