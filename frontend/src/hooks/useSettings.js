import { useState, useEffect } from "react"

const DEFAULTS = {
  density: "comfortable",
  sidebarOpen: true,
  scope: "today",
  openMode: "panel",
}

const STORAGE_KEY = "trackr_settings"

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  function updateSettings(updates) {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  return { settings, updateSettings }
}