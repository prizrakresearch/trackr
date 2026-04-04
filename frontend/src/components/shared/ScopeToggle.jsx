import { cn } from "@/lib/utils"

const options = [
  { value: "today", label: "Today" },
  { value: "all", label: "Available" },
]

export function ScopeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-md border border-black/20 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 text-[11px] transition-colors",
            i === 0 && "border-r border-white/10",
            value === opt.value
              ? "text-foreground bg-gradient-to-b from-black/[0.10] to-black/[0.05] dark:from-white/[0.14] dark:to-white/[0.07]"
              : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}