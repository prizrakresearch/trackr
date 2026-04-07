import { useEffect, useState } from "react"
import { AppProvider, useApp } from "@/context/AppContext"
import { SettingsProvider, useSettingsContext } from "@/context/SettingsContext"
import { useCompanies } from "@/hooks/useCompanies"
import { useFeed } from "@/hooks/useFeed"
import { useProfile, normalizeProfile } from "@/hooks/userProfile"
import { ensurePersistedUserId, getCompanies, addCompany, removeCompany } from "@/utils/api"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { FeedHeader } from "@/components/feed/FeedHeader"
import { Feed } from "@/components/feed/Feed"
import { DetailPanel } from "@/components/panel/DetailPanel"
import { PanelHeader } from "@/components/panel/PanelHeader"
import { PanelBody } from "@/components/panel/PanelBody"
import { Settings } from "@/components/settings/Settings"
import { ManageEntities } from "@/components/entities/ManageEntities"
import { Onboarding } from "@/components/onboarding/Onboarding"

console.log("[App] App.jsx loaded");
function AppShell({ profile, companiesHook }) {
  const { companies, loading: companiesLoading, error: companiesError, add, remove } = companiesHook
  console.log("[AppShell] companiesHook:", companiesHook)
  const { settings, updateSettings } = useSettingsContext()
  const {
    activeCompanyId,
    setActiveCompanyId,
    typeFilter,
    search,
    activeItemId,
    clearActiveItem,
    setFeedMode,
  } = useApp()

  const [hasVisitedSpecificCompany, setHasVisitedSpecificCompany] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Listen for sidebar settings button
  useEffect(() => {
    function handleOpenSettings() {
      setSettingsOpen(true);
    }
    window.addEventListener("open-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("open-settings", handleOpenSettings)
    }
  }, []);
  const [manageOpen, setManageOpen] = useState(false)

  const {
    items,
    loading: feedLoading,
    error: feedError,
    refreshFeed,
    lastUpdatedAt,
  } = useFeed({
    companyId: activeCompanyId,
    type: typeFilter,
    search,
    scope: settings.scope,
  })
  console.log("[AppShell] useFeed items:", items)

  useEffect(() => {
    if (settings.openMode !== "new-tab" || !activeItemId) return
    const activeItem = items.find((item) => item.id === activeItemId)
    if (!activeItem?.url) return
    window.open(activeItem.url, "_blank", "noopener,noreferrer")
    clearActiveItem()
  }, [settings.openMode, activeItemId, items, clearActiveItem])

  const activeItem = items.find((item) => item.id === activeItemId)
  const activeItemCompany = activeItem
    ? companies.find((c) => c.id === activeItem.company_id) ||
      companies.find((c) => {
        if (!activeItem?.matched_keyword) return false
        return String(c.name ?? "")
          .toLowerCase()
          .includes(String(activeItem.matched_keyword).toLowerCase())
      })
    : null

  useEffect(() => {
    if (activeCompanyId !== 0) {
      setHasVisitedSpecificCompany(true)
    }
  }, [activeCompanyId])

  useEffect(() => {
    function isEditableTarget(target) {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName.toLowerCase()
      return tag === "input" || tag === "textarea" || target.isContentEditable
    }

    function focusVisibleSearchInput() {
      const inputs = Array.from(document.querySelectorAll('input[data-hotkey-search="true"]'))
      const visible = inputs.find((node) => node instanceof HTMLElement && node.offsetParent !== null)
      if (visible instanceof HTMLInputElement) {
        visible.focus()
        visible.select()
      }
    }

    function handleKeyDown(event) {
      if (!event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.toLowerCase()
      const toggleSidebarKey = String(settings.shortcuts?.toggleSidebar || "s").toLowerCase()
      const focusSearchKey = String(settings.shortcuts?.focusSearch || "d").toLowerCase()
      const refreshFeedKey = String(settings.shortcuts?.refreshFeed || "r").toLowerCase()

      if (key === toggleSidebarKey) {
        event.preventDefault()
        updateSettings({ sidebarOpen: !settings.sidebarOpen })
        return
      }

      if (key === focusSearchKey) {
        event.preventDefault()
        focusVisibleSearchInput()
        return
      }

      if (key === refreshFeedKey) {
        // Override browser reload to trigger feed refresh hotkey.
        event.preventDefault()
        refreshFeed()
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [refreshFeed, settings.sidebarOpen, settings.shortcuts, updateSettings])

  useEffect(() => {
    const username = (profile?.name?.trim() || "User").toLowerCase()

    if (activeCompanyId === 0) {
      document.title = hasVisitedSpecificCompany
        ? "trackr - All Companies"
        : `trackr - ${username}`
      return
    }

    const activeCompany = companies.find((c) => c.id === activeCompanyId)
    const shortName =
      activeCompany?.symbol?.trim() ||
      activeCompany?.shortName?.trim() ||
      activeCompany?.name?.trim() ||
      username

    document.title = `trackr - ${shortName}`
  }, [activeCompanyId, companies, profile?.name, hasVisitedSpecificCompany])

  return (
    <>
      {/* Desktop shell (fully isolated) */}
      <div className="hidden md:flex h-screen w-full bg-background text-foreground overflow-hidden">
        <Sidebar
          open={settings.sidebarOpen}
          companies={companies}
          feedItems={items}
          profile={profile}
          onManageEntities={() => setManageOpen(true)}
          onOpenStarred={() => {
            setFeedMode("starred")
            setActiveCompanyId(0)
            clearActiveItem()
          }}
          onRefresh={() => {
            console.log("[Sidebar] Refresh button clicked");
            refreshFeed();
          }}
          lastUpdatedAt={lastUpdatedAt}
          refreshLoading={feedLoading}
        />

        <div className="flex-1 min-w-0 flex flex-col bg-background">
          <FeedHeader
            companies={companies}
            itemCount={items.length}
            onToggleSidebar={() => updateSettings({ sidebarOpen: !settings.sidebarOpen })}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {(companiesError || feedError) && (
            <div className="px-3 py-2 border-b border-white/10 bg-[#3a1515]/40">
              <p className="text-[11px] text-[#e07070]">
                {companiesError || feedError}
              </p>
            </div>
          )}

          <Feed
            items={items}
            companies={companies}
            loading={feedLoading || companiesLoading}
          />
        </div>

        <DetailPanel items={settings.openMode === "panel" ? items : []} companies={companies} />
      </div>

      {/* Mobile shell (fully isolated) */}
      <div className="md:hidden h-[100dvh] min-h-[100dvh] w-full bg-background text-foreground flex flex-col overflow-hidden">
        {settings.sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => updateSettings({ sidebarOpen: false })}
          />
        )}

        <div
          className={`fixed left-0 top-0 h-full w-[70vw] bg-background border-r border-white/10 z-50 transition-transform duration-200 ${
            settings.sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            open={true}
            fullWidth={true}
            companies={companies}
            feedItems={items}
            profile={profile}
            onManageEntities={() => {
              setManageOpen(true)
              updateSettings({ sidebarOpen: false })
            }}
            onOpenStarred={() => {
              setFeedMode("starred")
              setActiveCompanyId(0)
              clearActiveItem()
              updateSettings({ sidebarOpen: false })
            }}
            onRefresh={refreshFeed}
            lastUpdatedAt={lastUpdatedAt}
            refreshLoading={feedLoading}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col bg-background">
          <FeedHeader
            companies={companies}
            itemCount={items.length}
            onToggleSidebar={() => updateSettings({ sidebarOpen: !settings.sidebarOpen })}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {(companiesError || feedError) && (
            <div className="px-3 py-2 border-b border-white/10 bg-[#3a1515]/40">
              <p className="text-[11px] text-[#e07070]">
                {companiesError || feedError}
              </p>
            </div>
          )}

          <Feed
            items={items}
            companies={companies}
            loading={feedLoading || companiesLoading}
          />
        </div>

        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
            settings.openMode === "panel" && !!activeItemId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={clearActiveItem}
        />

        <div
          className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-white/10 rounded-t-lg transition-transform duration-200 h-[90dvh] max-h-[90dvh] overflow-y-auto ${
            settings.openMode === "panel" && !!activeItemId ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {activeItem && (
            <>
              <PanelHeader item={activeItem} onClose={clearActiveItem} />
              <PanelBody item={activeItem} company={activeItemCompany} />
            </>
          )}
        </div>
      </div>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenManageCompanies={() => {
          setManageOpen(true)
          setSettingsOpen(false)
        }}
      />

      <ManageEntities
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        companies={companies}
        feedItems={items}
        loading={companiesLoading}
        error={companiesError || ""}
        onAdd={add}
        onRemove={remove}
      />
    </>
  )
}

function AppWithProviders({ profile, companiesHook }) {
  return (
    <SettingsProvider>
      <AppProvider>
        <AppShell profile={profile} companiesHook={companiesHook} />
      </AppProvider>
    </SettingsProvider>
  )
}

// ...existing code...

function App() {
  const { hasCompletedOnboarding, completeOnboarding: markOnboardingComplete, updateProfile, profile } = useProfile();
  const companiesHook = useCompanies();
  const PROFILE_STORAGE_KEY = "trackr_profile";

  useEffect(() => {
    ensurePersistedUserId()
  }, [])

  if (!hasCompletedOnboarding) {
    // Onboarding state (local, not from hooks)
    const [onboardProfile, setOnboardProfile] = useState(() => {
      try {
        const stored = localStorage.getItem("trackr_profile");
        return stored
          ? normalizeProfile(JSON.parse(stored))
          : normalizeProfile({ name: "", avatarUrl: null, avatarColor: null, avatarTextColor: null });
      } catch {
        return normalizeProfile({ name: "", avatarUrl: null, avatarColor: null, avatarTextColor: null });
      }
    });
    const [onboardCompanies, setOnboardCompanies] = useState([]);
    const [stepIndex, setStepIndex] = useState(() => {
      const stored = localStorage.getItem("trackr_onboard_step");
      return stored ? parseInt(stored, 10) || 0 : 0;
    });
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [finishing, setFinishing] = useState(false);
    const STEP_LABELS = ["Profile", "Companies", "Review"];

    // On mount, load companies from API for onboarding
    useEffect(() => {
      getCompanies().then(setOnboardCompanies).catch(() => setOnboardCompanies([]));
    }, []);

    function setOnboardProfileFields(updates) {
      setOnboardProfile((prev) => {
        const next = normalizeProfile({ ...prev, ...updates }, { trimText: false });
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
    function nextStep() {
      setStepIndex((prev) => {
        const next = Math.min(prev + 1, STEP_LABELS.length - 1);
        localStorage.setItem("trackr_onboard_step", next);
        return next;
      });
    }
    function previousStep() {
      setStepIndex((prev) => {
        const prevStep = Math.max(prev - 1, 0);
        localStorage.setItem("trackr_onboard_step", prevStep);
        return prevStep;
      });
    }
        // Clear onboarding step from localStorage when onboarding is finished
        useEffect(() => {
          if (hasCompletedOnboarding) {
            localStorage.removeItem("trackr_onboard_step");
          }
        }, [hasCompletedOnboarding]);
    async function handleAddCompany(payload) {
      try {
        setAddError("");
        setAdding(true);
        await addCompany(payload);
        // Reload companies from localStorage via getCompanies to sync state
        const companies = await getCompanies();
        setOnboardCompanies(companies);
      } catch (err) {
        setAddError(err?.message ?? "Failed to add company");
      } finally {
        setAdding(false);
      }
    }
    async function handleRemoveCompany(id) {
      try {
        setRemovingId(id);
        await removeCompany(id);
        // Reload companies from localStorage via getCompanies to sync state
        const companies = await getCompanies();
        setOnboardCompanies(companies);
      } finally {
        setRemovingId(null);
      }
    }
    async function handleFinish() {
      try {
        setFinishing(true);
        const finalProfile = normalizeProfile(onboardProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(finalProfile));
        // Update the profile in useProfile hook
        updateProfile(finalProfile);
        // Mark onboarding complete
        markOnboardingComplete();
        // No reload: let React rerender and localStorage update
      } finally {
        setFinishing(false);
      }
    }

    return (
      <Onboarding
        profile={onboardProfile}
        updateProfile={setOnboardProfileFields}
        companies={onboardCompanies}
        addCompany={handleAddCompany}
        removeCompany={handleRemoveCompany}
        completeOnboarding={handleFinish}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        nextStep={nextStep}
        previousStep={previousStep}
        adding={adding}
        addError={addError}
        removingId={removingId}
        finishing={finishing}
        stepLabels={STEP_LABELS}
      />
    );
  }

  // After onboarding, return main app shell
  // Use the profile from useProfile, not onboardProfile
  return <AppWithProviders profile={profile} companiesHook={companiesHook} />;
}

export default App;