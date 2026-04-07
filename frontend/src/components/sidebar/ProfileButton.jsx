import { useEffect, useRef, useState } from "react"
import { LogOut, Download } from "lucide-react"
import { Avatar } from "@/components/shared/Avatar"
import { cn } from "@/lib/utils"

export function ProfileButton({ profile, collapsed, onReset, onExport }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const displayName = profile?.name?.trim() || profile?.username?.trim() || "Trackr User"
  const organization = profile?.organization?.trim() || ""

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-left",
          collapsed && "justify-center px-0 gap-0",
          open && "bg-white/5"
        )}
      >
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
            <span className="text-[10px] text-muted-foreground truncate">
              {organization || "Profile"}
            </span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-52 rounded-lg border border-white/15 bg-[#1a1d23] shadow-xl z-50 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onExport?.() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-foreground hover:bg-white/5 transition-colors text-left"
          >
            <Download size={13} className="text-muted-foreground flex-shrink-0" />
            Export feeds &amp; companies
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            onClick={() => { setOpen(false); onReset?.() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#e48b9a] hover:bg-[#7a1f2f]/20 transition-colors text-left"
          >
            <LogOut size={13} className="flex-shrink-0" />
            Reset &amp; start over
          </button>
        </div>
      )}
    </div>
  )
}
