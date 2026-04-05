import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zippyscheduler.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zippy Scheduler | Easy Pinterest Pin Scheduling",
    template: "%s | Zippy Scheduler",
  },
  description:
    "Schedule Pinterest pins and manage boards across multiple accounts. Simple, fast, and built for content creators.",
  keywords: [
    "pinterest scheduler",
    "pin scheduling tool",
    "pinterest automation",
    "pinterest management",
    "schedule pins",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zippy Scheduler",
    title: "Zippy Scheduler | Easy Pinterest Pin Scheduling",
    description:
      "Schedule Pinterest pins and manage boards across multiple accounts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zippy Scheduler",
    description: "Easy Pinterest Pin Scheduling",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
