import { cn } from "@/lib/utils"
import { Avatar } from "@/components/shared/Avatar"

export function CompanyItem({ company, active, count, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors border-l-2",
        active
          ? "bg-white/5 border-[#378ADD]"
          : "border-transparent hover:bg-white/5",
        collapsed && "justify-center px-0 gap-0"
      )}
    >
      <Avatar
        name={company.name}
        avatarUrl={company.avatarUrl}
        size="sm"
        shape="square"
      />
      {!collapsed && (
        <>
          <span className="flex-1 text-[12px] text-foreground truncate">
            {company.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {count}
          </span>
        </>
      )}
    </button>
  )
}