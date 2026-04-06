import { Trash2 } from "lucide-react"
import { Avatar } from "@/components/shared/Avatar"

export function EntityItem({ company, count = 0, onRemove, removing = false }) {
  const keywordPreview = Array.isArray(company?.keywords)
    ? company.keywords.slice(0, 3).join(", ")
    : ""
  const subtitle = [company?.symbol, keywordPreview].filter(Boolean).join(" · ")

  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-background px-3 py-2.5">
      <Avatar name={company.name} avatarUrl={company.avatarUrl} size="sm" shape="square" />

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-foreground truncate">{company.name}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {subtitle ? <span className="truncate">{subtitle}</span> : <span>Tracked entity</span>}
          <span className="text-muted-foreground/40">·</span>
          <span>{count} items</span>
        </div>
      </div>

      <button
        onClick={() => onRemove?.(company.id)}
        disabled={removing}
        className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 text-muted-foreground transition-colors hover:text-foreground hover:border-[#378ADD] hover:bg-[#1a3a5c]/30 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Remove ${company.name}`}
        title={`Remove ${company.name}`}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
