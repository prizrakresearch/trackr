import { cn } from "@/lib/utils"

const tags = [
  { value: "all", label: "All" },
  { value: "news", label: "News" },
  { value: "filing", label: "Filings" },
  { value: "press", label: "Press" },
]

const activeStyles = {
  all: "bg-[#1a3a5c] text-[#7bb8f0] border-[#1e4a78]",
  news: "bg-[#1a3a5c] text-[#7bb8f0] border-[#1e4a78]",
  filing: "bg-[#2e200a] text-[#d4943a] border-[#4a3010]",
  press: "bg-[#0c2519] text-[#4caf87] border-[#143d29]",
}

export function TagFilter({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {tags.map((tag) => (
        <button
          key={tag.value}
          onClick={() => onChange(tag.value)}
          className={cn(
            "px-2 py-1 text-[11px] rounded-full border transition-colors",
            value === tag.value
              ? activeStyles[tag.value]
              : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
          )}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}