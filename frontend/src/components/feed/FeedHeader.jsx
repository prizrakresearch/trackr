import { cn } from "@/lib/utils"
import { ScopeToggle } from "@/components/shared/ScopeToggle"
import { TagFilter } from "@/components/shared/TagFilter"
import { SearchBar } from "@/components/shared/SearchBar"
import { useApp } from "@/context/AppContext"
import { useSettingsContext } from "@/context/SettingsContext"

export function FeedHeader({ companies, itemCount, onToggleSidebar, onOpenSettings }) {
  const { activeCompanyId, activeItemId, typeFilter, setTypeFilter, search, setSearch } = useApp()
  const { settings, updateSettings } = useSettingsContext()
  const detailActive = !!activeItemId

  const activeCompany =
    activeCompanyId === 0
      ? { name: "All Companies" }
      : companies.find((c) => c.id === activeCompanyId)

  return (
    <div className="relative flex items-center gap-2 px-3 h-11 border-b border-white/10 bg-background flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 z-10">
        <button
          onClick={onToggleSidebar}
          className={cn(
            "w-9 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
            settings.sidebarOpen
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Toggle sidebar"
        >
          <svg width="24" height="18" viewBox="0 0 60.564 44.236" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="nonzero" transform="scale(1,-1) translate(0,-44.236)">
              <path fill="currentColor" stroke="currentColor" fillOpacity="1.0" strokeWidth="1.0" d="M 11.0,3.330078125 L 49.5859375,3.330078125 C 53.173828125,3.330078125 55.0859375,5.28515625 55.0859375,8.8515625 L 55.0859375,35.384765625 C 55.0859375,38.951171875 53.173828125,40.90625 49.5859375,40.90625 L 11.0,40.90625 C 7.390625,40.90625 5.478515625,38.994140625 5.478515625,35.384765625 L 5.478515625,8.8515625 C 5.478515625,5.2421875 7.390625,3.330078125 11.0,3.330078125 Z M 11.04296875,4.3828125 C 8.078125,4.3828125 6.53125,5.9296875 6.53125,8.89453125 L 6.53125,35.341796875 C 6.53125,38.328125 8.078125,39.853515625 11.04296875,39.853515625 L 20.7109375,39.853515625 L 20.7109375,4.3828125 Z M 49.521484375,39.853515625 C 52.37890625,39.853515625 54.033203125,38.328125 54.033203125,35.341796875 L 54.033203125,8.89453125 C 54.033203125,5.9296875 52.37890625,4.3828125 49.521484375,4.3828125 L 21.763671875,4.3828125 L 21.763671875,39.853515625 Z M 16.62890625,31.796875 C 16.951171875,31.796875 17.1875,32.033203125 17.1875,32.333984375 C 17.1875,32.634765625 16.951171875,32.87109375 16.62890625,32.87109375 L 10.61328125,32.87109375 C 10.291015625,32.87109375 10.0546875,32.634765625 10.0546875,32.333984375 C 10.0546875,32.033203125 10.291015625,31.796875 10.61328125,31.796875 Z M 16.62890625,25.8671875 C 16.951171875,25.8671875 17.1875,26.103515625 17.1875,26.404296875 C 17.1875,26.705078125 16.951171875,26.94140625 16.62890625,26.94140625 L 10.61328125,26.94140625 C 10.291015625,26.94140625 10.0546875,26.705078125 10.0546875,26.404296875 C 10.0546875,26.103515625 10.291015625,25.8671875 10.61328125,25.8671875 Z M 16.62890625,19.958984375 C 16.951171875,19.958984375 17.1875,20.1953125 17.1875,20.49609375 C 17.1875,20.796875 16.951171875,21.033203125 16.62890625,21.033203125 L 10.61328125,21.033203125 C 10.291015625,21.033203125 10.0546875,20.796875 10.0546875,20.49609375 C 10.0546875,20.1953125 10.291015625,19.958984375 10.61328125,19.958984375 Z" />
            </g>
          </svg>
        </button>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
          {activeCompany?.name ?? "All Companies"}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {itemCount} items
        </span>
      </div>

      <div
        className={cn(
          detailActive
            ? "flex-1 min-w-0 mx-2"
            : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw]"
        )}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          className="w-full"
          fullWidth
        />
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 z-10">
        <ScopeToggle
          value={settings.scope}
          onChange={(scope) => updateSettings({ scope })}
        />
        {!detailActive && (
          <>
            <div className="w-px h-4 bg-white/10" />
            <TagFilter value={typeFilter} onChange={setTypeFilter} />
          </>
        )}
      </div>
      {/* Settings button removed from here; now in sidebar */}
    </div>
  )
}