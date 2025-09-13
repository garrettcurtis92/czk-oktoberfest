"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;         // e.g. "LIVE NOW • Cornhole"
  tone?: "live" | "next"; // color system
  className?: string;
};

export default function TickerBadge({ href, label, tone = "next", className }: Props) {
  const reduce = useReducedMotion();
  const isLive = tone === "live";

  return (
    <Link href={href} aria-label={label} className="inline-block">
      <motion.span
        initial={reduce ? { scale: 1 } : { scale: 0.98, opacity: 0 }}
        animate={reduce ? { scale: 1 } : { scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
        className={cn(
          // glassy pill container
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
          "backdrop-blur bg-white/80 border border-black/5 shadow",
          "dark:bg-white/15 dark:border-white/10",
          // typography
          "text-sm font-medium",
          // color accents
          isLive
            ? "text-red-700 dark:text-red-300"
            : "text-blue-700 dark:text-blue-300",
          className
        )}
      >
        {/* status dot */}
        <span
          aria-hidden
          className={cn(
            "inline-block size-2 rounded-full",
            isLive ? "bg-red-600" : "bg-blue-600"
          )}
        />
        <span>{label}</span>
      </motion.span>
    </Link>
  );
}