export function FeedEmpty({ search, noArticles = false }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2">
      <span className="text-sm text-muted-foreground">
        {search
          ? `No results for "${search}"`
          : noArticles
            ? "No articles published for this company yet"
            : "No articles match the current filters"}
      </span>
      <span className="text-xs text-muted-foreground/60">
        {search
          ? "Try a different search term"
          : noArticles
            ? "This message appears only when there are no articles at all."
            : "Change the time or tag filter to widen the results."}
      </span>
    </div>
  )
}