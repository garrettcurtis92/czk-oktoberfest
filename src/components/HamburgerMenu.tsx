// src/components/HamburgerMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const controls = useAnimationControls();

  // lock background scroll when open
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    if (isOpen) html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, [isOpen]);

  // simple edge-swipe open (right → left)
  const startX = useRef<number | null>(null);
  const onEdgeTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onEdgeTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = startX.current - e.touches[0].clientX; // positive = swipe left
    if (dx > 28) { setIsOpen(true); startX.current = null; }
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(o => !o)}
        className="relative z-[150] p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <X className="h-5 w-5 text-charcoal dark:text-white" /> : <Menu className="h-5 w-5 text-charcoal dark:text-white" />}
        </motion.div>
      </Button>

      {/* Edge swipe area (mobile only) */}
      <div
        className="fixed right-0 top-0 h-dvh w-5 z-[120] md:hidden"
        onTouchStart={onEdgeTouchStart}
        onTouchMove={onEdgeTouchMove}
        aria-hidden
      />

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/40"
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>

      {/* Panel (solid, theme-aware; draggable to close) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80 || info.velocity.x > 600) setIsOpen(false);
              else controls.start({ x: 0 });
            }}
            className={[
              "fixed right-0 top-0 z-[150] h-dvh w-[min(88vw,360px)]",
              "bg-gradient-to-br from-white/95 via-white/90 to-white/80 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-700/80 backdrop-blur-md",
              "text-charcoal dark:text-white",
              "border-l border-white/20 dark:border-gray-700/30 shadow-2xl",
              "pt-4 pb-[max(16px,env(safe-area-inset-bottom))] px-4",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4 text-charcoal dark:text-white" />
              </Button>
            </div>

            {/* Appearance */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-black/60 dark:text-white/60">
                Appearance
              </h3>
              <div className="space-y-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => { setTheme(opt.value); setIsOpen(false); }}
                      className={[
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                        active
                          ? "bg-team-blue text-white shadow"
                          : "bg-black/[0.03] dark:bg-white/[0.10] hover:bg-black/[0.06] dark:hover:bg-white/[0.14]",
                      ].join(" ")}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-charcoal dark:text-white'}`} />
                      <span className="font-medium">{opt.label}</span>
                      {active && (
                        <motion.span layoutId="activeTheme" className="ml-auto h-2 w-2 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="my-6 h-px bg-black/10 dark:bg-white/10" />

            {/* Extra items */}
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.10] hover:bg-black/[0.06] dark:hover:bg-white/[0.14] transition-colors">
                <span className="text-sm text-charcoal dark:text-white">About Oktoberfest</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}