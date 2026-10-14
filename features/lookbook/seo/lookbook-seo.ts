import type { Metadata } from "next";

import {
  getLookbookIssueLabel,
  isValidLookbookIssue,
} from "@/features/lookbook/lib/lookbook-issue";
import type { Lookbook } from "@/features/lookbook/types/lookbook";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Edition = Pick<Lookbook, "issueYear" | "issueMonth">;

export type LookbookSeoInput = {
  /** Every edition, newest first (the order `getLookbooks` returns). */
  lookbooks: readonly Edition[];
  /** The `?year=` / `?month=` the visitor asked for, as numbers when present. */
  requestedYear?: number;
  requestedMonth?: number;
};

const LOOKBOOK_DESCRIPTION =
  "Browse Beauty Professionals Magazine Lookbooks by year and month.";

export function getLookbookEditionPath(edition: Edition) {
  return `/lookbook?year=${edition.issueYear}&month=${edition.issueMonth}`;
}

/**
 * Picks the edition the page will actually show, mirroring LookbookPage: the
 * requested year and month when that edition exists, otherwise the newest.
 */
export function resolveLookbookEdition(
  input: LookbookSeoInput,
): { edition: Edition; isNewest: boolean } | null {
  const [newest] = input.lookbooks;

  if (!newest) {
    return null;
  }

  const requested =
    input.requestedYear !== undefined &&
    input.requestedMonth !== undefined &&
    isValidLookbookIssue(input.requestedYear, input.requestedMonth)
      ? input.lookbooks.find(
          (edition) =>
            edition.issueYear === input.requestedYear &&
            edition.issueMonth === input.requestedMonth,
        )
      : undefined;
  const edition = requested ?? newest;

  return { edition, isNewest: edition === newest };
}

/**
 * Metadata for /lookbook.
 *
 * - `/lookbook` always shows the newest edition, so the newest edition's own
 *   URL (`?year=&month=`) canonicalizes to `/lookbook`: one URL, one page.
 * - An older edition is a page of its own and is canonical to itself.
 * - Unknown or malformed `?year=` / `?month=` values fall back to the newest
 *   edition, so they canonicalize to `/lookbook` rather than minting URLs.
 * - Before the first edition is uploaded the page is an empty state: noindex.
 */
export function buildLookbookMetadata(input: LookbookSeoInput): Metadata {
  const resolved = resolveLookbookEdition(input);

  if (!resolved) {
    return buildPageMetadata({
      title: "Lookbook",
      description: LOOKBOOK_DESCRIPTION,
      noindex: true,
    });
  }

  const label = getLookbookIssueLabel(resolved.edition);

  if (resolved.isNewest) {
    return buildPageMetadata({
      title: "Lookbook",
      description: `${LOOKBOOK_DESCRIPTION} Read the latest edition, ${label}.`,
      path: "/lookbook",
    });
  }

  return buildPageMetadata({
    title: `Lookbook: ${label}`,
    description: `Read the ${label} edition of Beauty Professionals Magazine in the Lookbook archive.`,
    path: getLookbookEditionPath(resolved.edition),
  });
}
