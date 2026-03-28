import { cn } from "@/lib/utils"
import { CompanyList } from "./CompanyList"
import { SidebarFooter } from "./SidebarFooter"

export function Sidebar({ open, companies, feedItems, profile, onManageEntities }) {
  return (
    <div
      className={cn(
        "flex flex-col bg-[#141518] border-r border-white/10 flex-shrink-0 overflow-hidden transition-all duration-200",
        open ? "w-[210px]" : "w-0 opacity-0"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-5 h-5 rounded-[5px] bg-[#378ADD] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="1.5" fill="white" />
          </svg>
        </div>
        <span className="text-[14px] font-medium text-foreground tracking-tight">
          Track<span className="text-[#378ADD]">r</span>
        </span>
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