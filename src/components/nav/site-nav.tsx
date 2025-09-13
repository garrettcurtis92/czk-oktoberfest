"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CalendarDays, Trophy, Flag, User, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import LiveTicker from "@/components/LiveTicker";

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
          !active && "hover:bg-white/60 dark:hover:bg-white/10"
        )}
      >
        {/* gliding highlight */}
        {active && (
          <motion.span
            layoutId="tabHighlight"
            className="absolute inset-0 rounded-2xl bg-white/80 dark:bg-white/20 shadow"
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 500, damping: 36, mass: 0.5 }
            }
          />
        )}
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-5 w-5">{icon}</div>
          <span className={cn("mt-1", active ? "text-charcoal dark:text-white" : "text-charcoal/70 dark:text-white/70")}>
            {label}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 glass">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
        {/* Spacer for balance */}
        <div className="w-10" />
        <div className="flex-1 flex items-center justify-center">
          <LiveTicker compact />
        </div>
        {/* Hamburger Menu */}
        <HamburgerMenu />
      </div>
    </header>
  );
}

export function BottomTabs() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const isTogglingRef = useRef(false);
  const [backdropBlocked, setBackdropBlocked] = useState(false);

  useEffect(() => {
    console.log('BottomTabs component mounted');
    return () => console.log('BottomTabs component unmounted');
  }, []);

  useEffect(() => {
    console.log('Open state changed to:', open);
  }, [open]);

  // useEffect(() => {
  //   console.log('Pathname changed to:', pathname, '- setting open to false');
  //   setOpen(false);
  // }, [pathname]);

  const items: TabItem[] = [
    { href: "/", label: "Teams", icon: <User className="h-5 w-5 text-charcoal dark:text-white" /> },
    { href: "/schedule", label: "Schedule", icon: <CalendarDays className="h-5 w-5 text-charcoal dark:text-white" /> },
    { href: "/leaderboard", label: "Scores", icon: <Trophy className="h-5 w-5 text-charcoal dark:text-white" /> },
    { href: "/brackets", label: "Brackets", icon: <Flag className="h-5 w-5 text-charcoal dark:text-white" /> },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-6 z-[60] mx-auto w-full max-w-3xl px-4">
        <div className="rounded-3xl nav-surface shadow-lg">
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

            {/* Admin Menu trigger */}
            <motion.button
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();

                if (isTogglingRef.current) return;
                isTogglingRef.current = true;

                const newOpen = !open;

                if (newOpen) {
                  setBackdropBlocked(true);
                  setTimeout(() => setBackdropBlocked(false), 200);
                }

                setOpen(newOpen);

                setTimeout(() => {
                  isTogglingRef.current = false;
                }, 100);
              }}
              className="ml-1 relative flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs text-charcoal/70 dark:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 hover:bg-white/60 dark:hover:bg-white/10"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls="more-menu"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="mt-1">More</span>
            </motion.button>

            {/* Admin anchored menu */}
            <AnimatePresence>
              {open && (
                <motion.div
                  id="more-menu"
                  role="menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
                  className="absolute right-2 -top-2 translate-y-[-100%] z-[70] rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg"
                >
                  <Link 
                    href="/admin/live" 
                    onClick={() => setOpen(false)} 
                    className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    Admin · Live
                  </Link>
                  <Link 
                    href="/admin/score" 
                    onClick={() => setOpen(false)} 
                    className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 first:rounded-t-2xl last:rounded-b-2xl"
                  >
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
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          className={"fixed inset-0 z-[40] bg-transparent " + (backdropBlocked ? "pointer-events-none" : "")}
        />
      )}

      <div className="h-20 md:h-0" />
    </>
  );
}
