import { useApp } from "@/context/AppContext"
import { useSettingsContext } from "@/context/SettingsContext"
import { groupByDate } from "@/utils/dateGroup"
import { DateGroupLabel } from "./DateGroupLabel"
import { FeedItem } from "./FeedItem"
import { FeedEmpty } from "./FeedEmpty"

export function Feed({ items, companies, loading }) {
  const { activeCompanyId, activeItemId, setActiveItemId, typeFilter, search } = useApp()
  const { settings } = useSettingsContext()
  const selectedCompany = companies.find((company) => company.id === activeCompanyId)

  function keywordMatchesSelectedCompany(item) {
    if (!selectedCompany || !item?.matched_keyword) return false
    const companyName = String(selectedCompany.name ?? "").toLowerCase()
    const keyword = String(item.matched_keyword).toLowerCase()
    return companyName.includes(keyword)
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
    return matchCompany && matchType && matchSearch
  })

  const groups = groupByDate(filtered)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  if (!filtered.length) {
    return <FeedEmpty search={search} />
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label}>
          <DateGroupLabel label={group.label} count={group.items.length} />
          {group.items.map((item) => {
            const company =
              companies.find((c) => c.id === item.company_id) ||
              companies.find((c) => {
                if (!item?.matched_keyword) return false
                return String(c.name ?? "")
                  .toLowerCase()
                  .includes(String(item.matched_keyword).toLowerCase())
              })
            return (
              <FeedItem
                key={item.id}
                item={item}
                company={company}
                active={activeItemId === item.id}
                density={settings.density}
                onClick={() => setActiveItemId(item.id)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}