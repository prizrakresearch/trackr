import { createContext, useContext, useState } from "react"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeCompanyId, setActiveCompanyId] = useState(0)
  const [activeItemId, setActiveItemId] = useState(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")

  function clearActiveItem() {
    setActiveItemId(null)
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