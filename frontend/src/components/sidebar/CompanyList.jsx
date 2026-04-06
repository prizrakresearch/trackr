import { useApp } from "@/context/AppContext"
import { useSettingsContext } from "@/context/SettingsContext"
import { isToday } from "@/utils/dateGroup"
import { CompanyItem } from "./CompanyItem"

export function CompanyList({ companies, feedItems, collapsed }) {
  const { activeCompanyId, setActiveCompanyId, setActiveItemId, setFeedMode, typeFilter, search } = useApp()
  const { settings } = useSettingsContext()

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

  function itemMatchesCompany(item, company) {
    if (!item || !company) return false

    const itemCompanyId = String(item.company_id ?? "")
    const companyId = String(company.id ?? "")
    if (itemCompanyId && companyId && itemCompanyId === companyId) {
      return true
    }

    const keyword = normalizeText(item.matched_keyword)
    if (!keyword) return false

    const tokens = getCompanyTokens(company)
    return tokens.includes(keyword)
  }

  function itemMatchesSharedFilters(item) {
    const matchType = typeFilter === "all" || item.type === typeFilter
    const matchSearch =
      !search ||
      String(item.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(item.source ?? "").toLowerCase().includes(search.toLowerCase())
    const matchScope = settings.scope === "all" || isToday(item.published_at)

    return matchType && matchSearch && matchScope
  }

  function getCount(companyId) {
    const visibleItems = feedItems.filter(itemMatchesSharedFilters)
    if (companyId === 0) return visibleItems.length

    const company = companies.find((c) => String(c.id ?? "") === String(companyId))
    if (!company) return 0

    return visibleItems.filter((item) => itemMatchesCompany(item, company)).length
  }

  const all = [{ id: 0, name: "All Companies" }, ...companies]

  return (
    <div className="flex flex-col py-1">
      {all.map((company) => (
        <CompanyItem
          key={company.id}
          company={company}
          active={activeCompanyId === company.id}
          count={getCount(company.id)}
          onClick={() => {
            setFeedMode("all")
            setActiveCompanyId(company.id)
            setActiveItemId(null)
          }}
          collapsed={collapsed}
        />
      ))}
    </div>
  )
}