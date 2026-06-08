import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b94b9fe2-1f02-4eb2-a91b-474159c1d689/id-preview-9dc44163--978a825a-db15-4ac6-b10a-5605a443a2c4.lovable.app-1780858305995.png";

const DESCRIPTION =
  "千路 · Thousand Routes. Anonymous, wallet-first cross-border trade finance, payments and invoicing on BNB Chain. Fast. Private. Borderless.";

export const metadata: Metadata = {
  title: "Qianlu — Anonymous Trade Finance on BNB Chain",
  description: DESCRIPTION,
  authors: [{ name: "Qianlu" }],
  openGraph: {
    title: "Qianlu — Anonymous Trade Finance on BNB Chain",
    description: DESCRIPTION,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qianlu — Anonymous Trade Finance on BNB Chain",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Fonts — hoisted to <head> by React 19. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@500;700&family=Long+Cang&display=swap"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
