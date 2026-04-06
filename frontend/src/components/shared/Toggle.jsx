import { cn } from "@/lib/utils"

export function Toggle({ checked, onChange, className }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-slate-300 transition-colors duration-150 focus:outline-none dark:border-white/10",
        checked ? "bg-[#378ADD]" : "bg-slate-200 dark:bg-white/10",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-150",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}