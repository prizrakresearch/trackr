import { useEffect, useState } from "react"
import { AppProvider, useApp } from "@/context/AppContext"
import { SettingsProvider, useSettingsContext } from "@/context/SettingsContext"
import { useCompanies } from "@/hooks/useCompanies"
import { useFeed } from "@/hooks/useFeed"
import { useProfile } from "@/hooks/userProfile"
import { getCompanies, addCompany, removeCompany } from "@/utils/api"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { FeedHeader } from "@/components/feed/FeedHeader"
import { Feed } from "@/components/feed/Feed"
import { DetailPanel } from "@/components/panel/DetailPanel"
import { Settings } from "@/components/settings/Settings"
import { ManageEntities } from "@/components/entities/ManageEntities"
import { Onboarding } from "@/components/onboarding/Onboarding"

function AppShell({ profile, companiesHook }) {
  const { companies, loading: companiesLoading, error: companiesError, add, remove } = companiesHook
  const { settings, updateSettings } = useSettingsContext()
  const { activeCompanyId, typeFilter, search, activeItemId, clearActiveItem } = useApp()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

  const {
    items,
    loading: feedLoading,
    error: feedError,
  } = useFeed({
    companyId: activeCompanyId,
    type: typeFilter,
    search,
    scope: settings.scope,
  })

  useEffect(() => {
    if (settings.openMode !== "new-tab" || !activeItemId) return
    const activeItem = items.find((item) => item.id === activeItemId)
    if (!activeItem?.url) return
    window.open(activeItem.url, "_blank", "noopener,noreferrer")
    clearActiveItem()
  }, [settings.openMode, activeItemId, items, clearActiveItem])

  return (
    <div className="h-screen w-full bg-background text-foreground flex overflow-hidden">
      <Sidebar
        open={settings.sidebarOpen}
        companies={companies}
        feedItems={items}
        profile={profile}
        onManageEntities={() => setManageOpen(true)}
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

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />

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
    </div>
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

  if (!hasCompletedOnboarding) {
    // Onboarding state (local, not from hooks)
    const [onboardProfile, setOnboardProfile] = useState(() => {
      try {
        const stored = localStorage.getItem("trackr_profile");
        return stored ? JSON.parse(stored) : { name: "", avatarUrl: null };
      } catch {
        return { name: "", avatarUrl: null };
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
      setOnboardProfile((prev) => ({ ...prev, ...updates }));
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
        // Update the profile in useProfile hook
        updateProfile(onboardProfile);
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