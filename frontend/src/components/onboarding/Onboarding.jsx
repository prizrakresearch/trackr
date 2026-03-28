import { useState } from "react"
import { StepDots } from "./StepDots"
import { StepProfile } from "./StepProfile"
import { StepCompanies } from "./StepCompanies"
import { StepReview } from "./StepReview"

const STEP_LABELS = ["Profile", "Companies", "Review"]

export function Onboarding({
  profile,
  updateProfile,
  companies = [],
  addCompany,
  removeCompany,
  completeOnboarding,
  stepIndex,
  setStepIndex,
  nextStep,
  previousStep,
  adding,
  addError,
  removingId,
  finishing,
  stepLabels = ["Profile", "Companies", "Review"],
}) {
  return (
    <div className="min-h-screen bg-[#0e0f11] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-white/10 bg-[#141518] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <StepDots
            currentStep={stepIndex}
            totalSteps={stepLabels.length}
            labels={stepLabels}
          />

          <div className="mt-6">
            {stepIndex === 0 ? (
              <StepProfile profile={profile} onChange={updateProfile} onNext={nextStep} />
            ) : null}

            {stepIndex === 1 ? (
              <StepCompanies
                companies={companies}
                onAdd={addCompany}
                onRemove={removeCompany}
                adding={adding}
                addError={addError}
                removingId={removingId}
                onNext={nextStep}
              />
            ) : null}

            {stepIndex === 2 ? (
              <StepReview
                profile={profile}
                companies={companies}
                onBack={previousStep}
                onFinish={completeOnboarding}
                finishing={finishing}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
