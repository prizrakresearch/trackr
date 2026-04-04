import { Plus, Settings as SettingsIcon } from "lucide-react"
import { ProfileButton } from "./ProfileButton"
import { cn } from "@/lib/utils"

export function SidebarFooter({ profile, onManageEntities, collapsed }) {
  function openSettings() {
    const event = new CustomEvent("open-settings");
    window.dispatchEvent(event);
  }
  return (
    <div className="border-t border-white/10 p-2 flex flex-col gap-1 flex-shrink-0">
      <button
        onClick={onManageEntities}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
          collapsed && "justify-center px-0 gap-0"
        )}
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <Plus size={14} className="text-muted-foreground" />
        </div>
        {!collapsed && (
          <span className="text-[12px] text-muted-foreground">
            Manage entities
          </span>
        )}
      </button>

      <button
        onClick={openSettings}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
          collapsed && "justify-center px-0 gap-0"
        )}
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <SettingsIcon size={14} className="text-muted-foreground" />
        </div>
        {!collapsed && (
          <span className="text-[12px] text-muted-foreground">
            Settings
          </span>
        )}
      </button>

      <ProfileButton profile={profile} collapsed={collapsed} />
    </div>
  )
}