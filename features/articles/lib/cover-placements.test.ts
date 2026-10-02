import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  aspectsMatch,
  COVER_PLACEMENT_LIST,
  COVER_PLACEMENTS,
  coverFrameProps,
  coverImagePlacementValues,
  fitCropAreaToAspect,
  getCenteredCropArea,
  getRotatedSize,
  isAreaWithinBounds,
  isPositiveArea,
  normalizeQuarterTurn,
  type CropArea,
} from "@/features/articles/lib/cover-placements";

const SOURCES = {
  landscape: [1800, 1200],
  portrait: [1000, 1500],
  square: [1200, 1200],
  veryWide: [4000, 900],
  tall: [700, 2800],
} as const;

describe("cover placements", () => {
  it("lists every configured placement exactly once", () => {
    assert.deepEqual(
      [...coverImagePlacementValues].sort(),
      Object.keys(COVER_PLACEMENTS).sort(),
    );
    assert.equal(COVER_PLACEMENT_LIST.length, coverImagePlacementValues.length);
  });

  it("derives aspect from integer output dimensions", () => {
    for (const placement of COVER_PLACEMENT_LIST) {
      assert.ok(Number.isInteger(placement.width) && placement.width > 0);
      assert.ok(Number.isInteger(placement.height) && placement.height > 0);
      assert.equal(placement.aspect, placement.width / placement.height);
    }
  });

  it("exposes the same ratio to the frontend frame", () => {
    for (const placement of COVER_PLACEMENT_LIST) {
      const props = coverFrameProps(placement.id);
      assert.equal(props["data-cover-placement"], placement.id);
      assert.deepEqual(props.style, {
        "--cover-aspect": `${placement.width} / ${placement.height}`,
      });
    }
  });

  it("keeps the article hero portrait to match its desktop column", () => {
    const { width, height } = COVER_PLACEMENTS.articleHero;
    assert.ok(width < height);
  });
});

describe("crop geometry", () => {
  it("rejects zero, negative and non-finite areas", () => {
    assert.equal(isPositiveArea({ x: 0, y: 0, width: 0, height: 0 }), false);
    assert.equal(isPositiveArea({ x: 0, y: 0, width: 10, height: -1 }), false);
    assert.equal(isPositiveArea({ x: -1, y: 0, width: 10, height: 10 }), false);
    assert.equal(isPositiveArea({ x: 0, y: 0, width: Number.NaN, height: 1 }), false);
    assert.equal(isPositiveArea(null), false);
    assert.equal(isPositiveArea({ x: 0, y: 0, width: 1, height: 1 }), true);
  });

  for (const [name, [width, height]] of Object.entries(SOURCES)) {
    for (const placement of COVER_PLACEMENT_LIST) {
      it(`centers a ${placement.id} crop in a ${name} source`, () => {
        const area = getCenteredCropArea(width, height, placement.aspect);
        assertFitted(area, placement.aspect, width, height);
        // Largest possible: it touches both edges of one axis.
        assert.ok(area.width === width || area.height === height);
        assert.ok(Math.abs(area.x - (width - area.width - area.x)) <= 1);
        assert.ok(Math.abs(area.y - (height - area.height - area.y)) <= 1);
      });
    }
  }

  it("snaps arbitrary areas to the placement aspect, idempotently", () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    for (let run = 0; run < 2000; run += 1) {
      const sourceWidth = 50 + Math.floor(random() * 5000);
      const sourceHeight = 50 + Math.floor(random() * 5000);
      const area = {
        x: random() * sourceWidth,
        y: random() * sourceHeight,
        width: 1 + random() * sourceWidth,
        height: 1 + random() * sourceHeight,
      };
      for (const placement of COVER_PLACEMENT_LIST) {
        const fitted = fitCropAreaToAspect(
          area,
          placement.aspect,
          sourceWidth,
          sourceHeight,
        );
        assert.ok(isAreaWithinBounds(fitted, sourceWidth, sourceHeight));
        assert.deepEqual(
          fitCropAreaToAspect(fitted, placement.aspect, sourceWidth, sourceHeight),
          fitted,
        );
      }
    }
  });

  it("snaps rotations to quarter turns", () => {
    assert.equal(normalizeQuarterTurn(3.7), 0);
    assert.equal(normalizeQuarterTurn(-90), 270);
    assert.equal(normalizeQuarterTurn(450), 90);
    assert.equal(normalizeQuarterTurn(Number.NaN), 0);
    assert.deepEqual(getRotatedSize(300, 200, 90), { width: 200, height: 300 });
    assert.deepEqual(getRotatedSize(300, 200, 180), { width: 300, height: 200 });
  });
});

function assertFitted(
  area: CropArea,
  aspect: number,
  sourceWidth: number,
  sourceHeight: number,
) {
  assert.ok(isAreaWithinBounds(area, sourceWidth, sourceHeight), JSON.stringify(area));
  assert.ok(Number.isInteger(area.x) && Number.isInteger(area.width));
  // Whole-pixel rounding may move the ratio by at most one pixel's worth.
  assert.ok(
    aspectsMatch(area.width / area.height, aspect) ||
      Math.abs(area.width - area.height * aspect) <= 1,
    `${area.width}x${area.height} is not ${aspect}`,
  );
}
