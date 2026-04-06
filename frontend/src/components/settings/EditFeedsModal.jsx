import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/shared/Modal"
import { useSettingsContext } from "@/context/SettingsContext"
import {
  createFeedSource,
  deleteFeedSource,
  getFeedSources,
  updateFeedSource,
} from "@/utils/api"

export function EditFeedsModal({ open, onClose }) {
  const { settings, systemTheme } = useSettingsContext()
  const resolvedTheme = settings.theme === "system" ? systemTheme : settings.theme
  const isLightTheme = resolvedTheme === "light"

  const [feedSources, setFeedSources] = useState([])
  const [feedsLoading, setFeedsLoading] = useState(false)
  const [feedsError, setFeedsError] = useState("")
  const [search, setSearch] = useState("")
  const [newFeedUrl, setNewFeedUrl] = useState("")
  const [addingFeed, setAddingFeed] = useState(false)
  const [editingId, setEditingId] = useState("")
  const [editingUrl, setEditingUrl] = useState("")
  const [savingId, setSavingId] = useState("")
  const [deletingId, setDeletingId] = useState("")

  useEffect(() => {
    if (!open) return
    loadFeedSources()
  }, [open])

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return feedSources
    return feedSources.filter((source) => {
      const label = String(source.label || "").toLowerCase()
      const url = String(source.url || "").toLowerCase()
      return label.includes(query) || url.includes(query)
    })
  }, [feedSources, search])

  function isValidHttpUrl(value) {
    try {
      const parsed = new URL(String(value || "").trim())
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  async function loadFeedSources() {
    try {
      setFeedsLoading(true)
      setFeedsError("")
      const sources = await getFeedSources()
      setFeedSources(sources)
    } catch (err) {
      setFeedsError(err?.message || "Failed to load RSS feeds")
    } finally {
      setFeedsLoading(false)
    }
  }

  async function handleAddFeed() {
    const url = newFeedUrl.trim()
    if (!isValidHttpUrl(url)) {
      setFeedsError("Enter a valid feed URL starting with http:// or https://")
      return
    }

    try {
      setAddingFeed(true)
      setFeedsError("")
      const created = await createFeedSource({ url })
      setFeedSources((prev) => [...prev, created])
      setNewFeedUrl("")
    } catch (err) {
      setFeedsError(err?.message || "Failed to add feed")
    } finally {
      setAddingFeed(false)
    }
  }

  function startEdit(source) {
    setEditingId(source.id)
    setEditingUrl(source.url)
    setFeedsError("")
  }

  async function handleSaveEdit(sourceId) {
    const nextUrl = editingUrl.trim()
    if (!isValidHttpUrl(nextUrl)) {
      setFeedsError("Enter a valid feed URL starting with http:// or https://")
      return
    }

    try {
      setSavingId(sourceId)
      setFeedsError("")
      const updated = await updateFeedSource(sourceId, { url: nextUrl })
      setFeedSources((prev) => prev.map((item) => (item.id === sourceId ? updated : item)))
      setEditingId("")
      setEditingUrl("")
    } catch (err) {
      setFeedsError(err?.message || "Failed to update feed")
    } finally {
      setSavingId("")
    }
  }

  async function handleDeleteFeed(sourceId) {
    try {
      setDeletingId(sourceId)
      setFeedsError("")
      const remaining = await deleteFeedSource(sourceId)
      setFeedSources(remaining)
      if (editingId === sourceId) {
        setEditingId("")
        setEditingUrl("")
      }
    } catch (err) {
      setFeedsError(err?.message || "Failed to remove feed")
    } finally {
      setDeletingId("")
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit feeds" className="max-w-2xl max-h-[92vh] mx-3 sm:mx-0">
      <div className="px-5 py-4 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search feeds"
          className={cn(
            "w-full h-9 rounded-md border px-3 text-[12px] text-foreground outline-none focus:border-[#378ADD]",
            isLightTheme ? "border-slate-300 bg-white" : "border-white/10 bg-white/5"
          )}
        />

        <div
          className={cn(
            "rounded-lg border p-2 max-h-[58vh] overflow-y-auto space-y-2",
            isLightTheme ? "border-slate-200 bg-white" : "border-white/10 bg-[#141518]"
          )}
        >
          {feedsLoading ? <p className="text-[11px] text-muted-foreground px-1">Loading feeds...</p> : null}

          {!feedsLoading && feedsError ? (
            <p className="text-[11px] text-[#e07070] px-1">{feedsError}</p>
          ) : null}

          {!feedsLoading && !feedsError && filteredSources.length === 0 ? (
            <p className="text-[11px] text-muted-foreground px-1">No feed sources found.</p>
          ) : null}

          {!feedsLoading && filteredSources.map((source, index) => {
            const isEditing = editingId === source.id
            const busy = savingId === source.id || deletingId === source.id

            return (
              <div
                key={source.id}
                className={cn(
                  "rounded-md border p-2",
                  isLightTheme ? "border-slate-200" : "border-white/10"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">#{index + 1}</p>
                    {isEditing ? (
                      <input
                        value={editingUrl}
                        onChange={(e) => setEditingUrl(e.target.value)}
                        className={cn(
                          "mt-1 w-full h-8 rounded-md border px-2 text-[11px] text-foreground outline-none focus:border-[#378ADD]",
                          isLightTheme ? "border-slate-300 bg-white" : "border-white/10 bg-white/5"
                        )}
                      />
                    ) : (
                      <>
                        <p className="text-[12px] text-foreground truncate">{source.label || source.url}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{source.url}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(source.id)}
                          disabled={busy}
                          className="h-9 px-2 rounded-md border border-slate-300 bg-slate-900 text-[11px] text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId("")
                            setEditingUrl("")
                          }}
                          disabled={busy}
                          className={cn(
                            "h-9 px-2 rounded-md border text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            isLightTheme
                              ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                              : "border-white/10 text-zinc-200 hover:bg-white/5"
                          )}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(source)}
                        disabled={busy}
                        className={cn(
                          "h-9 px-2 rounded-md border text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                          isLightTheme
                            ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                            : "border-white/10 text-zinc-200 hover:bg-white/5"
                        )}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteFeed(source.id)}
                      disabled={busy}
                      className="h-9 px-2 rounded-md border border-[#7a1f2f] text-[11px] text-[#e48b9a] transition-colors hover:bg-[#7a1f2f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="https://example.com/rss.xml"
            className={cn(
              "flex-1 h-9 rounded-md border px-3 text-[12px] text-foreground outline-none focus:border-[#378ADD]",
              isLightTheme ? "border-slate-300 bg-white" : "border-white/10 bg-white/5"
            )}
          />
          <button
            type="button"
            onClick={handleAddFeed}
            disabled={addingFeed}
            className="h-9 inline-flex items-center rounded-md border border-slate-300 bg-slate-900 px-3 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 dark:border-[#1e4a78] dark:bg-[#1a3a5c] dark:text-[#7bb8f0] dark:hover:bg-[#204a73] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingFeed ? "Adding..." : "Confirm"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
