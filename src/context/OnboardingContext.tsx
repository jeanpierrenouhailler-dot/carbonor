import React, { createContext, useContext, useState } from 'react';

const LEGAL_STORAGE_KEY = 'carbonor_legal_accepted_v1';
const NOVICE_TIPS_STORAGE_KEY = 'carbonor_novice_tips_enabled';
const DISMISSED_VIEWS_STORAGE_KEY = 'carbonor_dismissed_onboarding_views';

interface OnboardingContextValue {
  legalAccepted: boolean;
  legalAcceptedAt: string | null;
  showLegalModal: boolean;
  noviceTipsEnabled: boolean;
  dismissedViews: Record<string, boolean>;
  acceptLegalNotice: () => void;
  openLegalModal: () => void;
  closeLegalModal: () => void;
  setNoviceTipsEnabled: (enabled: boolean) => void;
  dismissViewGuide: (viewKey: string) => void;
  restoreAllGuides: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

function readLegalState(): { accepted: boolean; acceptedAt: string | null } {
  if (typeof window === 'undefined') return { accepted: false, acceptedAt: null };
  try {
    const raw = window.localStorage.getItem(LEGAL_STORAGE_KEY);
    if (!raw) return { accepted: false, acceptedAt: null };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.accepted === true) {
      return { accepted: true, acceptedAt: parsed.acceptedAt || null };
    }
  } catch {
    // Ignore parse errors
  }
  return { accepted: false, acceptedAt: null };
}

function readNoviceTipsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(NOVICE_TIPS_STORAGE_KEY);
    if (raw === 'false') return false;
  } catch {
    // Ignore
  }
  return true;
}

function readDismissedViews(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DISMISSED_VIEWS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) || {};
  } catch {
    // Ignore
  }
  return {};
}

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLegal = readLegalState();
  const [legalAccepted, setLegalAccepted] = useState<boolean>(initialLegal.accepted);
  const [legalAcceptedAt, setLegalAcceptedAt] = useState<string | null>(initialLegal.acceptedAt);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(!initialLegal.accepted);
  const [noviceTipsEnabled, setNoviceTipsState] = useState<boolean>(readNoviceTipsEnabled);
  const [dismissedViews, setDismissedViews] = useState<Record<string, boolean>>(readDismissedViews);

  const acceptLegalNotice = () => {
    const now = new Date().toISOString();
    setLegalAccepted(true);
    setLegalAcceptedAt(now);
    setShowLegalModal(false);
    try {
      window.localStorage.setItem(
        LEGAL_STORAGE_KEY,
        JSON.stringify({ accepted: true, acceptedAt: now })
      );
    } catch {
      // Ignore storage error
    }
  };

  const openLegalModal = () => setShowLegalModal(true);
  const closeLegalModal = () => {
    if (legalAccepted) {
      setShowLegalModal(false);
    }
  };

  const setNoviceTipsEnabled = (enabled: boolean) => {
    setNoviceTipsState(enabled);
    try {
      window.localStorage.setItem(NOVICE_TIPS_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore
    }
  };

  const dismissViewGuide = (viewKey: string) => {
    setDismissedViews((prev) => {
      const next = { ...prev, [viewKey]: true };
      try {
        window.localStorage.setItem(DISMISSED_VIEWS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const restoreAllGuides = () => {
    setNoviceTipsState(true);
    setDismissedViews({});
    try {
      window.localStorage.setItem(NOVICE_TIPS_STORAGE_KEY, 'true');
      window.localStorage.removeItem(DISMISSED_VIEWS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        legalAccepted,
        legalAcceptedAt,
        showLegalModal,
        noviceTipsEnabled,
        dismissedViews,
        acceptLegalNotice,
        openLegalModal,
        closeLegalModal,
        setNoviceTipsEnabled,
        dismissViewGuide,
        restoreAllGuides,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding doit être utilisé à l’intérieur de OnboardingProvider.');
  }
  return ctx;
}
