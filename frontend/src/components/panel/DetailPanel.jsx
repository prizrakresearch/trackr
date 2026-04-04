import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { PanelHeader } from "./PanelHeader"
import { PanelBody } from "./PanelBody"

export function DetailPanel({ items, companies }) {
  const { activeItemId, clearActiveItem } = useApp()

  const item = items.find((i) => i.id === activeItemId)
  const company = item ? companies.find((c) => c.id === item.company_id) : null
  const open = !!item

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-l border-white/10 flex-shrink-0 overflow-hidden transition-all duration-200",
        open ? "w-[80vh]" : "w-0 opacity-0"
      )}
    >
      {item && (
        <>
          <PanelHeader item={item} onClose={clearActiveItem} />
          <PanelBody item={item} company={company} />
        </>
      )}
    </div>
  )
}