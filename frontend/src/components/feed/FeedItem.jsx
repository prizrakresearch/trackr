import { useState } from "react"
import { Copy, Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/shared/Badge"
import { colorFromName } from "@/utils/colors"

const densityPadding = {
  compact: "px-3 py-2",
  comfortable: "px-3 py-4",
  spacious: "px-3 py-5",
}

const typeTagStyles = {
  news: "border-[#2f6fb3]/40 text-[#2f6fb3] dark:border-[#1e4a78] dark:text-[#7bb8f0]",
  filing: "border-[#9a6a1c]/40 text-[#9a6a1c] dark:border-[#4a3010] dark:text-[#d4943a]",
  press: "border-[#2f7d5e]/40 text-[#2f7d5e] dark:border-[#143d29] dark:text-[#4caf87]",
}

function normalizeType(type) {
  const value = String(type ?? "news").toLowerCase().trim()
  if (value === "filings" || value === "corporate filing") return "filing"
  if (value === "press-release" || value === "press_release") return "press"
  // Default everything else (including "info") to "news"
  return "news"
}

function getSummaryText(value) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function toHashtag(value, fallback = "unknown") {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
  return `#${normalized || fallback}`
}

function dateTagValue(rawDate) {
  if (!rawDate) return "No date"
  try {
    // Try parsing as ISO string first
    let dateStr = String(rawDate).trim()
    // Handle both published_at (ISO) and other formats
    const date = new Date(dateStr)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10)
    }
    // If that fails, return the date string as-is (formatted by backend)
    return dateStr.split("T")[0] || dateStr
  } catch {
    return String(rawDate).split("T")[0] || "No date"
  }
}

export function FeedItem({ item, company, active, starred = false, onToggleStar, density = "comfortable", onClick }) {
  const [copied, setCopied] = useState(false)
  const companyColor = company ? colorFromName(company.name) : colorFromName("All Companies")
  const summaryText = getSummaryText(item.summary ?? item.content)

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
          : "hover:bg-black/[0.04] dark:hover:bg-white/[0.03]"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground leading-snug mb-1.5 truncate">
          {item.title}
        </p>

        {summaryText && (
          <p
            className="text-[12px] text-muted-foreground/65 leading-5 mb-1.5 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {summaryText}
          </p>
        )}

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
        onClick={(e) => {
          e.stopPropagation()
          onToggleStar?.()
        }}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10",
          starred ? "text-[#e7b53b]" : "text-muted-foreground"
        )}
        aria-label={starred ? "Unstar article" : "Star article"}
      >
        <Star size={12} fill={starred ? "currentColor" : "none"} />
      </button>

      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  )
}