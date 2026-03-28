import { useState, useEffect } from "react"

const STORAGE_KEY = "trackr_profile"

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : { name: "", avatarUrl: null }
    } catch {
      return { name: "", avatarUrl: null }
    }
  })

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("trackr_onboarded") === "true"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  function updateProfile(updates) {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  function completeOnboarding() {
    localStorage.setItem("trackr_onboarded", "true")
    setHasCompletedOnboarding(true)
  }

  function resetOnboarding() {
    localStorage.removeItem("trackr_onboarded")
    localStorage.removeItem(STORAGE_KEY)
    setHasCompletedOnboarding(false)
    setProfile({ name: "", avatarUrl: null })
  }

  return {
    profile,
    updateProfile,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  }
}