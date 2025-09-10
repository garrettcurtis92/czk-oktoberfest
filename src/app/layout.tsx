import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader, BottomTabs } from "@/components/nav/site-nav";
import PageTransition from "@/components/PageTransition";
import SplashVerse from "@/components/SplashVerse";
import ConfettiBurst from "@/components/ConfettiBurst";

export const metadata: Metadata = {
  title: "CZK Oktoberfest",
  description: "Family games, schedule, and live scores",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    images: "/logo.svg",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`$bg-sand text-charcoal`}>
        <SplashVerse />
        <ConfettiBurst />
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-4">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomTabs />
      </body>
    </html>
  );
};