export default function ColorChips({
  colors = ["#F39B2B", "#F3D23B", "#36B37E", "#2F80ED", "#E45757", "#8C59D9"],
  label = "Team colors",
}: {
  colors?: string[];
  label?: string;
}) {
  return (
    <div
      className="mt-3 flex flex-nowrap items-center justify-center gap-2 px-2 relative z-10"
      aria-label={label}
    >
      {colors.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/80"
          style={{ background: c }}
          aria-hidden
        />
      ))}
    </div>
  );
}
