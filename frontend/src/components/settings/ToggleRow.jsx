import { Toggle } from "@/components/shared/Toggle"

export function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}