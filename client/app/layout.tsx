import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),

  title: {
    default: "MarketX — Buy. Sell. Discover.",
    template: "%s | MarketX",
  },

  description:
    "A modern marketplace to buy and sell pre-owned products securely.",

  keywords: [
    "marketplace",
    "second hand marketplace",
    "buy and sell",
    "used products",
    "MarketX",
  ],

  applicationName: "MarketX",

  authors: [
    {
      name: "MarketX",
    },
  ],

  creator: "MarketX",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    siteName: "MarketX",
    title: "MarketX — Buy. Sell. Discover.",
    description:
      "Buy and sell pre-owned products on MarketX.",
  },

  twitter: {
    card: "summary_large_image",
    title: "MarketX — Buy. Sell. Discover.",
    description:
      "Buy and sell pre-owned products on MarketX.",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

import Providers from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-black antialiased">
        <Providers>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}