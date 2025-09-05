import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader, BottomTabs } from "@/components/nav/site-nav";

export const metadata: Metadata = {
  title: "CZK Oktoberfest",
  description: "Family games, schedule, and live scores",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sand min-h-dvh text-charcoal">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-3">{children}</div>
        <BottomTabs />
      </body>
    </html>
  );
}
