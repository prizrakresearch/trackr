
import { cn } from "@/lib/utils"
import { CompanyList } from "./CompanyList"
import { SidebarFooter } from "./SidebarFooter"
import { useSettingsContext } from "@/context/SettingsContext"
import { RefreshCw } from "lucide-react"
import trackrDark from "@/assets/trackr_dark.png";
import trackrLight from "@/assets/trackr_light.png";

function formatLastUpdated(dateInput) {
  if (!dateInput) return "Last update: --"

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return "Last update: --"

  const pad = (value) => String(value).padStart(2, "0")
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = String(date.getFullYear()).slice(-2)
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `Last update: ${day}-${month}-${year} ${hours}:${minutes}`
}

export function Sidebar({ open, companies, feedItems, profile, onManageEntities, onRefresh, onOpenStarred = () => {}, onReset, onExport, lastUpdatedAt, refreshLoading, fullWidth = false }) {
  const { settings, systemTheme } = useSettingsContext();
  // Determine effective theme: if system, use systemTheme
  const effectiveTheme = settings.theme === "system" ? systemTheme : settings.theme;
  const logo = effectiveTheme === "dark" ? trackrDark : trackrLight;

  // Sidebar collapsed state: open = expanded, !open = collapsed (mini)
  const collapsed = !open;

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r border-white/10 flex-shrink-0 overflow-hidden transition-all duration-200",
        fullWidth ? "w-full" : open ? "w-[210px]" : "w-[56px]"
      )}
      style={{ minWidth: fullWidth ? "100%" : open ? 210 : 56 }}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 border-b border-white/10 bg-background flex-shrink-0 transition-all duration-200 h-11",
          open ? "px-4" : "px-2"
        )}
      >
        <img
          src={logo}
          alt="Trackr logo"
          className={open ? "w-18 h-5 object-contain" : "w-7 h-7 object-contain"}
          draggable={false}
        />
      </div>

      {/* Refresh */}
      <div className="px-2 pt-2 pb-1 flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={onRefresh}
          disabled={refreshLoading}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
            collapsed && "justify-center px-0 gap-0",
            refreshLoading && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={15} className={refreshLoading ? "animate-spin text-muted-foreground" : "text-muted-foreground"} />
          </div>
          {!collapsed && (
            <span className="text-[12px] text-muted-foreground">Refresh</span>
          )}
        </button>

        {!collapsed && (
          <div className="px-2">
            <p className="text-[10px] leading-4 text-muted-foreground/75">
              {formatLastUpdated(lastUpdatedAt)}
            </p>
          </div>
        )}
      </div>

      {/* Section label */}
      {open && (
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Companies
          </span>
        </div>
      )}

      {/* Company list */}
      <div className="flex-1 overflow-y-auto">
        <CompanyList companies={companies} feedItems={feedItems} collapsed={collapsed} />
      </div>

      {/* Footer */}
      <SidebarFooter
        profile={profile}
        onManageEntities={onManageEntities}
        onOpenStarred={onOpenStarred}
        onReset={onReset}
        onExport={onExport}
        collapsed={collapsed}
      />
    </div>
  )
}