import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader, BottomTabs } from "@/components/nav/site-nav";
import PageTransition from "@/components/PageTransition";
import SplashVerse from "@/components/SplashVerse";
import ConfettiBurst from "@/components/ConfettiBurst";

export const metadata: Metadata = {
  title: "CZK Oktoberfest",
  description: "Family games & fun at the annual CZK Oktoberfest",
  openGraph: {
    title: "CZK Oktoberfest",
    description: "Track teams, events, and scores at Oktoberfest!",
    url: "https://czk-oktoberfest.vercel.app",
    siteName: "CZK Oktoberfest",
    images: [
      {
        url: "/CZK-Logo.jpg", // <-- put this in /public/CZK-Logo.jpg
        width: 1200,
        height: 630,
        alt: "CZK Oktoberfest App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`$bg-sand text-charcoal`}>
        <SplashVerse displayMs={6000} fadeMs={700} />
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