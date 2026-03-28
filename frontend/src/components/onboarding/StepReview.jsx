import { Check, ArrowLeft } from "lucide-react"
import { Avatar } from "@/components/shared/Avatar"

export function StepReview({
  profile,
  companies = [],
  onBack,
  onFinish,
  finishing = false,
}) {
  const name = profile?.name?.trim() || "Trackr User"
  const avatarUrl = profile?.avatarUrl || null

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-semibold text-foreground tracking-tight">Review your setup</h2>
        <p className="text-[12px] text-muted-foreground">
          Everything looks good. You can start using Trackr now.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#141518] p-4 space-y-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Profile</p>
        <div className="flex items-center gap-3">
          <Avatar name={name} avatarUrl={avatarUrl} size="md" />
          <div>
            <p className="text-[13px] font-medium text-foreground">{name}</p>
            <p className="text-[11px] text-muted-foreground">
              {avatarUrl ? "Custom avatar set" : "Generated initials avatar"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#141518] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Tracked entities</p>
          <span className="text-[11px] text-muted-foreground">{companies.length} selected</span>
        </div>

        {companies.length ? (
          <div className="flex flex-wrap gap-1.5">
            {companies.slice(0, 8).map((company) => (
              <span
                key={company.id}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-foreground"
              >
                {company.name}
              </span>
            ))}
            {companies.length > 8 ? (
              <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-muted-foreground">
                +{companies.length - 8} more
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">No entities added yet.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-transparent px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Back
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={finishing}
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-[#1e4a78] bg-[#1a3a5c] px-4 text-[12px] font-medium text-[#7bb8f0] transition-colors hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={13} />
          {finishing ? "Finishing..." : "Finish setup"}
        </button>
      </div>
    </div>
  )
}
