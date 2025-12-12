import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhishGuard - ML-Powered Email Security | 87% Accuracy",
  description: "Production ML phishing detector: 2,039 features, <15ms response, 87% accuracy. Local-first architecture for privacy-sensitive organizations.",
  openGraph: {
    title: "PhishGuard - ML-Powered Email Security | 87% Detection Accuracy",
    description: "Production ML phishing detector: 2,039 features, <15ms response, 87% accuracy. Local-first architecture for privacy-sensitive organizations.",
    url: "https://phishguard.projectlavos.com",
    siteName: "PhishGuard",
    images: [
      {
        url: "https://phishguard.projectlavos.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhishGuard - ML-Powered Email Security | 87% Accuracy",
    description: "Production ML phishing detector: 2,039 features, <15ms response, 87% accuracy.",
    images: ["https://phishguard.projectlavos.com/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PhishGuard",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "ML-powered phishing detection with 87% accuracy, analyzing 2,039 features in under 15ms",
  "url": "https://phishguard.projectlavos.com",
  "image": "https://phishguard.projectlavos.com/og-image.png",
  "author": {
    "@type": "Person",
    "name": "Matthew Scott",
    "url": "https://projectlavos.com"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "ratingCount": "1",
    "bestRating": "5"
  },
  "featureList": [
    "87% detection accuracy",
    "2,039 ML features analyzed",
    "Sub-15ms response time",
    "Local-first architecture",
    "Pattern analysis for sender, urgency, and links"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
