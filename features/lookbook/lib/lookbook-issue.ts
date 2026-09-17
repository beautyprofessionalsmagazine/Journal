import type { Lookbook } from "@/features/lookbook/types/lookbook";

export const LOOKBOOK_MIN_YEAR = 2000;

export const LOOKBOOK_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getLookbookMonthName(month: number) {
  return LOOKBOOK_MONTHS[month - 1] ?? "Unknown month";
}

export function getLookbookIssueLabel(
  issue: Pick<Lookbook, "issueYear" | "issueMonth">,
) {
  return `${getLookbookMonthName(issue.issueMonth)} ${issue.issueYear}`;
}

export function getLookbookIssueKey(
  issue: Pick<Lookbook, "issueYear" | "issueMonth">,
) {
  return `${issue.issueYear}-${String(issue.issueMonth).padStart(2, "0")}`;
}

export function isValidLookbookIssue(issueYear: number, issueMonth: number) {
  const maximumYear = new Date().getFullYear() + 1;

  return (
    Number.isInteger(issueYear) &&
    issueYear >= LOOKBOOK_MIN_YEAR &&
    issueYear <= maximumYear &&
    Number.isInteger(issueMonth) &&
    issueMonth >= 1 &&
    issueMonth <= 12
  );
}

export function sortLookbooksNewestFirst(a: Lookbook, b: Lookbook) {
  return b.issueYear - a.issueYear || b.issueMonth - a.issueMonth;
}
