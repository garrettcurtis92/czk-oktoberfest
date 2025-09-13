"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type BIEvent = Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: "accepted"|"dismissed" }> };

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const DISMISS_KEY = "a2hs_dismissed_v1";
const COOLDOWN_DAYS = 14; // don't show again for two weeks after dismiss
const now = () => Date.now();

function isiOSSafariNotInstalled() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const standalone = (navigator as NavigatorWithStandalone).standalone === true
    || window.matchMedia?.("(display-mode: standalone)")?.matches;
  return iOS && isSafari && !standalone;
}

export default function AddToHomeScreenPrompt() {
  const reduce = useReducedMotion();
  const [showIOS, setShowIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BIEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // cooldown logic
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      try {
        const { at } = JSON.parse(raw) as { at: number };
        const ms = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
        if (now() - at < ms) return; // still cooling down
      } catch {}
    }

    // If already installed, bail
    const isStandalone =
      (navigator as NavigatorWithStandalone).standalone === true ||
      window.matchMedia?.("(display-mode: standalone)")?.matches;

    if (isStandalone) return;

    // iOS Safari: show instructions
    if (isiOSSafariNotInstalled()) {
      const t = setTimeout(() => {
        setShowIOS(true);
        setVisible(true);
      }, 800);
      return () => clearTimeout(t);
    }

    // Android/Chrome: catch beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault(); // we’ll show our UI instead of the mini-infobar
      setDeferredPrompt(e as BIEvent);
      setVisible(true);
    };

    const listener: EventListener = (ev) => handler(ev as Event);
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  function dismiss() {
    setVisible(false);
    setShowIOS(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ at: now() }));
  }

  async function install() {
    if (!deferredPrompt?.prompt) return;
    await deferredPrompt.prompt();
    // Optional: you can inspect userChoice if you want analytics
    dismiss();
  }

  // Nothing to show
  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 12 }}
          transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          className="fixed inset-x-4 bottom-24 z-50 glass rounded-2xl border border-black/10 px-4 py-3 shadow-lg"
          role="dialog"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl" aria-hidden>📲</div>
            {showIOS ? (
              <div className="text-sm leading-snug">
                <div className="font-medium">Add CZK Oktoberfest to your Home Screen</div>
                <div className="opacity-70 mt-0.5">
                  Tap <span className="font-medium">Share</span> (▵) then
                  <span className="font-medium"> Add to Home Screen</span>.
                </div>
              </div>
            ) : (
              <div className="text-sm leading-snug">
                <div className="font-medium">Install CZK Oktoberfest</div>
                <div className="opacity-70 mt-0.5">Get quick access from your Home Screen.</div>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              {!showIOS && (
                <button
                  onClick={install}
                  className="rounded-lg bg-black/90 text-white px-3 py-1.5 text-xs hover:bg-black"
                >
                  Install
                </button>
              )}
              <button
                onClick={dismiss}
                className="rounded-lg px-2 py-1 text-xs hover:bg-black/5"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}