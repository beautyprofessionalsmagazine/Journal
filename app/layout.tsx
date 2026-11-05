import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

import { MotionProvider } from "@/shared/components/ui";
import {
  INDEXABLE_ROBOTS,
  getDefaultShareImage,
} from "@/shared/seo/metadata";
import { FEED_PATH, SITE, SITE_URL, absoluteUrl } from "@/shared/seo/site";

import "./globals.css";

const shareImage = getDefaultShareImage();

/**
 * Site-wide defaults. Pages build their own metadata with `buildPageMetadata`
 * (it repeats the fields Next.js replaces wholesale, such as robots, canonical,
 * Open Graph and Twitter), so this only has to cover routes that set nothing.
 *
 * Search engine verification tokens are optional environment variables, so
 * they can be added in the hosting dashboard without a code change.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    types: { "application/rss+xml": absoluteUrl(FEED_PATH) },
  },
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.name,
    description: SITE.description,
    images: [
      {
        url: absoluteUrl(shareImage.url),
        width: shareImage.width,
        height: shareImage.height,
        alt: shareImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: [{ url: absoluteUrl(shareImage.url), alt: shareImage.alt }],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.GOOGLE_SITE_VERIFICATION
            ? { google: process.env.GOOGLE_SITE_VERIFICATION }
            : {}),
          ...(process.env.BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={SITE.language} data-scroll-behavior="smooth">
      <body>
        <MotionProvider>{children}</MotionProvider>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
