/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ViewKey } from './components/layout/Sidebar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { ScientificReportModal } from './components/report/ScientificReportModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { InteractiveMapView } from './components/map/InteractiveMapView';
import { SurfaceCO2View } from './components/surface/SurfaceCO2View';
import { XCO2View } from './components/xco2/XCO2View';
import { VerticalProfilesView } from './components/profiles/VerticalProfilesView';
import { LinesExplorerView } from './components/spectroscopy/LinesExplorerView';
import { PQRVisualizationView } from './components/spectroscopy/PQRVisualizationView';
import { SpectroscopyLabView } from './components/spectroscopy/SpectroscopyLabView';
import { FluxEmissionsView } from './components/flux/FluxEmissionsView';
import { MultiSourceCompareView } from './components/compare/MultiSourceCompareView';
import { FranceEuropeView } from './components/regional/FranceEuropeView';
import { DocumentationView } from './components/docs/DocumentationView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
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
      case 'flux':
      case 'emissions':
        return <FluxEmissionsView />;
      case 'compare':
        return <MultiSourceCompareView />;
      case 'france':
        return <FranceEuropeView />;
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
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
          {renderActiveView()}
        </main>
      </div>

      {/* PWA Offline indicator */}
      <OfflineIndicator />

      {/* Scientific Audit Report Generator Modal */}
      <ScientificReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
