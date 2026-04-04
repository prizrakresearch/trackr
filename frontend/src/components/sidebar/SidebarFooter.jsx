import { Settings as SettingsIcon } from "lucide-react"
import { ProfileButton } from "./ProfileButton"
import { cn } from "@/lib/utils"

function ManageEntitiesIcon() {
  return (
    <svg
      viewBox="0 0 52.787109375 69.22265625"
      className="w-[24px] h-[24px] text-muted-foreground"
      aria-hidden="true"
    >
      <g fillRule="nonzero" transform="scale(1,-1) translate(0,-69.22265625)">
        <path
          fill="currentColor"
          d="M 31.775390625,39.123046875 C 36.48046875,39.123046875 40.068359375,43.140625 40.068359375,48.3828125 C 40.068359375,53.28125 36.39453125,57.44921875 31.775390625,57.44921875 C 27.134765625,57.44921875 23.41796875,53.28125 23.4609375,48.3828125 C 23.4609375,43.140625 27.048828125,39.123046875 31.775390625,39.123046875 Z M 31.7109375,35.255859375 C 26.984375,35.255859375 23.009765625,33.859375 20.044921875,31.818359375 C 23.224609375,29.69140625 25.3515625,26.08203125 25.3515625,22.0 C 25.3515625,21.26953125 25.265625,20.517578125 25.13671875,19.80859375 L 46.3203125,19.80859375 C 48.318359375,19.80859375 49.5,20.41015625 49.5,22.2578125 C 49.5,27.71484375 42.689453125,35.255859375 31.7109375,35.255859375 Z M 13.513671875,11.7734375 C 19.099609375,11.7734375 23.71875,16.37109375 23.71875,22.0 C 23.71875,27.5859375 19.099609375,32.205078125 13.513671875,32.205078125 C 7.927734375,32.205078125 3.287109375,27.5859375 3.287109375,22.0 C 3.287109375,16.37109375 7.927734375,11.7734375 13.513671875,11.7734375 Z M 13.53515625,15.060546875 C 13.041015625,15.060546875 12.71875,15.46875 12.71875,15.8984375 L 12.71875,21.205078125 L 7.69140625,21.205078125 C 7.26171875,21.205078125 6.875,21.505859375 6.875,22.021484375 C 6.875,22.537109375 7.26171875,22.837890625 7.69140625,22.837890625 L 12.71875,22.837890625 L 12.71875,28.123046875 C 12.71875,28.57421875 13.041015625,28.939453125 13.53515625,28.939453125 C 14.029296875,28.939453125 14.3515625,28.57421875 14.3515625,28.123046875 L 14.3515625,22.837890625 L 19.357421875,22.837890625 C 19.80859375,22.837890625 20.173828125,22.537109375 20.173828125,22.021484375 C 20.173828125,21.505859375 19.80859375,21.205078125 19.357421875,21.205078125 L 14.3515625,21.205078125 L 14.3515625,15.8984375 C 14.3515625,15.46875 14.029296875,15.060546875 13.53515625,15.060546875 Z"
        />
      </g>
    </svg>
  )
}

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
          <ManageEntitiesIcon />
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