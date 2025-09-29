import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader, BottomTabs } from "@/components/nav/site-nav";
import PageTransition from "@/components/PageTransition";
import SplashVerse from "@/components/SplashVerse";
import ConfettiBurst from "@/components/ConfettiBurst";
import { ThemeContextProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import AddToHomeScreenPrompt from "@/components/AddToHomeScreenPrompt";

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
  manifest: "/manifest.json",
  // Use the single SVG for all favicon links. NOTE: iOS home screen still prefers a PNG apple-touch-icon.
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo2.png", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('czk-theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const appliedTheme = theme === 'system' ? systemTheme : theme;
                document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
  <body suppressHydrationWarning>
        <ThemeContextProvider>
          {/* Single SVG favicon usage (apple-touch PNG omitted per request) */}
          <div className="bg-sand text-charcoal dark:bg-gray-900 dark:text-white transition-colors">
            <SplashVerse displayMs={6000} fadeMs={700} />
            <ConfettiBurst />            
            <SiteHeader />
            <main className="mx-auto max-w-3xl px-4 py-4">
             
              <PageTransition>{children}</PageTransition>
            </main>
            <BottomTabs />
            <AddToHomeScreenPrompt />
            <Toaster />
          </div>
        </ThemeContextProvider>
      </body>
    </html>
  );
};