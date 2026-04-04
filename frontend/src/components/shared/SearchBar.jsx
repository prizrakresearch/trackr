import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchBar({ value, onChange, className, fullWidth = false }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <Search
        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={12}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search…"
        className={cn(
          "h-7 bg-white/5 border border-white/10 rounded-md pl-7 pr-3 text-[12px] text-foreground placeholder:text-muted-foreground outline-none transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.08] hover:border-black/20 dark:hover:border-white/20",
          focused && "border-[#378ADD]",
          fullWidth ? "w-full" : focused ? "w-52" : "w-44"
        )}
      />
    </div>
  )
}