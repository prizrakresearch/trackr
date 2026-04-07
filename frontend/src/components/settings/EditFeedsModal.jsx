import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/shared/Modal"
import { useSettingsContext } from "@/context/SettingsContext"
import {
  createFeedSource,
  deleteFeedSource,
  exportFeedSources,
  getFeedSources,
  updateFeedSource,
} from "@/utils/api"

const CATEGORY_OPTIONS = [
  { value: "news", label: "News" },
  { value: "filing", label: "Filings" },
  { value: "press", label: "Press releases" },
]

export function EditFeedsModal({ open, onClose }) {
  const { settings, systemTheme } = useSettingsContext()
  const resolvedTheme = settings.theme === "system" ? systemTheme : settings.theme
  const isLightTheme = resolvedTheme === "light"

  const [feedSources, setFeedSources] = useState([])
  const [feedsLoading, setFeedsLoading] = useState(false)
  const [feedsError, setFeedsError] = useState("")
  const [search, setSearch] = useState("")
  const [newFeedUrl, setNewFeedUrl] = useState("")
  const [newFeedCategory, setNewFeedCategory] = useState("news")
  const [addingFeed, setAddingFeed] = useState(false)
  const [editingId, setEditingId] = useState("")
  const [editingUrl, setEditingUrl] = useState("")
  const [editingCategory, setEditingCategory] = useState("news")
  const [savingId, setSavingId] = useState("")
  const [deletingId, setDeletingId] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkCategory, setBulkCategory] = useState("filing")
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)
  const csvInputRef = useRef(null)

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
      setSelectedIds([])
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
      const created = await createFeedSource({ url, category: newFeedCategory })
      setFeedSources((prev) => [...prev, created])
      setNewFeedUrl("")
      setNewFeedCategory("news")
    } catch (err) {
      setFeedsError(err?.message || "Failed to add feed")
    } finally {
      setAddingFeed(false)
    }
  }

  function startEdit(source) {
    setEditingId(source.id)
    setEditingUrl(source.url)
    setEditingCategory(source.category || "news")
    setFeedsError("")
  }

  function normalizeCategory(value) {
    const raw = String(value || "news").trim().toLowerCase()
    if (["filing", "filings", "corporate-filing", "corporate filings"].includes(raw)) return "filing"
    if (["press", "pressrelease", "press releases", "press-release"].includes(raw)) return "press"
    return "news"
  }

  function toggleRowSelection(sourceId) {
    setSelectedIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    )
  }

  function toggleSelectAllVisible() {
    const visibleIds = filteredSources.map((item) => item.id)
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
  }

  async function handleInlineCategoryChange(sourceId, category) {
    try {
      setSavingId(sourceId)
      setFeedsError("")
      const updated = await updateFeedSource(sourceId, { category })
      setFeedSources((prev) => prev.map((item) => (item.id === sourceId ? updated : item)))
    } catch (err) {
      setFeedsError(err?.message || "Failed to update category")
    } finally {
      setSavingId("")
    }
  }

  async function handleBulkCategoryApply() {
    if (!selectedIds.length) return

    try {
      setBulkSaving(true)
      setFeedsError("")

      for (const sourceId of selectedIds) {
        await updateFeedSource(sourceId, { category: bulkCategory })
      }

      await loadFeedSources()
    } catch (err) {
      setFeedsError(err?.message || "Failed to apply category to selected feeds")
    } finally {
      setBulkSaving(false)
    }
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return

    try {
      setBulkDeleting(true)
      setFeedsError("")

      for (const sourceId of selectedIds) {
        await deleteFeedSource(sourceId)
      }

      await loadFeedSources()
    } catch (err) {
      setFeedsError(err?.message || "Failed to delete selected feeds")
    } finally {
      setBulkDeleting(false)
    }
  }

  async function handleCsvUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingCsv(true)
      setFeedsError("")

      const text = await file.text()
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      if (!lines.length) {
        setFeedsError("CSV file is empty")
        return
      }

      const parsedRows = []
      for (let i = 0; i < lines.length; i += 1) {
        const parts = lines[i].split(",")
        const feed = String(parts[0] || "").trim()
        const category = normalizeCategory(parts[1])

        const isHeader = i === 0 && ["feed", "feed_url", "url"].includes(feed.toLowerCase())
        if (isHeader) continue
        if (!feed || !isValidHttpUrl(feed)) continue

        parsedRows.push({ url: feed, category })
      }

      if (!parsedRows.length) {
        setFeedsError("No valid feed rows found in CSV")
        return
      }

      const existing = await getFeedSources()
      const byUrl = new Map(existing.map((item) => [String(item.url).toLowerCase(), item]))

      for (const row of parsedRows) {
        const match = byUrl.get(String(row.url).toLowerCase())
        if (match) {
          await updateFeedSource(match.id, { url: row.url, category: row.category })
        } else {
          await createFeedSource({ url: row.url, category: row.category })
        }
      }

      await loadFeedSources()
    } catch (err) {
      setFeedsError(err?.message || "Failed to upload CSV")
    } finally {
      setUploadingCsv(false)
      if (csvInputRef.current) {
        csvInputRef.current.value = ""
      }
    }
  }

  async function handleExportCsv() {
    try {
      setExportingCsv(true)
      setFeedsError("")

      const { blob, fileName } = await exportFeedSources()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = fileName || "feed-sources.csv"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setFeedsError(err?.message || "Failed to export CSV")
    } finally {
      setExportingCsv(false)
    }
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
      const updated = await updateFeedSource(sourceId, {
        url: nextUrl,
        category: editingCategory,
      })
      setFeedSources((prev) => prev.map((item) => (item.id === sourceId ? updated : item)))
      setEditingId("")
      setEditingUrl("")
      setEditingCategory("news")
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
        setEditingCategory("news")
      }
    } catch (err) {
      setFeedsError(err?.message || "Failed to remove feed")
    } finally {
      setDeletingId("")
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit feeds" className="w-[92vw] max-w-[92vw] max-h-[92vh] mx-0">
      <div className="px-5 py-4 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search feeds"
          className={cn(
            "w-full h-9 rounded-md border px-3 text-[12px] text-foreground outline-none focus:border-[#378ADD]",
            isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
          )}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={filteredSources.length > 0 && filteredSources.every((item) => selectedIds.includes(item.id))}
              onChange={toggleSelectAllVisible}
            />
            Select all visible
          </label>

          <div className="flex items-center gap-2">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className={cn(
                "h-9 rounded-md border px-2 text-[12px] text-foreground outline-none focus:border-[#378ADD]",
                isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
              )}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleBulkCategoryApply}
              disabled={!selectedIds.length || bulkSaving}
              className={cn(
                "h-9 px-3 rounded-md border text-[12px] disabled:opacity-50 disabled:cursor-not-allowed",
                isLightTheme
                  ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "border-white/10 text-zinc-200 hover:bg-white/5"
              )}
            >
              {bulkSaving ? "Applying..." : "Apply category"}
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={!selectedIds.length || bulkDeleting}
              className="h-9 px-3 rounded-md border border-[#7a1f2f] text-[12px] text-[#e48b9a] transition-colors hover:bg-[#7a1f2f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleting ? "Deleting..." : "Delete selected"}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg border p-2 max-h-[62vh] overflow-y-auto space-y-2",
            isLightTheme ? "border-slate-200 bg-white" : "border-white/20 bg-white/[0.03]"
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
                  isLightTheme ? "border-slate-200" : "border-white/20"
                )}
              >
                <div className="grid grid-cols-1 lg:grid-cols-[76px_minmax(0,1fr)_190px_92px_120px] gap-2 items-center">
                  <div className="flex items-center gap-2 pl-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(source.id)}
                      onChange={() => toggleRowSelection(source.id)}
                    />
                    <span className="text-[11px] text-muted-foreground">#{index + 1}</span>
                  </div>

                  <div className="min-w-0">
                    <input
                      value={isEditing ? editingUrl : source.url}
                      onChange={(e) => setEditingUrl(e.target.value)}
                      readOnly={!isEditing}
                      className={cn(
                        "w-full h-9 rounded-md border px-2 text-[11px] text-foreground outline-none focus:border-[#378ADD]",
                        isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]",
                        !isEditing && "opacity-85"
                      )}
                    />
                  </div>

                  <select
                    value={isEditing ? editingCategory : (source.category || "news")}
                    onChange={(e) => {
                      const next = e.target.value
                      if (isEditing) {
                        setEditingCategory(next)
                      } else {
                        handleInlineCategoryChange(source.id, next)
                      }
                    }}
                    disabled={busy}
                    className={cn(
                      "h-9 rounded-md border px-2 text-[11px] text-foreground outline-none focus:border-[#378ADD] disabled:opacity-50 disabled:cursor-not-allowed",
                      isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
                    )}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteFeed(source.id)}
                    disabled={busy}
                    className="h-9 px-2 rounded-md border border-[#7a1f2f] text-[11px] text-[#e48b9a] transition-colors hover:bg-[#7a1f2f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
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
                          setEditingCategory("news")
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
                    </div>
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
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_170px_auto_auto_auto] gap-2">
          <input
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="https://example.com/rss.xml"
            className={cn(
              "h-9 rounded-md border px-3 text-[12px] text-foreground outline-none focus:border-[#378ADD]",
              isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
            )}
          />
          <select
            value={newFeedCategory}
            onChange={(e) => setNewFeedCategory(e.target.value)}
            className={cn(
              "h-9 rounded-md border px-2 text-[12px] text-foreground outline-none focus:border-[#378ADD]",
              isLightTheme ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
            )}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={uploadingCsv}
            className={cn(
              "h-9 px-3 rounded-md border text-[12px] disabled:opacity-50 disabled:cursor-not-allowed",
              isLightTheme
                ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                : "border-white/10 text-zinc-200 hover:bg-white/5"
            )}
          >
            {uploadingCsv ? "Uploading..." : "Upload CSV"}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className={cn(
              "h-9 px-3 rounded-md border text-[12px] disabled:opacity-50 disabled:cursor-not-allowed",
              isLightTheme
                ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                : "border-white/10 text-zinc-200 hover:bg-white/5"
            )}
          >
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvUpload}
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
