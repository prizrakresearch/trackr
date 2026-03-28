
import { cn } from "@/lib/utils"
import { CompanyList } from "./CompanyList"
import { SidebarFooter } from "./SidebarFooter"
import { useSettingsContext } from "@/context/SettingsContext"
import trackrDark from "@/assets/trackr_dark.png";
import trackrLight from "@/assets/trackr_light.png";

export function Sidebar({ open, companies, feedItems, profile, onManageEntities }) {
  const { settings, systemTheme } = useSettingsContext();
  // Determine effective theme: if system, use systemTheme
  const effectiveTheme = settings.theme === "system" ? systemTheme : settings.theme;
  const logo = effectiveTheme === "dark" ? trackrDark : trackrLight;
  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r border-white/10 flex-shrink-0 overflow-hidden transition-all duration-200",
        open ? "w-[210px]" : "w-0 opacity-0"
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <img
          src={logo}
          alt="Trackr logo"
          className="w-18 h-5 object-contain"
          draggable={false}
        />
      </div>

      {/* Section label */}
      <div className="px-3 pt-3 pb-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Companies
        </span>
      </div>

      {/* Company list */}
      <div className="flex-1 overflow-y-auto">
        <CompanyList companies={companies} feedItems={feedItems} />
      </div>

      {/* Footer */}
      <SidebarFooter profile={profile} onManageEntities={onManageEntities} />
    </div>
  )
}