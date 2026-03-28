import { createContext, useContext } from "react"
import { useSettings } from "@/hooks/useSettings"

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const { settings, updateSettings, systemTheme } = useSettings()

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, systemTheme }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettingsContext must be used within SettingsProvider")
  return ctx
}