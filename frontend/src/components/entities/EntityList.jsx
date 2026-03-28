import { EntityItem } from "./EntityItem"

export function EntityList({
  companies = [],
  feedItems = [],
  loading = false,
  removingId = null,
  onRemove,
}) {
  function getCount(companyId) {
    return feedItems.filter((item) => item.company_id === companyId).length
  }

  if (loading) {
    return (
      <div className="rounded-md border border-white/10 bg-[#141518] px-3 py-5 text-center">
        <p className="text-[12px] text-muted-foreground">Loading entities...</p>
      </div>
    )
  }

  if (!companies.length) {
    return (
      <div className="rounded-md border border-dashed border-white/10 bg-[#141518]/50 px-3 py-6 text-center">
        <p className="text-[12px] text-foreground">No entities yet</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Add your first company to start tracking updates.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {companies.map((company) => (
        <EntityItem
          key={company.id}
          company={company}
          count={getCount(company.id)}
          onRemove={onRemove}
          removing={removingId === company.id}
        />
      ))}
    </div>
  )
}
