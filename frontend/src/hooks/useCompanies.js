import { useState, useEffect, useCallback } from "react"
import { getCompanies, addCompany, removeCompany } from "@/utils/api"

export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[useCompanies] Fetching companies...")
      const data = await getCompanies()
      console.log("[useCompanies] Companies fetched:", data)
      setCompanies(data)
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
    refetch: fetchCompanies,
    add,
    remove,
  }
}