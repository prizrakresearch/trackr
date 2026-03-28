import { Plus } from "lucide-react"
import { ProfileButton } from "./ProfileButton"

export function SidebarFooter({ profile, onManageEntities }) {
  return (
    <div className="border-t border-white/10 p-2 flex flex-col gap-1 flex-shrink-0">
      <button
        onClick={onManageEntities}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left"
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <Plus size={14} className="text-muted-foreground" />
        </div>
        <span className="text-[12px] text-muted-foreground">
          Manage entities
        </span>
      </button>

      <ProfileButton profile={profile} />
    </div>
  )
}