export function DateGroupLabel({ label, count }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-1.5 bg-background border-b border-white/[0.06]">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground/50">
        {count} {count === 1 ? "item" : "items"}
      </span>
    </div>
  )
}