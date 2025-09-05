"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Trophy, Images, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils"; // if you don’t have cn, replace with a simple join

function TabLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs",
        active ? "bg-white/80 text-charcoal shadow" : "text-charcoal/70"
      )}
      aria-current={active ? "page" : undefined}
    >
      <div className="h-5 w-5">{icon}</div>
      <span className="mt-1">{label}</span>
    </Link>
  );
}
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-sand/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-center">
        <Link href="/" className="block">
          <Image
            src="/logo.svg"
            alt="Oktoberfest logo"
            width={48}
            height={48}
            className="rounded-xl shadow"
            priority
          />
        </Link>
      </div>
    </header>
  );
}



export function BottomTabs() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/schedule", label: "Schedule", icon: <CalendarDays className="h-5 w-5" /> },
    { href: "/leaderboard", label: "Scores", icon: <Trophy className="h-5 w-5" /> }, // optional alias to "/"
    { href: "/gallery", label: "Gallery", icon: <Images className="h-5 w-5" /> },    // placeholder
  ];

  return (
    <>
      {/* bottom nav */}
      <nav className="fixed inset-x-0 bottom-6 z-30 mx-auto w-full max-w-3xl px-4">
        <div className="rounded-3xl bg-white/80 backdrop-blur shadow-lg border border-black/5">
          <div className="flex items-center justify-between gap-1 p-2">
            {items.map((it) => (
              <TabLink
                key={it.href}
                {...it}
                active={
                  it.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(it.href)
                }
              />
            ))}

            {/* overflow menu for admin links */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-1 flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs text-charcoal/70"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <Menu className="h-5 w-5" />
              <span className="mt-1">More</span>
            </button>
          </div>

          {open && (
            <div
              role="menu"
              className="mx-2 mb-2 rounded-2xl border border-black/5 bg-white shadow-lg"
            >
              <Link href="/admin/live" className="block px-4 py-2 text-sm">Admin · Live</Link>
              <Link href="/admin/score" className="block px-4 py-2 text-sm">Admin · Scoring</Link>
            </div>
          )}
        </div>
      </nav>

      {/* spacer to avoid content underlap */}
      <div className="h-20 md:h-0" />
    </>
  );
}
