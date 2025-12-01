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
  title: "PhishGuard - ML-Powered Email Security",
  description: "Protect your organization from phishing threats with 87% accuracy. Enterprise email security powered by machine learning.",
  openGraph: {
    title: "PhishGuard - ML-Powered Email Security",
    description: "Detect phishing emails with machine learning. Analyze sender patterns, urgency language, and suspicious links.",
    url: "https://phishguard-ui.vercel.app",
    siteName: "PhishGuard",
    images: [
      {
        url: "https://phishguard-ui.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhishGuard - ML-Powered Email Security",
    description: "Detect phishing emails with machine learning",
    images: ["https://phishguard-ui.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
