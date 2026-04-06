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
  const organization = profile?.organization?.trim() || ""
  const avatarUrl = profile?.avatarUrl || null
  const avatarColor = profile?.avatarColor || null
  const avatarTextColor = profile?.avatarTextColor || null

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-semibold text-foreground tracking-tight">Review your setup</h2>
        <p className="text-[12px] text-muted-foreground">
          Everything looks good. You can start using Trackr now.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 dark:border-white/10 dark:bg-[#141518]">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Profile</p>
        <div className="flex items-center gap-3">
          <Avatar name={name} avatarUrl={avatarUrl} avatarColor={avatarColor} avatarTextColor={avatarTextColor} size="md" />
          <div>
            <p className="text-[13px] font-medium text-foreground">{name}</p>
            {organization ? (
              <p className="text-[11px] text-muted-foreground">{organization}</p>
            ) : null}
            <p className="text-[11px] text-muted-foreground">
              {avatarUrl ? "Custom avatar set" : "Generated initials avatar"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 dark:border-white/10 dark:bg-[#141518]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Tracked entities</p>
          <span className="text-[11px] text-muted-foreground">{companies.length} selected</span>
        </div>

        {companies.length ? (
          <div className="flex flex-wrap gap-1.5">
            {companies.slice(0, 8).map((company) => (
              <span
                key={company.id}
                className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] text-foreground dark:border-white/10 dark:bg-white/[0.03]"
              >
                {company.name}
              </span>
            ))}
            {companies.length > 8 ? (
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
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
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-muted-foreground dark:hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Back
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={finishing}
          className="h-10 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-900 px-4 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={13} />
          {finishing ? "Finishing..." : "Finish setup"}
        </button>
      </div>
    </div>
  )
}
