import { Settings as SettingsIcon, Star } from "lucide-react"
import { ProfileButton } from "./ProfileButton"
import { cn } from "@/lib/utils"

function ManageEntitiesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[20px] h-[20px] text-muted-foreground"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SidebarFooter({ profile, onManageEntities, onOpenStarred = () => {}, collapsed }) {
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
          <ManageEntitiesIcon/>
        </div>
        {!collapsed && (
          <span className="text-[12px] text-muted-foreground">
            Manage Companies
          </span>
        )}
      </button>

      <button
        onClick={onOpenStarred}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
          collapsed && "justify-center px-0 gap-0"
        )}
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <Star size={16} className="text-muted-foreground" />
        </div>
        {!collapsed && (
          <span className="text-[12px] text-muted-foreground">
            Starred Articles
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
          <SettingsIcon size={16} className="text-muted-foreground" />
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