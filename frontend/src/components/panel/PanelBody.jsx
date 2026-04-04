import { Badge } from "@/components/shared/Badge"
import { colorFromName } from "@/utils/colors"

function getHost(url) {
  if (!url) return "-"
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function PanelBody({ item, company }) {
  const companyColor = company ? colorFromName(company.name) : null
  const publishedLabel = item.published_at ?? item.publishedAt ?? "-"
  const summary =
    item.summary ?? item.description ?? item.excerpt ?? item.content ?? null

  const rows = [
    { label: "Company", value: company?.name ?? "All companies" },
    { label: "Source", value: item.source ?? "-" },
    { label: "Published", value: publishedLabel },
    { label: "Domain", value: getHost(item.url) },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-[15px] font-semibold text-foreground leading-snug">
            {item.title}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge type={item.type} />
            {company && (
              <span
                className="px-2 py-1 text-[10px] font-semibold rounded-md border border-white/10 uppercase tracking-wide"
                style={{ backgroundColor: companyColor.bg, color: companyColor.text }}
              >
                {company.name}
              </span>
            )}
          </div>
        </div>

        {summary && (
          <div className="rounded-md border border-white/10 bg-black/[0.04] dark:bg-white/[0.04] p-3">
            <p className="text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        )}

        <div className="rounded-md border border-white/10 bg-white/[0.02] divide-y divide-white/[0.06]">
          {rows.map((row) => (
            <div key={row.label} className="px-3 py-2.5 flex items-start justify-between gap-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
                {row.label}
              </span>
              <span className="text-[12px] text-foreground text-right break-words">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center rounded-md border border-white/10 bg-black/[0.04] dark:bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-[#378ADD] hover:bg-[#1a3a5c]/30 transition-colors"
          >
            Open source link
          </a>
        )}
      </div>
    </div>
  )
}