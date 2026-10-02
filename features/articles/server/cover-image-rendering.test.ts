import assert from "node:assert/strict";
import { describe, it } from "node:test";

import sharp from "sharp";

import {
  createDefaultCoverImageSettings,
  hasSavedCrop,
  type CoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import {
  aspectsMatch,
  COVER_PLACEMENT_LIST,
  isAreaWithinBounds,
} from "@/features/articles/lib/cover-placements";
import { createGenerationKey } from "@/features/articles/server/cover-image-generation";
import { renderCoverVariants } from "@/features/articles/server/cover-image-rendering";

const SOURCES = {
  landscape: [1800, 1200],
  portrait: [1000, 1500],
  square: [1200, 1200],
  veryWide: [4000, 900],
  tall: [700, 2800],
} as const;

const RED = { r: 230, g: 20, b: 20 };
const BLUE = { r: 20, g: 20, b: 230 };

describe("cover variant rendering", () => {
  for (const [name, [width, height]] of Object.entries(SOURCES)) {
    it(`renders every placement at its canonical size from a ${name} source`, async () => {
      const source = await solidImage(width, height, BLUE, "png");
      const variants = await renderCoverVariants(
        source,
        createDefaultCoverImageSettings(),
      );

      for (const placement of COVER_PLACEMENT_LIST) {
        const variant = variants[placement.id];
        const meta = await sharp(variant.data).metadata();
        assert.equal(meta.format, "webp");
        assert.equal(meta.width, placement.width);
        assert.equal(meta.height, placement.height);

        // The written-back crop is the centered fallback, valid and exact.
        const { croppedAreaPixels } = variant.crop;
        assert.ok(hasSavedCrop(variant.crop));
        assert.ok(isAreaWithinBounds(croppedAreaPixels, width, height));
        assert.ok(
          aspectsMatch(
            croppedAreaPixels.width / croppedAreaPixels.height,
            placement.aspect,
          ),
        );
      }
    });
  }

  it("extracts exactly the saved pixel area", async () => {
    // A red square on blue: cropping tightly around it must yield only red.
    const source = await sharp(await solidImage(2000, 1500, BLUE, "png"))
      .composite([
        { input: await solidImage(600, 450, RED, "png"), left: 1200, top: 900 },
      ])
      .png()
      .toBuffer();
    const settings = withCrop(createDefaultCoverImageSettings(), "storyCard", {
      x: 1200,
      y: 900,
      width: 600,
      height: 450,
    });

    const variants = await renderCoverVariants(source, settings);
    assert.deepEqual(variants.storyCard.crop.croppedAreaPixels, {
      x: 1200,
      y: 900,
      width: 600,
      height: 450,
    });
    await assertSolid(variants.storyCard.data, RED);
  });

  it("applies EXIF orientation before cropping, like the browser", async () => {
    // Stored 1200x800 with orientation 6 (rotate 90° CW): displayed 800x1200.
    const source = await sharp(await solidImage(1200, 800, BLUE, "jpeg"))
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const variants = await renderCoverVariants(
      source,
      createDefaultCoverImageSettings(),
    );

    for (const placement of COVER_PLACEMENT_LIST) {
      assert.ok(
        isAreaWithinBounds(variants[placement.id].crop.croppedAreaPixels, 800, 1200),
        placement.id,
      );
    }
  });

  it("crops in rotated-source pixels for a quarter turn", async () => {
    // Red occupies the left 25% of a 1600x1000 source. After rotating 90°
    // clockwise (CSS and Sharp agree on direction) it fills the top 400 rows
    // of a 1000x1600 image. The same area unrotated is blue, so the
    // assertion only holds if rotation runs before extract.
    const source = await sharp(await solidImage(1600, 1000, BLUE, "png"))
      .composite([{ input: await solidImage(400, 1000, RED, "png"), left: 0, top: 0 }])
      .png()
      .toBuffer();
    const settings = createDefaultCoverImageSettings();
    settings.crops.storyCard = {
      ...settings.crops.storyCard,
      rotation: 90,
      croppedArea: { x: 60, y: 3.125, width: 30, height: 14.0625 },
      croppedAreaPixels: { x: 600, y: 50, width: 300, height: 225 },
    };

    const variants = await renderCoverVariants(source, settings);
    await assertSolid(variants.storyCard.data, RED);
  });

  it("produces a stable generation key once crops are written back", async () => {
    const source = await solidImage(1800, 1200, BLUE, "png");
    const first = createDefaultCoverImageSettings();
    const variants = await renderCoverVariants(source, first);
    const written: CoverImageSettings = {
      ...first,
      crops: Object.fromEntries(
        COVER_PLACEMENT_LIST.map((placement) => [
          placement.id,
          variants[placement.id].crop,
        ]),
      ) as CoverImageSettings["crops"],
    };
    const again = await renderCoverVariants(source, written);

    for (const placement of COVER_PLACEMENT_LIST) {
      assert.deepEqual(again[placement.id].crop, written.crops[placement.id]);
    }
    assert.equal(
      createGenerationKey("https://example.com/a.png", written),
      createGenerationKey("https://example.com/a.png", {
        ...written,
        crops: Object.fromEntries(
          COVER_PLACEMENT_LIST.map((placement) => [
            placement.id,
            again[placement.id].crop,
          ]),
        ) as CoverImageSettings["crops"],
      }),
    );
  });
});

function withCrop(
  settings: CoverImageSettings,
  placement: keyof CoverImageSettings["crops"],
  pixels: { x: number; y: number; width: number; height: number },
): CoverImageSettings {
  settings.crops[placement] = {
    ...settings.crops[placement],
    croppedArea: { x: 1, y: 1, width: 1, height: 1 },
    croppedAreaPixels: pixels,
  };
  return settings;
}

async function solidImage(
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
  format: "png" | "jpeg",
) {
  const image = sharp({
    create: { width, height, channels: 3, background: color },
  });
  return format === "png" ? image.png().toBuffer() : image.jpeg().toBuffer();
}

async function assertSolid(
  data: Buffer,
  color: { r: number; g: number; b: number },
) {
  const { channels } = await sharp(data).stats();
  const [r, g, b] = channels;
  for (const [channel, expected] of [
    [r, color.r],
    [g, color.g],
    [b, color.b],
  ] as const) {
    // WebP compression wobbles edges slightly; any bleed of the other colour
    // would move the mean and minimum far beyond this.
    assert.ok(Math.abs(channel.mean - expected) < 6, `mean ${channel.mean} vs ${expected}`);
    assert.ok(Math.abs(channel.min - expected) < 40, `min ${channel.min} vs ${expected}`);
  }
}
