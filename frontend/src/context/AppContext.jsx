import { createContext, useContext, useEffect, useMemo, useState } from "react"

const AppContext = createContext(null)
const STARRED_STORAGE_KEY = "trackr_starred_article_ids"

export function AppProvider({ children }) {
  const [activeCompanyId, setActiveCompanyId] = useState(0)
  const [activeItemId, setActiveItemId] = useState(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [feedMode, setFeedMode] = useState("all")
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const raw = localStorage.getItem(STARRED_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.map((value) => String(value)) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(starredIds))
    } catch {
      // Ignore storage write errors.
    }
  }, [starredIds])

  const starredSet = useMemo(() => new Set(starredIds), [starredIds])

  function clearActiveItem() {
    setActiveItemId(null)
  }

  function isStarred(itemId) {
    return starredSet.has(String(itemId))
  }

  function toggleStar(itemId) {
    const id = String(itemId)
    setStarredIds((prev) => {
      const exists = prev.includes(id)
      if (exists) return prev.filter((value) => value !== id)
      return [...prev, id]
    })
  }

  return (
    <AppContext.Provider
      value={{
        activeCompanyId,
        setActiveCompanyId,
        activeItemId,
        setActiveItemId,
        clearActiveItem,
        typeFilter,
        setTypeFilter,
        search,
        setSearch,
        feedMode,
        setFeedMode,
        starredIds,
        isStarred,
        toggleStar,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}