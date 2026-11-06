import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The framework's "X-Powered-By: Next.js" header adds nothing for visitors.
  poweredByHeader: false,
  // Next.js streams metadata into <body> for clients it assumes run JavaScript
  // (Googlebot included) and only blocks for a list of known bots. Titles,
  // canonicals and robots directives belong in <head> for every crawler, search
  // and AI alike, so metadata always blocks. This costs no latency here: with
  // no loading boundary the page already waits for its own data before the
  // first byte, so metadata resolves in parallel.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Belt and braces for the private surfaces: robots.txt keeps crawlers
        // out, and this header keeps any URL they reach anyway out of the index.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Files in /public are served without any cache lifetime by default,
        // so every visit revalidated the logo and textures. A day, plus a week
        // of stale-while-revalidate, keeps them fresh enough after a swap.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The same story was published twice, under a truncated slug and under
      // its full one. Both URLs served identical content (duplicate content),
      // so the truncated one is permanently redirected to the full URL.
      // Remove this entry only if the two records are ever made distinct.
      {
        source: "/articles/why-beauty-compe",
        destination:
          "/articles/why-beauty-competitions-have-become-the-1-career-growth-tool-in-the-industry",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
