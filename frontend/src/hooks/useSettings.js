import { useState, useEffect } from "react"

const DEFAULT_SHORTCUTS = {
  toggleSidebar: "s",
  focusSearch: "d",
  refreshFeed: "r",
}

const SETTINGS_VERSION = 2

const DEFAULTS = {
  settingsVersion: SETTINGS_VERSION,
  density: "comfortable",
  sidebarOpen: true,
  scope: "all",
  openMode: "panel",
  theme: "system", // 'dark', 'light', or 'system'
  shortcuts: DEFAULT_SHORTCUTS,
}

const STORAGE_KEY = "trackr_settings"

function sanitizeShortcutKey(value, fallback) {
  const next = String(value ?? "").trim().toLowerCase()
  if (/^[a-z0-9]$/.test(next)) return next
  return fallback
}

function normalizeShortcuts(shortcuts = {}) {
  return {
    toggleSidebar: sanitizeShortcutKey(shortcuts.toggleSidebar, DEFAULT_SHORTCUTS.toggleSidebar),
    focusSearch: sanitizeShortcutKey(shortcuts.focusSearch, DEFAULT_SHORTCUTS.focusSearch),
    refreshFeed: sanitizeShortcutKey(shortcuts.refreshFeed, DEFAULT_SHORTCUTS.refreshFeed),
  }
}

function normalizeSettings(raw) {
  const source = raw || {}
  const isLegacy = source.settingsVersion !== SETTINGS_VERSION
  const merged = { ...DEFAULTS, ...source }

  if (isLegacy) {
    // Migrate older installs from strict today-only scope to available/all scope.
    merged.scope = "all"
  }

  return {
    ...merged,
    settingsVersion: SETTINGS_VERSION,
    shortcuts: normalizeShortcuts(merged.shortcuts),
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? normalizeSettings(JSON.parse(stored)) : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  // Track system theme for re-render
  const getSystemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    let theme = settings.theme;
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      theme = mql.matches ? "dark" : "light";
      // Listen for system changes
      const handler = (e) => {
        const sysTheme = e.matches ? "dark" : "light";
        setSystemTheme(sysTheme); // trigger re-render
        document.documentElement.classList.toggle("dark", sysTheme === "dark");
      };
      mql.addEventListener("change", handler);
      // Set initial class
      document.documentElement.classList.toggle("dark", theme === "dark");
      // Cleanup
      return () => mql.removeEventListener("change", handler);
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [settings])

  // Also update systemTheme if theme is system and system changes (to trigger re-render)
  useEffect(() => {
    if (settings.theme !== "system") return;
    setSystemTheme(getSystemTheme());
  }, [settings.theme])

  function updateSettings(updates) {
    setSettings((prev) => normalizeSettings({ ...prev, ...updates }))
  }

  return { settings, updateSettings, systemTheme }
}