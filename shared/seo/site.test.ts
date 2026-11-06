import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SITE_URL, absoluteUrl, resolveSiteUrl } from "@/shared/seo/site";

describe("resolveSiteUrl", () => {
  it("uses the production domain by default", () => {
    assert.equal(resolveSiteUrl(undefined), "https://beautyprofessionalsmagazine.com");
    assert.equal(resolveSiteUrl(""), "https://beautyprofessionalsmagazine.com");
  });

  it("accepts an override and keeps only its origin, lowercased", () => {
    assert.equal(
      resolveSiteUrl("https://Staging.Example.com/some/path/"),
      "https://staging.example.com",
    );
  });

  it("ignores values that are not http(s) URLs", () => {
    assert.equal(resolveSiteUrl("not a url"), "https://beautyprofessionalsmagazine.com");
    assert.equal(resolveSiteUrl("ftp://example.com"), "https://beautyprofessionalsmagazine.com");
    assert.equal(resolveSiteUrl("javascript:alert(1)"), "https://beautyprofessionalsmagazine.com");
  });
});

describe("absoluteUrl", () => {
  it("keeps the home page's trailing slash and nothing else's", () => {
    assert.equal(absoluteUrl("/"), `${SITE_URL}/`);
    assert.equal(absoluteUrl(), `${SITE_URL}/`);
    assert.equal(absoluteUrl("/articles/"), `${SITE_URL}/articles`);
  });

  it("accepts paths with or without a leading slash", () => {
    assert.equal(absoluteUrl("about"), `${SITE_URL}/about`);
    assert.equal(absoluteUrl("//about"), `${SITE_URL}/about`);
  });

  it("keeps query strings (lookbook editions)", () => {
    assert.equal(
      absoluteUrl("/lookbook?year=2026&month=9"),
      `${SITE_URL}/lookbook?year=2026&month=9`,
    );
  });

  it("returns absolute URLs untouched", () => {
    assert.equal(
      absoluteUrl("https://cdn.example.com/a.png"),
      "https://cdn.example.com/a.png",
    );
  });

  it("never yields a host with uppercase letters", () => {
    assert.equal(new URL(SITE_URL).host, new URL(SITE_URL).host.toLowerCase());
  });
});
