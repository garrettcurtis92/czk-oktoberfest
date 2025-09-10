"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Trophy, Menu, Flag, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type TabItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function TabLink({
  href,
  label,
  icon,
  active,
  reduceMotion,
}: TabItem & { active: boolean; reduceMotion: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className="relative">
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
          !active && "hover:bg-white/60"
        )}
      >
        {/* gliding highlight */}
        {active && (
          <motion.span
            layoutId="tabHighlight"
            className="absolute inset-0 rounded-2xl bg-white/80 shadow"
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 500, damping: 36, mass: 0.5 }
            }
          />
        )}
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-5 w-5">{icon}</div>
          <span className={cn("mt-1", active ? "text-charcoal" : "text-charcoal/70")}>
            {label}
          </span>
        </div>
      </motion.div>
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items: TabItem[] = [
    { href: "/", label: "Teams", icon: <User className="h-5 w-5" /> },
    { href: "/schedule", label: "Schedule", icon: <CalendarDays className="h-5 w-5" /> },
    { href: "/leaderboard", label: "Scores", icon: <Trophy className="h-5 w-5" /> },
    { href: "/brackets", label: "Brackets", icon: <Flag className="h-5 w-5" /> },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-6 z-30 mx-auto w-full max-w-3xl px-4">
        <div className="glass rounded-3xl shadow-lg border border-black/5">
          <div className="relative flex items-center justify-between gap-1 p-2">
            {items.map((it) => {
              const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
              return (
                <TabLink
                  key={it.href}
                  {...it}
                  active={active}
                  reduceMotion={Boolean(reduceMotion)}
                />
              );
            })}

            {/* trigger */}
            <motion.button
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              onClick={() => setOpen((v) => !v)}
              className="ml-1 relative flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs text-charcoal/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 hover:bg-white/60"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls="more-menu"
            >
              <Menu className="h-5 w-5" />
              <span className="mt-1">More</span>
            </motion.button>

            {/* anchored menu */}
            <AnimatePresence>
              {open && (
                <motion.div
                  id="more-menu"
                  role="menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
                  className="absolute right-2 -top-2 translate-y-[-100%] z-30 rounded-2xl border border-black/5 bg-white shadow-lg"
                >
                  <Link href="/admin/live" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm">
                    Admin · Live
                  </Link>
                  <Link href="/admin/score" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm">
                    Admin · Scoring
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* backdrop to close when tapping outside */}
      {open && (
        <button
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-transparent"
        />
      )}

      <div className="h-20 md:h-0" />
    </>
  );
}
