import { X, ExternalLink } from "lucide-react"

export function PanelHeader({ item, onClose }) {
  return (
    <div className="h-11 flex items-center justify-between px-3 border-b border-white/10 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Reader panel
        </span>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground border border-white/10 rounded-md hover:border-[#378ADD] hover:text-[#7bb8f0] hover:bg-[#1a3a5c] transition-colors"
          >
            Open original
            <ExternalLink size={10} />
          </a>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}