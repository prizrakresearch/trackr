import { useState } from "react"
import { ArrowRight, Palette, Upload, X } from "lucide-react"
import { Avatar } from "@/components/shared/Avatar"

const AVATAR_COLOR_POOL = [
  { bg: "#2A165D", text: "#B8A5FF" },
  { bg: "#1F5AA8", text: "#DCEBFF" },
  { bg: "#0F766E", text: "#C7FFF7" },
  { bg: "#8B5A14", text: "#FFE8BF" },
  { bg: "#7A1F4B", text: "#FFD0E9" },
  { bg: "#0B3B61", text: "#CDEBFF" },
  { bg: "#3D2A1B", text: "#FFDDB8" },
  { bg: "#244B3C", text: "#CBFFE8" },
]

function pickFiveRandomCombos() {
  const shuffled = [...AVATAR_COLOR_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

export function StepProfile({ profile, onChange, onNext }) {
  const name = profile?.name ?? ""
  const organization = profile?.organization ?? ""
  const avatarUrl = profile?.avatarUrl ?? ""
  const avatarColor = profile?.avatarColor ?? ""
  const avatarTextColor = profile?.avatarTextColor ?? ""
  const isUploadedImage = String(avatarUrl).startsWith("data:")
  const hasPastedUrl = !!avatarUrl && !isUploadedImage
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerOptions, setPickerOptions] = useState(() => pickFiveRandomCombos())
  const [uploadedImageName, setUploadedImageName] = useState("")

  function update(field, value) {
    onChange?.({ [field]: value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onNext?.()
  }

  function togglePicker() {
    if (!pickerOpen) {
      setPickerOptions(pickFiveRandomCombos())
    }
    setPickerOpen((prev) => !prev)
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      if (result) {
        update("avatarUrl", result)
        setUploadedImageName(file.name || "Uploaded image")
      }
    }
    reader.readAsDataURL(file)

    // Allow selecting the same file again in future selections.
    event.target.value = ""
  }

  function clearUploadedAvatar() {
    update("avatarUrl", "")
    setUploadedImageName("")
  }

  function clearAvatarUrl() {
    update("avatarUrl", "")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-semibold text-foreground tracking-tight">Set up your profile</h2>
        <p className="text-[12px] text-muted-foreground">
          This helps personalize Trackr across your workspace.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative inline-flex">
          <Avatar
            name={name || "Trackr User"}
            avatarUrl={avatarUrl || null}
            avatarColor={avatarColor || null}
            avatarTextColor={avatarTextColor || null}
            size="lg"
            className="ring-2 ring-white/10"
          />

          {!avatarUrl && (
            <>
              <button
                type="button"
                onClick={togglePicker}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border border-black/10 dark:border-white/20 bg-white dark:bg-[#141518] text-zinc-700 dark:text-zinc-200 inline-flex items-center justify-center hover:text-zinc-900 dark:hover:text-white hover:border-[#378ADD] transition-colors"
                aria-label="Open profile icon color picker"
              >
                <Palette size={12} />
              </button>

              {pickerOpen && (
                <div className="absolute top-full mt-2 right-0 z-10 rounded-lg border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#101216]/95 backdrop-blur px-2 py-2 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    {pickerOptions.map((combo, index) => {
                      const isActive = combo.bg === avatarColor && combo.text === avatarTextColor
                      return (
                        <button
                          key={`${combo.bg}-${combo.text}-${index}`}
                          type="button"
                          onClick={() => {
                            onChange?.({ avatarColor: combo.bg, avatarTextColor: combo.text })
                            setPickerOpen(false)
                          }}
                          className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-105"
                          style={{
                            backgroundColor: combo.bg,
                            borderColor: isActive ? "#378ADD" : "rgba(148,163,184,0.35)",
                          }}
                          aria-label="Set avatar color combination"
                        />
                      )
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        onChange?.({ avatarColor: null, avatarTextColor: null })
                        setPickerOpen(false)
                      }}
                      className="h-6 rounded-md border border-black/10 dark:border-white/15 px-2 text-[10px] font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Auto
                    </button>

                    <button
                      type="button"
                      onClick={() => setPickerOpen(false)}
                      className="h-6 w-6 rounded-md border border-black/10 dark:border-white/15 inline-flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
                      aria-label="Close profile icon color picker"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="onboard-name" className="block text-[11px] uppercase tracking-widest text-muted-foreground">
            Display name
          </label>
          <input
            id="onboard-name"
            name="name"
            value={name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Analyst"
            className="w-full h-10 rounded-md border border-black/10 dark:border-white/20 bg-white dark:bg-white/[0.05] px-3 text-[13px] text-zinc-900 dark:text-foreground placeholder:text-zinc-500 dark:placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="onboard-avatar-url" className="block text-[11px] uppercase tracking-widest text-muted-foreground">
            Additional (optional)
          </label>

          <div className="mb-2 opacity-60">
            <input
              id="onboard-organization"
              name="organization"
              value={organization}
              onChange={(e) => update("organization", e.target.value)}
              placeholder="Organization (optional)"
              className="w-full h-10 rounded-md border border-black/10 dark:border-white/20 bg-white dark:bg-white/[0.05] px-3 text-[13px] text-zinc-900 dark:text-foreground placeholder:text-zinc-500 dark:placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
            />
          </div>

          <div className="flex items-center gap-2 opacity-60">
            {!hasPastedUrl && (
              <label className="h-10 inline-flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/20 bg-white dark:bg-white/[0.05] px-3 text-[12px] text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-[#378ADD] transition-colors">
                <Upload size={12} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            )}

            {isUploadedImage && (
              <>
                <span className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[220px]">
                  Image uploaded: {uploadedImageName || "Uploaded image"}
                </span>
                <button
                  type="button"
                  onClick={clearUploadedAvatar}
                  className="h-8 rounded-md border border-black/10 dark:border-white/10 px-2 text-[11px] text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
                >
                  Remove
                </button>
              </>
            )}

            {!isUploadedImage && (
              <input
                id="onboard-avatar-url"
                name="avatarUrl"
                value={avatarUrl}
                onChange={(e) => {
                  setUploadedImageName("")
                  update("avatarUrl", e.target.value)
                }}
                placeholder="https://example.com/avatar.png"
                className="flex-1 h-10 rounded-md border border-black/10 dark:border-white/20 bg-white dark:bg-white/[0.05] px-3 text-[13px] text-zinc-900 dark:text-foreground placeholder:text-zinc-500 dark:placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
              />
            )}

            {hasPastedUrl && (
              <button
                type="button"
                onClick={clearAvatarUrl}
                className="h-8 rounded-md border border-black/10 dark:border-white/10 px-2 text-[11px] text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
              >
                Remove
              </button>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!name.trim()}
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-900 px-4 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={13} />
        </button>
      </div>
    </form>
  )
}
