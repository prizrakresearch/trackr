export function FeedEmpty({ search }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2">
      <span className="text-sm text-muted-foreground">
        {search ? `No results for "${search}"` : "No items yet"}
      </span>
      <span className="text-xs text-muted-foreground/60">
        {search ? "Try a different search term" : "Items will appear here once ingestion runs"}
      </span>
    </div>
  )
}