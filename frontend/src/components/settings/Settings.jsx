const themeOptions = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];
import { cn } from "@/lib/utils"
import { Modal } from "@/components/shared/Modal"
import { useSettingsContext } from "@/context/SettingsContext"
import { ToggleRow } from "./ToggleRow"
import { DensityPicker } from "./DensityPicker"

const openModeOptions = [
  { value: "panel", label: "Detail panel" },
  { value: "new-tab", label: "Open in new tab" },
]

export function Settings({ open, onClose }) {
  const { settings, updateSettings } = useSettingsContext()

  return (
    <Modal open={open} onClose={onClose} title="Settings" className="max-w-lg">

      <div className="px-5 py-4 space-y-6">
        <section className="space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-foreground">Theme</h3>
            <p className="text-[11px] text-muted-foreground">
              Switch between dark, light, or system mode.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateSettings({ theme: option.value })}
                className={cn(
                  "h-8 w-full rounded-md border text-[16px] font-medium transition-colors",
                  settings.theme === option.value
                    ? "bg-[#1a3a5c] text-[#7bb8f0] border-[#1e4a78]"
                    : "border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-foreground">Feed density</h3>
            <p className="text-[11px] text-muted-foreground">
              Controls vertical spacing in the feed list.
            </p>
          </div>
          <DensityPicker
            value={settings.density}
            onChange={(density) => updateSettings({ density })}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-white/10 bg-background p-3">
          <ToggleRow
            label="Keep sidebar expanded"
            checked={settings.sidebarOpen}
            onChange={(sidebarOpen) => updateSettings({ sidebarOpen })}
          />
        </section>

        <section className="space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-foreground">Open behavior</h3>
            <p className="text-[11px] text-muted-foreground">
              Choose how selected items should open.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {openModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateSettings({ openMode: option.value })}
                className={cn(
                  "h-9 rounded-md border text-[12px] font-medium transition-colors",
                  settings.openMode === option.value
                    ? "bg-[#1a3a5c] text-[#7bb8f0] border-[#1e4a78]"
                    : "border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  )
}
