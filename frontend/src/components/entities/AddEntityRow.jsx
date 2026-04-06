import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"

const INITIAL_FORM = {
  name: "",
  symbol: "",
  exchange: "",
}

export function AddEntityRow({ onAdd, adding = false, error = "" }) {
  const [form, setForm] = useState(INITIAL_FORM)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      name: form.name.trim(),
      symbol: form.symbol.trim() || undefined,
      exchange: form.exchange.trim() || undefined,
    }

    if (!payload.name || !onAdd) return

    await onAdd(payload)
    setForm(INITIAL_FORM)
  }

  const disabled = adding || !form.name.trim()

  return (
    <div className="rounded-lg border border-white/10 bg-background p-3 space-y-2.5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Company name"
          className="h-9 rounded-md border border-white/10 bg-white/[0.02] px-3 text-[12px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
        />
        <input
          value={form.symbol}
          onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
          placeholder="Ticker"
          className="h-9 rounded-md border border-white/10 bg-white/[0.02] px-3 text-[12px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
        />
        <input
          value={form.exchange}
          onChange={(e) => updateField("exchange", e.target.value.toUpperCase())}
          placeholder="Exchange"
          className="h-9 rounded-md border border-white/10 bg-white/[0.02] px-3 text-[12px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-[#378ADD]"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          Add a tracked entity to your feed.
        </span>

        <button
          type="button"
          disabled={disabled}
          onClick={handleSubmit}
          className="h-9 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-900 px-3 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add entity
        </button>
      </div>

      {error ? <p className="text-[11px] text-[#e07070]">{error}</p> : null}
    </div>
  )
}
