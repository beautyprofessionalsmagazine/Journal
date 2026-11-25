import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleMetadata } from "./ArticleMetadata";
import { CoverCropImage } from "./CoverCropImage";
import { normalizeCoverImageSettings, resolveCoverCrop } from "../lib/cover-image-settings";
import { COVER_PLACEMENT_LIST, getRotatedSize } from "../lib/cover-placements";
import type { Article } from "../types/article";

describe("public article metadata", () => {
  for (const author of ["Jane Doe", "By Jane Doe | ISSN 3144-0541"]) {
    it(`restores the byline without duplication for ${author}`, () => {
      const article = {
        author, publishedAt: new Date("2026-07-05T12:00:00Z"),
        createdAt: new Date("2026-07-05T12:00:00Z"),
        updatedAt: new Date("2026-11-17T12:00:00Z"),
      } as Article;
      const html = renderToStaticMarkup(createElement(ArticleMetadata, { article }));
      assert.match(html, /By Jane Doe \| ISSN 3144-0541/);
      assert.equal(html.match(/ISSN/g)?.length, 1);
      assert.match(html, /Published/);
      assert.match(html, /2026-07-05T12:00:00.000Z/);
      assert.doesNotMatch(html, /Updated|2026-11-17/);
      assert.equal(article.updatedAt.toISOString(), "2026-11-17T12:00:00.000Z");
    });
  }
});

describe("shared preview and legacy cover rendering", () => {
  for (const [width, height] of [[1200, 800], [800, 1200], [1000, 1000]]) {
    for (const rotation of [0, 90, 180, 270]) {
      for (const placement of COVER_PLACEMENT_LIST) {
        it(`${width}x${height}, ${rotation}°, ${placement.id}: retains off-center saved framing`, () => {
          const rotated = getRotatedSize(width, height, rotation);
          const crop = normalizeCoverImageSettings({ crops: {
            [placement.id]: { rotation,
              croppedArea: { x: 10, y: 20, width: 60, height: 50 },
              croppedAreaPixels: { x: rotated.width * .1, y: rotated.height * .2,
                width: rotated.width * .6, height: rotated.height * .5 },
            },
          } }).crops[placement.id];
          const resolved = resolveCoverCrop(crop, placement.id, width, height);
          const html = renderToStaticMarkup(createElement(CoverCropImage, {
            alt: "Saved subject", crop, placement: placement.id,
            imageUrl: "/fixture.png", naturalSize: { width, height },
          }));
          const area = resolved.croppedArea;
          assert.match(html, /alt="Saved subject"/);
          assert.ok(html.includes(`left:${-area.x / area.width * 100}%`));
          assert.ok(html.includes(`top:${-area.y / area.height * 100}%`));
          assert.ok(html.includes(`width:${10000 / area.width}%`));
          assert.ok(html.includes(`rotate(${rotation}deg)`));
          assert.doesNotMatch(html, /opacity:0|NaN|Infinity/);
        });
      }
    }
  }
});
