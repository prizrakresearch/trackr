import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/shared/Badge"
import { colorFromName } from "@/utils/colors"

const densityPadding = {
  compact: "px-3 py-2",
  comfortable: "px-3 py-3",
  spacious: "px-3 py-5",
}

export function FeedItem({ item, company, active, density = "comfortable", onClick }) {
  const [copied, setCopied] = useState(false)
  const companyColor = company ? colorFromName(company.name) : null

  function handleCopy(e) {
    e.stopPropagation()
    navigator.clipboard.writeText(item.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 border-b border-white/[0.06] cursor-pointer transition-colors group",
        densityPadding[density],
        active
          ? "bg-white/5 border-l-2 border-l-[#378ADD]"
          : "hover:bg-white/[0.03]"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground leading-snug mb-1.5 truncate">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge type={item.type} />
          {company && (
            <>
              <span
                className="text-[11px] font-medium"
                style={{ color: companyColor.text }}
              >
                {company.name}
              </span>
              <span className="text-[10px] text-muted-foreground/40">·</span>
            </>
          )}
          <span className="text-[11px] text-muted-foreground">{item.source}</span>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className="text-[11px] text-muted-foreground/60">{item.published_at}</span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded hover:bg-white/10 text-muted-foreground"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  )
}