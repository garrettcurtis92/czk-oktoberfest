import * as React from "react";
import Link from "next/link";

type Props = {
  accent?: string;
  className?: string;
  children: React.ReactNode;
  href?: string; // optional → makes the whole card a link
};

export default function GlassCard({ accent = "rgba(0,0,0,0.12)", className = "", children, href }: Props) {
  const blobA = `color-mix(in oklab, ${accent} 25%, transparent)`;
  const blobB = `color-mix(in oklab, ${accent} 15%, transparent)`;

  const content = (
    <div
      className={[
        "relative overflow-hidden rounded-3xl p-5",
        "bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur",
        "border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
        "transition hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-16 -right-14 h-40 w-40 rounded-full blur-3xl" style={{ background: blobA }} />
        <div className="absolute -bottom-16 -left-14 h-40 w-40 rounded-full blur-3xl" style={{ background: blobB }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return href ? (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-0">
      {content}
    </Link>
  ) : (
    content
  );
}
