import { cn } from "@/lib/utils"

export function Toggle({ checked, onChange, className }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-150 focus:outline-none",
        checked ? "bg-[#378ADD]" : "bg-white/10",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-150 mt-[1px]",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}