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
            "flex-1 py-1.5 text-[11px] rounded-md border transition-colors",
            value === opt.value
              ? "bg-[#1a3a5c] text-[#7bb8f0] border-[#1e4a78]"
              : "border-white/10 text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}