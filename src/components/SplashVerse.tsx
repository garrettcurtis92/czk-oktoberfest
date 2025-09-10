"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen verse splash that fades out after ~1.8s
 * and only shows once per session (via sessionStorage).
 */
export default function SplashVerse() {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splash_seen");
    if (seen) {
      setHidden(true); // don’t render at all on subsequent pages
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      // trigger fade-out
      setVisible(false);
      // mark as seen
      sessionStorage.setItem("splash_seen", "1");
      // after fade transition, remove from DOM
      const t2 = setTimeout(() => setHidden(true), 500);
      return () => clearTimeout(t2);
    }, 1800);

    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div
      role="dialog"
      aria-label="Weekend theme verse"
      className={[
        "fixed inset-0 z-[100] grid place-items-center",
        "bg-gradient-to-br from-amber-50 via-white to-emerald-50",
        "transition-opacity duration-1000",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      onClick={() => {
        // allow tap to dismiss early
        sessionStorage.setItem("splash_seen", "1");
        setVisible(false);
        setTimeout(() => setHidden(true), 400);
      }}
    >
      <div
        className={[
          "max-w-2xl mx-6 text-center",
          "rounded-3xl p-8",
          "bg-white/70 backdrop-blur-xl",
          "shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
          "border border-white/60",
        ].join(" ")}
      >
        <p className="text-xl md:text-2xl font-display italic leading-relaxed text-charcoal">
          “May the God of hope fill you with all joy and peace in believing,
          so that by the power of the Holy Spirit you may abound in hope.”
        </p>
        <div className="mt-3 text-sm md:text-base font-semibold text-charcoal/70">
          — Romans 15:13
        </div>

        <div className="mt-6 text-xs text-charcoal/60">
          tap to continue
        </div>
      </div>
    </div>
  );
}
