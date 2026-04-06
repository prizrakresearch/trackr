import { Avatar } from "@/components/shared/Avatar"
import { cn } from "@/lib/utils"

export function ProfileButton({ profile, collapsed }) {
  const displayName = profile?.name?.trim() || profile?.username?.trim() || "Trackr User"

  return (
    <button className={cn(
      "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
      collapsed && "justify-center px-0 gap-0"
    )}>
      <Avatar
        name={displayName}
        avatarUrl={profile.avatarUrl}
        avatarColor={profile.avatarColor}
        avatarTextColor={profile.avatarTextColor}
        size="sm"
        shape="circle"
      />
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-medium text-foreground truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground">Profile</span>
        </div>
      )}
    </button>
  )
}