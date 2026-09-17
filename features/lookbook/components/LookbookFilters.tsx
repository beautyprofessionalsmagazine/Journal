"use client";

import { useRouter } from "next/navigation";

import { Select } from "@/shared/components/ui";

type LookbookFiltersProps = {
  issuesByYear: Record<string, number[]>;
  selectedMonth: number;
  selectedYear: number;
};

export function LookbookFilters({
  issuesByYear,
  selectedMonth,
  selectedYear,
}: LookbookFiltersProps) {
  const router = useRouter();
  const years = Object.keys(issuesByYear).sort((a, b) => Number(b) - Number(a));
  const months = issuesByYear[String(selectedYear)] ?? [];

  function navigate(year: number, month: number) {
    router.push(`/lookbook?year=${year}&month=${month}`, { scroll: false });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[14rem_16rem_1fr_auto] lg:items-end">
      <Select
        id="lookbook-filter-year"
        label="Year"
        onChange={(value) => {
          const year = Number(value);
          navigate(year, issuesByYear[value]?.[0] ?? 1);
        }}
        options={years.map((year) => ({ value: year, label: year }))}
        value={String(selectedYear)}
      />
      <Select
        id="lookbook-filter-month"
        label="Month"
        onChange={(value) => navigate(selectedYear, Number(value))}
        options={months.map((month) => ({
          value: String(month),
          label: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
            new Date(2020, month - 1, 1),
          ),
        }))}
        value={String(selectedMonth)}
      />
      <p className="text-xs leading-5 text-black/48 lg:pb-3">
        {months.length} {months.length === 1 ? "edition" : "editions"} in {selectedYear}
      </p>
      <button
        className="focus-ring min-h-12 border border-black/20 bg-white px-5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition-colors hover:border-black hover:bg-black hover:text-white"
        onClick={() => router.push("/lookbook", { scroll: false })}
        type="button"
      >
        Latest issue
      </button>
    </div>
  );
}
