import { Menu } from "lucide-react"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScopeToggle } from "@/components/shared/ScopeToggle"
import { TagFilter } from "@/components/shared/TagFilter"
import { SearchBar } from "@/components/shared/SearchBar"
import { useApp } from "@/context/AppContext"
import { useSettingsContext } from "@/context/SettingsContext"

export function FeedHeader({ companies, itemCount, onToggleSidebar, onOpenSettings }) {
  const { activeCompanyId, typeFilter, setTypeFilter, search, setSearch } = useApp()
  const { settings, updateSettings } = useSettingsContext()

  const activeCompany =
    activeCompanyId === 0
      ? { name: "All Companies" }
      : companies.find((c) => c.id === activeCompanyId)

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-background flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            settings.sidebarOpen
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Menu size={14} />
        </button>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
          {activeCompany?.name ?? "All Companies"}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {itemCount} items
        </span>
      </div>

      <div className="flex-1" />

      {/* Right */}
      <ScopeToggle
        value={settings.scope}
        onChange={(scope) => updateSettings({ scope })}
      />
      <div className="w-px h-4 bg-white/10" />
      <TagFilter value={typeFilter} onChange={setTypeFilter} />
      <div className="w-px h-4 bg-white/10" />
      <SearchBar value={search} onChange={setSearch} />
      <div className="w-px h-4 bg-white/10" />
      <button
        onClick={onOpenSettings}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings size={14} />
      </button>
    </div>
  )
}