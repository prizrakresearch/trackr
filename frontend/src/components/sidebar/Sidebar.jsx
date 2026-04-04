
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

  // Sidebar collapsed state: open = expanded, !open = collapsed (mini)
  const collapsed = !open;

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r border-white/10 flex-shrink-0 overflow-hidden transition-all duration-200",
        open ? "w-[210px]" : "w-[56px]"
      )}
      style={{ minWidth: open ? 210 : 56 }}
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
      <SidebarFooter profile={profile} onManageEntities={onManageEntities} collapsed={collapsed} />
    </div>
  )
}