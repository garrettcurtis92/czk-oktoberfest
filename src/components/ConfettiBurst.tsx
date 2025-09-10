// src/components/ConfettiBurst.tsx
"use client";

import { useEffect } from "react";

export default function ConfettiBurst({
  count = 80,
  durationMs = 5000,
  fireOnMount = false,
}: {
  count?: number;
  durationMs?: number;
  fireOnMount?: boolean;
}) {
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    function fire() {
      // once per session
      if (sessionStorage.getItem("confetti_seen") === "1") return;
      sessionStorage.setItem("confetti_seen", "1");

      const root = document.createElement("div");
      root.setAttribute("aria-hidden", "true");
      root.style.position = "fixed";
      root.style.inset = "0";
      root.style.pointerEvents = "none";
      root.style.zIndex = "60";
      document.body.appendChild(root);

      const colors = ["#2563eb","#f59e0b","#10b981","#ef4444","#8b5cf6","#eab308"];

      for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        const size = 6 + Math.random() * 6;
        const left = Math.random() * 100;
        const delay = Math.random() * 200;
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
    p.style.setProperty("filter", "drop-shadow(0px 1px 0px rgba(0,0,0,0.1))");

        const travel = 70 + Math.random() * 25;
        p.animate(
          [
            { transform: `translateY(0) rotate(${rot}deg)`, opacity: 1 },
            { transform: `translateY(${travel}vh) rotate(${rot + 120}deg)`, opacity: 0.9 },
            { transform: `translateY(${travel + 5}vh) rotate(${rot + 240}deg)`, opacity: 0 },
          ],
          { duration: durationMs + Math.random() * 600, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
        );

        root.appendChild(p);
      }

      setTimeout(() => root.remove(), durationMs + 1200);
    }

    // If caller requested firing immediately on mount, do it now.
    if (fireOnMount) {
      fire();
      return;
    }

    // Otherwise wait for the splash to finish.
    const handler = () => fire();
    window.addEventListener("splash-finished", handler);
    return () => window.removeEventListener("splash-finished", handler);
  }, [count, durationMs, fireOnMount]);

  return null;
}
