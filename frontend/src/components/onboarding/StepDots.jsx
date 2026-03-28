import { cn } from "@/lib/utils"

export function StepDots({ currentStep = 0, totalSteps = 4, labels = [] }) {
  const safeTotal = Math.max(1, totalSteps)
  const activeIndex = Math.min(Math.max(0, currentStep), safeTotal - 1)

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: safeTotal }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              index === activeIndex
                ? "w-6 bg-[#378ADD]"
                : index < activeIndex
                  ? "w-3 bg-[#1e4a78]"
                  : "w-3 bg-white/15"
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-[11px] text-muted-foreground">
          Step {activeIndex + 1} of {safeTotal}
        </p>
        {labels[activeIndex] ? (
          <p className="mt-0.5 text-[12px] text-foreground">{labels[activeIndex]}</p>
        ) : null}
      </div>
    </div>
  )
}
