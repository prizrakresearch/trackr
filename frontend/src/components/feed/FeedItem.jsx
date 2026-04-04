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

export function FeedItem({ item, company, active, density = "comfortable", onClick }) {
  const [copied, setCopied] = useState(false)
  const companyColor = company ? colorFromName(company.name) : colorFromName("All Companies")
  const normalizedType = normalizeType(item.type)

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

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium bg-transparent"
            style={{
              color: companyColor.text,
              borderColor: companyColor.text,
            }}
          >
            {company?.name || "All Companies"}
          </span>
          <span className="inline-flex items-center rounded-md border border-black/15 dark:border-white/20 bg-transparent px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {dateTagValue(item.published_at ?? item.publishedAt)}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium bg-transparent",
              typeTagStyles[normalizedType] || "border-gray-400/40 text-gray-600 dark:border-gray-600 dark:text-gray-400"
            )}
          >
            {normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  )
}