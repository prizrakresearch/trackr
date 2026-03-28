import { ArrowRight } from "lucide-react"
import { Avatar } from "@/components/shared/Avatar"

export function StepProfile({ profile, onChange, onNext }) {
  const name = profile?.name ?? ""
  const avatarUrl = profile?.avatarUrl ?? ""

  function update(field, value) {
    onChange?.({ [field]: value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onNext?.()
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
        <Avatar
          name={name || "Trackr User"}
          avatarUrl={avatarUrl || null}
          size="lg"
          className="ring-2 ring-white/10"
        />
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
            className="w-full h-10 rounded-md border border-white/10 bg-[#141518] px-3 text-[13px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="onboard-avatar-url" className="block text-[11px] uppercase tracking-widest text-muted-foreground">
            Avatar URL (optional)
          </label>
          <input
            id="onboard-avatar-url"
            name="avatarUrl"
            value={avatarUrl}
            onChange={(e) => update("avatarUrl", e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="w-full h-10 rounded-md border border-white/10 bg-[#141518] px-3 text-[13px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!name.trim()}
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-[#1e4a78] bg-[#1a3a5c] px-4 text-[12px] font-medium text-[#7bb8f0] transition-colors hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={13} />
        </button>
      </div>
    </form>
  )
}
