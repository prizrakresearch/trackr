import { useState, useEffect } from "react"

const STORAGE_KEY = "trackr_profile"
const DEFAULT_PROFILE = {
  name: "",
  organization: "",
  avatarUrl: null,
  avatarColor: null,
  avatarTextColor: null,
}

export function normalizeProfile(rawProfile, options = {}) {
  const { trimText = true } = options
  const raw = rawProfile && typeof rawProfile === "object" ? rawProfile : {}
  const resolvedName =
    raw.name ?? raw.username ?? raw.userName ?? raw.displayName ?? raw.fullName ?? ""
  const normalizedName = String(resolvedName || "")
  const normalizedOrganization = String(raw.organization ?? raw.org ?? raw.company ?? "")

  return {
    name: trimText ? normalizedName.trim() : normalizedName,
    organization: trimText ? normalizedOrganization.trim() : normalizedOrganization,
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
    avatarColor: raw.avatarColor ?? raw.avatar_color ?? null,
    avatarTextColor: raw.avatarTextColor ?? raw.avatar_text_color ?? null,
  }
}

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? normalizeProfile(JSON.parse(stored)) : DEFAULT_PROFILE
    } catch {
      return DEFAULT_PROFILE
    }
  })

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("trackr_onboarded") === "true"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  function updateProfile(updates) {
    setProfile((prev) => normalizeProfile({ ...prev, ...updates }))
  }

  function completeOnboarding() {
    localStorage.setItem("trackr_onboarded", "true")
    setHasCompletedOnboarding(true)
  }

  function resetOnboarding() {
    localStorage.removeItem("trackr_onboarded")
    localStorage.removeItem(STORAGE_KEY)
    setHasCompletedOnboarding(false)
    setProfile(DEFAULT_PROFILE)
  }

  return {
    profile,
    updateProfile,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  }
}