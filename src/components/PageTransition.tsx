"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { PropsWithChildren } from "react";

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.div>
  );
}
