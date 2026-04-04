import { useApp } from "@/context/AppContext"
import { CompanyItem } from "./CompanyItem"

export function CompanyList({ companies, feedItems, collapsed }) {
  const { activeCompanyId, setActiveCompanyId, setActiveItemId } = useApp()

  function getCount(companyId) {
    if (companyId === 0) return feedItems.length
    return feedItems.filter((i) => i.company_id === companyId).length
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
            setActiveCompanyId(company.id)
            setActiveItemId(null)
          }}
          collapsed={collapsed}
        />
      ))}
    </div>
  )
}