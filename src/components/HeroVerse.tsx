"use client";

import { motion } from "framer-motion";

export function HeroVerse() {
  return (
    <section className="rounded-3xl p-8 shadow bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur relative overflow-hidden">
      <motion.blockquote
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center space-y-4"
      >
        <p className="text-2xl md:text-3xl font-display leading-snug text-charcoal italic">
          “May the God of hope fill you with all joy and peace in believing,
          so that by the power of the Holy Spirit you may abound in hope.”
        </p>
        <footer className="text-base md:text-lg font-semibold text-charcoal/70">
          — Romans 15:13
        </footer>
      </motion.blockquote>

      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-amber-200/20 via-transparent to-emerald-200/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.5 }}
      />
    </section>
  );
}
