import { cn } from "@/lib/utils"

const options = [
  { value: "today", label: "Today" },
  { value: "all", label: "All time" },
]

export function ScopeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-md border border-white/10 overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 text-[11px] transition-colors",
            i === 0 && "border-r border-white/10",
            value === opt.value
              ? "bg-[#378ADD] text-white"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}