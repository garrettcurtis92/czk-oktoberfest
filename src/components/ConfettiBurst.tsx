"use client";

import { useEffect } from "react";

type Props = {
  /** Fire once on mount (e.g., first time someone visits Home) */
  fireOnMount?: boolean;
  /** Total pieces */
  count?: number;
  /** How long pieces fall before auto-cleanup (ms) */
  durationMs?: number;
};

export default function ConfettiBurst({
  fireOnMount = true,
  count = 80,
  durationMs = 1800,
}: Props) {
  useEffect(() => {
    if (!fireOnMount) return;

    // Respect prefers-reduced-motion
    const reduce = typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const root = document.createElement("div");
    root.setAttribute("aria-hidden", "true");
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.pointerEvents = "none";
    root.style.zIndex = "60"; // above hero card
    document.body.appendChild(root);

    const colors = [
      "#2563eb", // team blue
      "#f59e0b", // team orange
      "#10b981", // team green
      "#ef4444", // team red
      "#8b5cf6", // accent violet
    ];

    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const size = 6 + Math.random() * 6; // 6–12px
      const left = Math.random() * 100;   // vw
      const delay = Math.random() * 200;  // ms
      const rot = Math.random() * 360;

      p.style.position = "absolute";
      p.style.top = "-12px";
      p.style.left = `${left}vw`;
      p.style.width = `${size}px`;
      p.style.height = `${size * (0.5 + Math.random())}px`;
      p.style.background = colors[i % colors.length];
      p.style.borderRadius = "2px";
      p.style.opacity = "0.95";
      p.style.transform = `rotate(${rot}deg)`;
      p.style.filter = "drop-shadow(0 1px 0 rgba(0,0,0,0.1))";

      // animation
      const travel = 70 + Math.random() * 25; // vh
      p.animate(
        [
          { transform: `translateY(0) rotate(${rot}deg)`, opacity: 1 },
          { transform: `translateY(${travel}vh) rotate(${rot + 120}deg)`, opacity: 0.9 },
          { transform: `translateY(${travel + 5}vh) rotate(${rot + 240}deg)`, opacity: 0 },
        ],
        {
          duration: durationMs + Math.random() * 600,
          delay,
          easing: "cubic-bezier(.2,.8,.2,1)",
          fill: "forwards",
        }
      );

      root.appendChild(p);
    }

    const cleanup = setTimeout(() => {
      root.remove();
    }, durationMs + 1200);

    return () => {
      clearTimeout(cleanup);
      root.remove();
    };
  }, [fireOnMount, count, durationMs]);

  return null;
}
