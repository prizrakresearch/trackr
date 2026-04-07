import { useState, useEffect, useCallback } from "react"
import { getCompanies, addCompany, removeCompany, saveWatchlistKeywords, ensurePersistedUserId } from "@/utils/api"

function buildAllKeywords(companies = []) {
  const seen = new Set()
  const keywords = []
  for (const company of companies) {
    const extras = Array.isArray(company?.keywords) ? company.keywords : []
    for (const value of [company?.name, company?.symbol, ...extras]) {
      const cleaned = String(value || "").trim()
      if (!cleaned) continue
      const marker = cleaned.toLowerCase()
      if (seen.has(marker)) continue
      seen.add(marker)
      keywords.push(cleaned)
    }
  }
  return keywords
}

export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [watchlistSynced, setWatchlistSynced] = useState(false)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[useCompanies] Fetching companies...")
      const data = await getCompanies()
      console.log("[useCompanies] Companies fetched:", data)
      setCompanies(data)
      // Sync full keyword list on load to repair any partial watchlist state
      const keywords = buildAllKeywords(data)
      const userId = ensurePersistedUserId()
      await saveWatchlistKeywords(keywords, userId)
      console.log("[useCompanies] Synced all company keywords to backend watchlist.", keywords.length, keywords)
      setWatchlistSynced(true)
    } catch (err) {
      setError(err.message)
      console.error("[useCompanies] Error fetching companies:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  async function add(company) {
    const created = await addCompany(company)
    setCompanies((prev) => [...prev, created])
    return created
  }

  async function remove(id) {
    await removeCompany(id)
    setCompanies((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    companies,
    loading,
    error,
    watchlistSynced,
    refetch: fetchCompanies,
    add,
    remove,
  }
}