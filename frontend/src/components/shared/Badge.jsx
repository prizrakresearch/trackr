import { cn } from "@/lib/utils"

const variants = {
  news: "bg-[#1a3a5c] text-[#7bb8f0]",
  filing: "bg-[#2e200a] text-[#d4943a]",
  press: "bg-[#0c2519] text-[#4caf87]",
}

export function Badge({ type, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0",
        variants[type] ?? "bg-secondary text-muted-foreground",
        className
      )}
    >
      {type}
    </span>
  )
}