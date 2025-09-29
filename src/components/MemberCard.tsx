"use client";
import Image from "next/image";
import GlassCard from "@/components/GlassCard";
import { memberImagePath, type TeamColor } from "@/lib/rosters";
import React from "react";

interface Props {
  color: TeamColor;
  name: string;
  image?: string; // explicit discovered image path (preferred)
}

export function MemberCard({ color, name, image }: Props) {
  const teamVar = `var(--tw-color-team-${color})`;
  const legacy = memberImagePath(color, name); // still fallback if mapping missing
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const attempts = React.useRef<string[]>([]);
  const exts = [".jpg", ".jpeg", ".png", ".webp", ".avif"]; // prefer jpg first
  const base = `/captains/${slug}`; // unified directory
  // Build attempts: explicit provided image first, then base with extensions, then legacy path (old pattern)
  attempts.current = image ? [image, ...exts.filter(e => !image.endsWith(e)).map(e => base + e), legacy] : exts.map(e => base + e).concat(legacy);
  const [src, setSrc] = React.useState<string | null>(attempts.current[0] || null);
  const [errored, setErrored] = React.useState(false);
  const idxRef = React.useRef(0);
  return (
    <GlassCard accent={teamVar}>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-3xl overflow-hidden border border-white/25 dark:border-white/10 bg-white/20 dark:bg-white/5 grid place-items-center">
          {!errored && src && (
            <Image
              src={src}
              alt={name}
              fill
              sizes="80px"
              className="object-cover"
              onError={() => {
                const list = attempts.current;
                idxRef.current += 1;
                if (idxRef.current < list.length) {
                  setSrc(list[idxRef.current]);
                } else setErrored(true);
              }}
            />
          )}
          {errored && (
            <span className="text-2xl font-display opacity-70 select-none">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium leading-tight truncate">{name}</h3>
          <p className="text-xs opacity-60">Player</p>
        </div>
      </div>
    </GlassCard>
  );
}
