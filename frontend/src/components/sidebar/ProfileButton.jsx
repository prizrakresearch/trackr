import { Avatar } from "@/components/shared/Avatar"
import { cn } from "@/lib/utils"

export function ProfileButton({ profile, collapsed }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
      collapsed && "justify-center px-0 gap-0"
    )}>
      <Avatar
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        size="sm"
        shape="circle"
      />
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-medium text-foreground truncate">
            {profile.name}
          </span>
          <span className="text-[10px] text-muted-foreground">Profile</span>
        </div>
      )}
    </button>
  )
}