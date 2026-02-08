import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: "MarketScope - US Market Intelligence Map",
  description:
    "Interactive market intelligence platform with economic, demographic, and legislative data overlays across all 50 US states.",
  metadataBase: new URL("https://phishguard.projectlavos.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "MarketScope - US Market Intelligence Map",
    description:
      "Interactive market intelligence platform with economic, demographic, and legislative data overlays across all 50 US states.",
    url: "https://phishguard.projectlavos.com",
    siteName: "MarketScope",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MarketScope - US Market Intelligence Map",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketScope - US Market Intelligence Map",
    description:
      "Interactive market intelligence with economic, demographic, and legislative data overlays across all 50 US states.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MarketScope",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Interactive market intelligence platform with economic, demographic, and legislative data overlays across all 50 US states. Zoomable choropleth map with county-level detail.",
  url: "https://phishguard.projectlavos.com",
  image: "https://phishguard.projectlavos.com/og-image.png",
  author: {
    "@type": "Person",
    name: "Matthew Scott",
    url: "https://projectlavos.com",
  },
  featureList: [
    "Population density choropleth",
    "Income and poverty overlays",
    "Employment and gig economy metrics",
    "Legislative tracking by state",
    "Interstate highway overlay",
    "County-level zoom detail",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#050505] text-[#f5f0eb]">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <div className="noise-overlay" aria-hidden="true" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
