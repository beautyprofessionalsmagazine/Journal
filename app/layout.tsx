import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MotionProvider } from "@/shared/components/ui";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://BeautyProfessionalsMagazine.com"),
  title: {
    default: "Beauty Professionals Magazine",
    template: "%s | Beauty Professionals Magazine",
  },
  description:
    "Editorial interviews, style, beauty, culture, and professional insight for the beauty industry.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
