import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildLookbookMetadata,
  getLookbookEditionPath,
  resolveLookbookEdition,
} from "@/features/lookbook/seo/lookbook-seo";
import { SITE_URL } from "@/shared/seo/site";

// Parsed metadata and JSON-LD are inspected loosely on purpose in these assertions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

// Newest first, as getLookbooks() returns them.
const lookbooks = [
  { issueYear: 2026, issueMonth: 9 },
  { issueYear: 2026, issueMonth: 8 },
  { issueYear: 2025, issueMonth: 12 },
];

describe("resolveLookbookEdition", () => {
  it("shows the newest edition when nothing is requested", () => {
    assert.deepEqual(resolveLookbookEdition({ lookbooks }), {
      edition: lookbooks[0],
      isNewest: true,
    });
  });

  it("shows an older edition when it exists", () => {
    const resolved = resolveLookbookEdition({ lookbooks, requestedYear: 2026, requestedMonth: 8 });

    assert.equal(resolved?.edition, lookbooks[1]);
    assert.equal(resolved?.isNewest, false);
  });

  it("falls back to the newest edition for unknown, invalid, or partial requests", () => {
    for (const request of [
      { requestedYear: 2024, requestedMonth: 1 },
      { requestedYear: 2026, requestedMonth: 13 },
      { requestedYear: Number.NaN, requestedMonth: 8 },
      { requestedYear: 2026 },
      { requestedMonth: 8 },
    ]) {
      assert.equal(resolveLookbookEdition({ lookbooks, ...request })?.isNewest, true);
    }
  });

  it("resolves to nothing before the first edition exists", () => {
    assert.equal(resolveLookbookEdition({ lookbooks: [] }), null);
  });
});

describe("buildLookbookMetadata", () => {
  it("canonicalizes the default view to /lookbook", () => {
    const metadata = buildLookbookMetadata({ lookbooks });

    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/lookbook`);
    assert.equal((metadata.robots as Loose).index, true);
  });

  it("canonicalizes the newest edition's own parameter URL to /lookbook too", () => {
    const metadata = buildLookbookMetadata({ lookbooks, requestedYear: 2026, requestedMonth: 9 });

    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/lookbook`);
  });

  it("makes an older edition a canonical page of its own", () => {
    const metadata = buildLookbookMetadata({ lookbooks, requestedYear: 2025, requestedMonth: 12 });

    assert.equal(
      metadata.alternates?.canonical,
      `${SITE_URL}${getLookbookEditionPath({ issueYear: 2025, issueMonth: 12 })}`,
    );
    assert.ok(JSON.stringify(metadata.title).includes("December 2025"));
  });

  it("does not mint canonical URLs from junk parameters", () => {
    const metadata = buildLookbookMetadata({ lookbooks, requestedYear: 1999, requestedMonth: 99 });

    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/lookbook`);
  });

  it("noindexes the empty state shown before the first edition is uploaded", () => {
    const metadata = buildLookbookMetadata({ lookbooks: [] });

    assert.equal((metadata.robots as Loose).index, false);
    assert.ok(!(metadata.alternates as Loose).canonical);
  });
});
