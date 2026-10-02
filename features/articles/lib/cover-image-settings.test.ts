import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCoverImageSource,
  getSavedCropPixels,
  hasSavedCrop,
  isGeneratedImageCurrent,
  normalizeCoverImageData,
  normalizeCoverImageSettings,
  resolveCoverCrop,
} from "@/features/articles/lib/cover-image-settings";
import {
  aspectsMatch,
  COVER_PLACEMENTS,
  getCoverPlacement,
} from "@/features/articles/lib/cover-placements";

const SOURCE = "https://example.public.blob.vercel-storage.com/articles/source.png";

describe("legacy cover metadata", () => {
  it("treats the persisted zero-sized crop as un-framed and ignores its aspect", () => {
    const settings = normalizeCoverImageSettings({
      version: 3,
      crops: {
        articleHero: {
          x: 0,
          y: 0,
          zoom: 1,
          aspect: 1,
          rotation: 0,
          croppedArea: { x: 0, y: 0, width: 100, height: 100 },
          croppedAreaPixels: { x: 0, y: 0, width: 0, height: 0 },
        },
      },
      generatedImages: {
        articleHero: { url: `${SOURCE}?hero`, width: 1800, height: 1200 },
      },
    });

    assert.equal(settings.version, 4);
    assert.equal(hasSavedCrop(settings.crops.articleHero), false);
    assert.equal("aspect" in settings.crops.articleHero, false);
    // 1800x1200 is not the articleHero shape, so it must not be rendered.
    assert.equal(settings.generatedImages.articleHero, undefined);
  });

  it("fills empty `{}` crops and missing placements with defaults", () => {
    const settings = normalizeCoverImageSettings({
      version: 3,
      crops: { storyCard: {}, articleHero: {} },
      generationKey: null,
      generatedImages: {},
    });

    for (const crop of Object.values(settings.crops)) {
      assert.equal(hasSavedCrop(crop), false);
      assert.deepEqual(crop.croppedAreaPixels, { x: 0, y: 0, width: 0, height: 0 });
    }
    assert.equal(settings.generationKey, undefined);
  });

  it("keeps a real user crop untouched", () => {
    const crop = {
      x: 7.0933,
      y: 79.0912,
      zoom: 1.18,
      rotation: 0,
      croppedArea: { x: 6.4788, y: 11.5676, width: 84.7458, height: 52.891 },
      croppedAreaPixels: { x: 86, y: 163, width: 1119, height: 746 },
    };
    const settings = normalizeCoverImageSettings({
      version: 3,
      crops: { articleHero: { ...crop, aspect: 1.5 } },
    });

    assert.deepEqual(settings.crops.articleHero, crop);
    assert.equal(hasSavedCrop(settings.crops.articleHero), true);
  });

  it("snaps leaked free-angle rotations to quarter turns", () => {
    const settings = normalizeCoverImageSettings({
      crops: { storyCard: { rotation: 3.7 }, portraitRail: { rotation: -90 } },
    });
    assert.equal(settings.crops.storyCard.rotation, 0);
    assert.equal(settings.crops.portraitRail.rotation, 270);
  });

  it("migrates v2 shared and custom crops", () => {
    const settings = normalizeCoverImageSettings({
      sharedCrops: {
        storyCard: { zoom: 2, croppedAreaPixels: { x: 1, y: 2, width: 40, height: 30 } },
      },
      customCrops: {
        storyCard: { zoom: 1.5, croppedAreaPixels: { x: 3, y: 4, width: 80, height: 60 } },
      },
    });
    assert.equal(settings.crops.storyCard.zoom, 1.5);
  });

  it("accepts a bare URL and rejects empty values", () => {
    assert.equal(normalizeCoverImageData(` ${SOURCE} `)?.src, SOURCE);
    assert.equal(normalizeCoverImageData(""), null);
    assert.equal(normalizeCoverImageData({ src: "" }), null);
    assert.equal(normalizeCoverImageData(null), null);
  });
});

describe("cover image source", () => {
  it("uses a generated variant only at its canonical size", () => {
    const current = {
      url: `${SOURCE}?card`,
      width: COVER_PLACEMENTS.storyCard.width,
      height: COVER_PLACEMENTS.storyCard.height,
    };
    assert.equal(isGeneratedImageCurrent("storyCard", current), true);
    assert.equal(
      isGeneratedImageCurrent("storyCard", { ...current, height: current.height + 1 }),
      false,
    );

    const cover = normalizeCoverImageData({
      src: SOURCE,
      settings: {
        generatedImages: {
          storyCard: current,
          articleHero: { url: `${SOURCE}?hero`, width: 1800, height: 1200 },
        },
      },
    });
    assert.equal(getCoverImageSource(cover, "storyCard"), current.url);
    assert.equal(getCoverImageSource(cover, "articleHero"), SOURCE);
    assert.equal(getCoverImageSource(cover, "portraitRail"), SOURCE);
    assert.equal(getCoverImageSource(null, "storyCard"), null);
  });
});

describe("saved crop pixels", () => {
  const crop = normalizeCoverImageSettings({
    crops: {
      storyCard: {
        croppedArea: { x: 10, y: 20, width: 50, height: 37.5 },
        croppedAreaPixels: { x: 100, y: 150, width: 500, height: 375 },
      },
    },
  }).crops.storyCard;

  it("prefers stored pixels that fit the source", () => {
    assert.deepEqual(getSavedCropPixels(crop, 1000, 750), crop.croppedAreaPixels);
  });

  it("falls back to percentages when the source size changed", () => {
    assert.deepEqual(getSavedCropPixels(crop, 400, 300), {
      x: 40,
      y: 60,
      width: 200,
      height: 112.5,
    });
  });

  it("returns nothing for an un-framed crop", () => {
    const empty = normalizeCoverImageSettings(null).crops.storyCard;
    assert.equal(getSavedCropPixels(empty, 1000, 750), null);
  });
});

describe("resolved crops", () => {
  it("re-fits a legacy 3:2 hero crop to the hero aspect around its center", () => {
    // The production record: a 1320x1410 source, hero framed at 3:2.
    const legacy = normalizeCoverImageSettings({
      crops: {
        articleHero: {
          aspect: 1.5,
          croppedArea: { x: 6.4788, y: 11.5676, width: 84.7458, height: 52.891 },
          croppedAreaPixels: { x: 86, y: 163, width: 1119, height: 746 },
        },
      },
    }).crops.articleHero;
    const resolved = resolveCoverCrop(legacy, "articleHero", 1320, 1410);
    const pixels = resolved.croppedAreaPixels;

    assert.ok(aspectsMatch(pixels.width / pixels.height, getCoverPlacement("articleHero").aspect));
    assert.equal(pixels.height, 746);
    assert.ok(Math.abs(pixels.x + pixels.width / 2 - (86 + 1119 / 2)) <= 1);
    assert.ok(Math.abs(pixels.y + pixels.height / 2 - (163 + 746 / 2)) <= 1);
    // Re-resolving is a no-op, so editor and generator agree on it.
    assert.deepEqual(resolveCoverCrop(resolved, "articleHero", 1320, 1410), resolved);
  });

  it("frames an un-framed crop as the centered default in rotated pixels", () => {
    const crop = normalizeCoverImageSettings({
      crops: { storyCard: { rotation: 90 } },
    }).crops.storyCard;
    const resolved = resolveCoverCrop(crop, "storyCard", 1600, 1000);

    assert.equal(hasSavedCrop(resolved), true);
    // Rotated source is 1000x1600; the widest 4:3 area spans its width.
    assert.deepEqual(resolved.croppedAreaPixels, { x: 0, y: 425, width: 1000, height: 750 });
    assert.deepEqual(resolved.croppedArea, { x: 0, y: 26.5625, width: 100, height: 46.875 });
  });
});
