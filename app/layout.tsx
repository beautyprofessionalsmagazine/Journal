import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://BeautyProfessionalsMagazine.com"),
  title: "Beauty Professionals Magazine",
  description:
    "Beauty Professionals Magazine is preparing a new journal experience for beauty professionals.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${cormorantGaramond.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
