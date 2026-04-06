import { useApp } from "@/context/AppContext"
import { useSettingsContext } from "@/context/SettingsContext"
import { isToday } from "@/utils/dateGroup"
import { FeedItem } from "./FeedItem"
import { FeedEmpty } from "./FeedEmpty"

export function Feed({ items, companies, loading }) {
  const {
    activeCompanyId,
    activeItemId,
    setActiveItemId,
    typeFilter,
    search,
    feedMode,
    isStarred,
    toggleStar,
  } = useApp()
  const { settings } = useSettingsContext()
  const selectedCompany = companies.find((company) => company.id === activeCompanyId)

  function normalizeText(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  function getCompanyTokens(company) {
    if (!company) return []

    const extraKeywords = Array.isArray(company.keywords)
      ? company.keywords
      : String(company.keywords || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)

    return [company.name, company.symbol, ...extraKeywords]
      .map((value) => normalizeText(value))
      .filter(Boolean)
  }

  function keywordMatchesSelectedCompany(item) {
    if (!selectedCompany || !item?.matched_keyword) return false
    const keyword = normalizeText(item.matched_keyword)
    const tokens = getCompanyTokens(selectedCompany)
    return tokens.some((token) => token === keyword || token.includes(keyword) || keyword.includes(token))
  }

  // Filter
  const filtered = items.filter((item) => {
    const matchCompany =
      activeCompanyId === 0 ||
      item.company_id === activeCompanyId ||
      keywordMatchesSelectedCompany(item)
    const matchType = typeFilter === "all" || item.type === typeFilter
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase())
    const matchScope = settings.scope === "all" || isToday(item.published_at)
    const matchStarred = feedMode !== "starred" || isStarred(item.id)
    return matchCompany && matchType && matchSearch && matchScope && matchStarred
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  if (!filtered.length) {
    return <FeedEmpty search={search} noArticles={items.length === 0} />
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.map((item) => {
        const company =
          companies.find((c) => c.id === item.company_id) ||
          companies.find((c) => {
            if (!item?.matched_keyword) return false
            const keyword = normalizeText(item.matched_keyword)
            const tokens = getCompanyTokens(c)
            return tokens.some((token) => token === keyword || token.includes(keyword) || keyword.includes(token))
          })
        return (
          <FeedItem
            key={item.id}
            item={item}
            company={company}
            active={activeItemId === item.id}
            starred={isStarred(item.id)}
            onToggleStar={() => toggleStar(item.id)}
            density={settings.density}
            onClick={() => setActiveItemId(item.id)}
          />
        )
      })}
    </div>
  )
}