import { useState, useEffect, useCallback } from "react"
import { getFeed } from "@/utils/api"

export function useFeed({ companyId, type, search, scope }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFeed({
        company_id: companyId,
        type,
        search,
        scope,
      })
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [companyId, type, search, scope])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  return {
    items,
    loading,
    error,
    refetch: fetchFeed,
  }
}