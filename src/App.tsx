/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DownloadCloud, X } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ViewKey } from './components/layout/Sidebar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { ScientificReportModal } from './components/report/ScientificReportModal';
import { CloudflareDeployModal } from './components/common/CloudflareDeployModal';
import { SystemSettingsModal } from './components/settings/SystemSettingsModal';
import { LegalOnboardingModal } from './components/onboarding/LegalOnboardingModal';
import { ContextualOnboardingBanner } from './components/onboarding/ContextualOnboardingBanner';
import { DataModeProvider } from './context/DataModeContext';
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { SystemSettingsProvider, useSystemSettings } from './context/SystemSettingsContext';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { LandingPageView } from './components/landing/LandingPageView';
import { InteractiveMapView } from './components/map/InteractiveMapView';
import { SurfaceCO2View } from './components/surface/SurfaceCO2View';
import { XCO2View } from './components/xco2/XCO2View';
import { VerticalProfilesView } from './components/profiles/VerticalProfilesView';
import { LinesExplorerView } from './components/spectroscopy/LinesExplorerView';
import { PQRVisualizationView } from './components/spectroscopy/PQRVisualizationView';
import { SpectroscopyLabView } from './components/spectroscopy/SpectroscopyLabView';
import { RadiativeTransferValidationView } from './components/spectroscopy/RadiativeTransferValidationView';
import { FluxEmissionsView } from './components/flux/FluxEmissionsView';
import { MultiSourceCompareView } from './components/compare/MultiSourceCompareView';
import { FranceEuropeView } from './components/regional/FranceEuropeView';
import { DocumentationView } from './components/docs/DocumentationView';
import { RealDataAuditView } from './components/audit/RealDataAuditView';

const AppShell: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewKey>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCloudflareOpen, setIsCloudflareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { openLegalModal } = useOnboarding();
  const { backgroundToast, dismissBackgroundToast } = useSystemSettings();

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPageView
            onSelectView={setCurrentView}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenLegal={openLegalModal}
          />
        );
      case 'dashboard':
        return <DashboardView onSelectView={setCurrentView} expertMode={expertMode} />;
      case 'map':
        return <InteractiveMapView />;
      case 'surface':
        return <SurfaceCO2View />;
      case 'xco2':
        return <XCO2View />;
      case 'profiles':
        return <VerticalProfilesView />;
      case 'spectroscopy-lines':
        return <LinesExplorerView />;
      case 'spectroscopy-pqr':
        return <PQRVisualizationView />;
      case 'spectroscopy-lab':
        return <SpectroscopyLabView />;
      case 'spectroscopy-validation':
        return <RadiativeTransferValidationView />;
      case 'flux':
      case 'emissions':
        return <FluxEmissionsView />;
      case 'compare':
        return <MultiSourceCompareView />;
      case 'france':
        return <FranceEuropeView />;
      case 'pipeline-audit':
        return <RealDataAuditView />;
      case 'sources':
      case 'docs':
        return <DocumentationView />;
      default:
        return <DashboardView onSelectView={setCurrentView} expertMode={expertMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        expertMode={expertMode}
        onToggleExpertMode={() => setExpertMode(!expertMode)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenCloudflareModal={() => setIsCloudflareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ContextualOnboardingBanner currentView={currentView} />
          {renderActiveView()}
        </main>
      </div>

      {/* PWA Offline indicator */}
      <OfflineIndicator />

      {/* Background Auto-Update Notification Toast */}
      {backgroundToast && (
        <div
          role="status"
          className="fixed bottom-4 left-4 z-50 max-w-md flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs text-slate-100 shadow-2xl"
        >
          <DownloadCloud className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="flex-1 leading-relaxed">{backgroundToast}</p>
          <button
            type="button"
            onClick={dismissBackgroundToast}
            aria-label="Fermer la notification de mise à jour"
            className="p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Legal Disclaimer & Novice Onboarding Modal */}
      <LegalOnboardingModal />

      {/* System Settings & Automatic Update Modal */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Scientific Audit Report Generator Modal */}
      <ScientificReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Cloudflare Pages Deployment Guide Modal */}
      <CloudflareDeployModal
        isOpen={isCloudflareOpen}
        onClose={() => setIsCloudflareOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <SystemSettingsProvider>
          <DataModeProvider>
            <AppShell />
          </DataModeProvider>
        </SystemSettingsProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
