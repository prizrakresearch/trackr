import { cn } from "@/lib/utils"

const options = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
]

export function DensityPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 h-9 text-[11px] rounded-md border transition-colors",
            value === opt.value
              ? "border-slate-300 bg-slate-900 text-white dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0]"
              : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-white"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}