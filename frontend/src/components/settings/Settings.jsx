import { useState } from "react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/shared/Modal"
import { useSettingsContext } from "@/context/SettingsContext"
import { ToggleRow } from "./ToggleRow"
import { DensityPicker } from "./DensityPicker"
import { EditFeedsModal } from "./EditFeedsModal"

const themeOptions = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
]

const openModeOptions = [
  { value: "panel", label: "Detail panel" },
  { value: "new-tab", label: "Open in new tab" },
]

const shortcutRows = [
  { id: "toggleSidebar", label: "Toggle sidebar", description: "Cmd + key" },
  { id: "focusSearch", label: "Focus search", description: "Cmd + key" },
  { id: "refreshFeed", label: "Refresh feed", description: "Cmd + key" },
]

function formatShortcut(key) {
  return `Cmd + ${String(key || "").toUpperCase()}`
}

function sanitizeShortcutKey(value) {
  const next = String(value ?? "").trim().toLowerCase()
  return /^[a-z0-9]$/.test(next) ? next : ""
}

export function Settings({ open, onClose, onOpenManageCompanies }) {
  const { settings, updateSettings, systemTheme } = useSettingsContext()
  const resolvedTheme = settings.theme === "system" ? systemTheme : settings.theme
  const isLightTheme = resolvedTheme === "light"
  const [feedEditorOpen, setFeedEditorOpen] = useState(false)

  function updateShortcut(id, rawValue) {
    const next = sanitizeShortcutKey(rawValue)
    if (!next) return
    updateSettings({
      shortcuts: {
        ...settings.shortcuts,
        [id]: next,
      },
    })
  }

  function openManageCompanies() {
    onOpenManageCompanies?.()
    onClose?.()
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Settings" className="max-w-lg mx-3 sm:mx-0">

      <div className="px-5 py-4 space-y-6">
        <section className="space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-foreground">Theme</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              Switch between dark, light, or system mode.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateSettings({ theme: option.value })}
                className={cn(
                  "h-9 w-full rounded-md border text-[12px] font-medium transition-colors",
                  settings.theme === option.value
                    ? "border-slate-300 bg-slate-900 text-white dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0]"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-white"
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
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              Controls vertical spacing in the feed list.
            </p>
          </div>
          <DensityPicker
            value={settings.density}
            onChange={(density) => updateSettings({ density })}
          />
        </section>

        <section
          className={cn(
            "space-y-3 rounded-lg border p-3",
            isLightTheme ? "border-slate-200 bg-white" : "border-white/10 bg-[#141518]"
          )}
        >
          <ToggleRow
            label="Keep sidebar expanded"
            checked={settings.sidebarOpen}
            onChange={(sidebarOpen) => updateSettings({ sidebarOpen })}
          />
        </section>

        <section className="space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-foreground">Open behavior</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
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
                    ? "border-slate-300 bg-slate-900 text-white dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0]"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-foreground">Keyboard shortcuts</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              Shortcuts are limited to Cmd + single key.
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border p-3 space-y-3",
              isLightTheme ? "border-slate-200 bg-white" : "border-white/10 bg-[#141518]"
            )}
          >
            {shortcutRows.map((row) => {
              const value = settings.shortcuts?.[row.id] || ""
              return (
                <div key={row.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] text-foreground">{row.label}</p>
                    <p className={cn("text-[10px]", isLightTheme ? "text-zinc-600" : "text-zinc-300")}>{row.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn("text-[11px] w-[76px] text-right", isLightTheme ? "text-zinc-600" : "text-zinc-300")}>
                      {formatShortcut(value)}
                    </span>
                    <input
                      value={value.toUpperCase()}
                      onChange={(e) => updateShortcut(row.id, e.target.value.slice(-1))}
                      maxLength={1}
                      inputMode="text"
                      className={cn(
                        "h-8 w-10 rounded-md border text-center text-[12px] text-foreground outline-none focus:border-[#378ADD]",
                        isLightTheme ? "border-slate-300 bg-white" : "border-white/10 bg-white/5"
                      )}
                      aria-label={`${row.label} key`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section
          className={cn(
            "rounded-lg border p-3 flex items-start justify-between gap-3",
            isLightTheme ? "border-slate-200 bg-white" : "border-white/10 bg-[#141518]"
          )}
        >
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-[13px] font-medium text-foreground">RSS feeds</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              Manage your feed sources in a dedicated editor.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setFeedEditorOpen(true)}
              className="h-9 inline-flex items-center rounded-md border border-slate-300 bg-slate-900 px-3 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73]"
            >
              Edit feeds
            </button>
          </div>
        </section>

        <section
          className={cn(
            "rounded-lg border p-3 flex items-start justify-between gap-3",
            isLightTheme ? "border-slate-200 bg-white" : "border-white/10 bg-[#141518]"
          )}
        >
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-[13px] font-medium text-foreground">Manage companies</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              Open your company watchlist editor.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={openManageCompanies}
              className="h-9 inline-flex items-center rounded-md border border-slate-300 bg-slate-900 px-3 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73]"
            >
              Manage companies
            </button>
          </div>
        </section>
      </div>
      </Modal>

      <EditFeedsModal open={feedEditorOpen} onClose={() => setFeedEditorOpen(false)} />
    </>
  )
}
