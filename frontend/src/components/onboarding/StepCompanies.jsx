import { ArrowRight } from "lucide-react"
import { AddEntityRow } from "@/components/entities/AddEntityRow"
import { EntityItem } from "@/components/entities/EntityItem"

export function StepCompanies({
  companies = [],
  onAdd,
  onRemove,
  adding = false,
  addError = "",
  removingId = null,
  onNext,
}) {
  const hasCompanies = companies.length > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!hasCompanies) return
    onNext?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-semibold text-foreground tracking-tight">Add tracked companies</h2>
        <p className="text-[12px] text-muted-foreground">
          Start with a few entities and grow your watchlist over time.
        </p>
      </div>

      <AddEntityRow onAdd={onAdd} adding={adding} error={addError} />

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Current entities</p>

        {hasCompanies ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {companies.map((company) => (
              <EntityItem
                key={company.id}
                company={company}
                removing={removingId === company.id}
                onRemove={onRemove}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 bg-[#141518]/50 px-3 py-6 text-center">
            <p className="text-[12px] text-foreground">No entities added yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Add at least one company to continue.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!hasCompanies}
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-[#1e4a78] bg-[#1a3a5c] px-4 text-[12px] font-medium text-[#7bb8f0] transition-colors hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={13} />
        </button>
      </div>
    </form>
  )
}
