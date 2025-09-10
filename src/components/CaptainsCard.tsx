// src/components/CaptainCard.tsx
import Image from "next/image";

type Props = {
  name: string;
  team: string;               // e.g. "Blue Team"
  color: string;              // hex like "#2F80ED" (used for accents)
  avatarUrl?: string | null;  // optional portrait
  subtitle?: string;          // short line: “Team Captain”
  href?: string;              // optional link to team page
};

export default function CaptainCard({
  name,
  team,
  color,
  avatarUrl,
  subtitle = "Team Captain",
  href,
}: Props) {
  const Content = (
    <div
      className={[
        "relative overflow-hidden rounded-3xl p-5",
        "bg-gradient-to-br from-white/80 via-white/60 to-white/30",
        "backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
        "border border-white/60 transition",
        "hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
      ].join(" ")}
      aria-label={`${name}, ${subtitle} of ${team}`}
    >
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-14 -right-12 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `${color}33` }} // 20% alpha
        />
        <div
          className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `${color}22` }} // ~13% alpha
        />
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {/* avatar */}
        <div
          className="grid place-items-center rounded-2xl border border-white/70 bg-white/70 backdrop-blur h-16 w-16 shrink-0 overflow-hidden"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
          aria-hidden={!avatarUrl}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${name} avatar`}
              width={64}
              height={64}
              className="h-16 w-16 object-cover"
            />
          ) : (
            <span className="text-lg font-bold" style={{ color }}>
              {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
          )}
        </div>

        {/* text */}
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-black/60">
            {subtitle}
          </div>
          <h3 className="text-lg font-display leading-tight truncate">{name}</h3>

          {/* team pill + color dot */}
          <div className="mt-1 inline-flex items-center gap-2 text-sm text-black/70">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/80"
              style={{ background: color }}
              aria-hidden
            />
            <span className="truncate">{team}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // clickable variant keeps the same look
  return href ? (
    <a href={href} className="block focus-visible:outline-none focus-visible:ring-0">
      {Content}
    </a>
  ) : (
    Content
  );
}
