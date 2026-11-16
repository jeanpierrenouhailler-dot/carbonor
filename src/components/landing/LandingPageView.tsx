import React, { useState } from 'react';
import { ArrowRight, Globe2 } from 'lucide-react';
import type { ViewKey } from '../layout/Sidebar';
import { Button } from './ui/Button';
import { HeroSection } from './sections/HeroSection';
import { EpistemologySection } from './sections/EpistemologySection';
import { PipelineAndSourcesSection } from './sections/PipelineAndSourcesSection';
import { ModulesBentoSection } from './sections/ModulesBentoSection';
import { MechanismsAndSimulatorSection } from './sections/MechanismsAndSimulatorSection';
import { AudienceAndPwaSection } from './sections/AudienceAndPwaSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaAndFooterSection } from './sections/FinalCtaAndFooterSection';
import { ScreenshotLightboxModal } from './sections/ScreenshotLightboxModal';
import type { ScreenshotItem } from './sections/landingData';

interface LandingPageViewProps {
  onSelectView: (view: ViewKey) => void;
  onOpenReport?: () => void;
}

const QUICK_NAV_ITEMS = [
  { id: 'pourquoi', label: 'Pourquoi ?' },
  { id: 'fonctionnement', label: 'Architecture' },
  { id: 'fonctionnalites', label: 'Modules' },
  { id: 'mecanismes', label: 'Sciences' },
  { id: 'sources', label: 'Sources' },
  { id: 'rigueur', label: 'Transparence' },
  { id: 'faq', label: 'FAQ' },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSelectView,
  onOpenReport,
}) => {
  const [zoomedScreenshot, setZoomedScreenshot] =
    useState<ScreenshotItem | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="obs-atmosphere-canvas -m-4 md:-m-6 lg:-m-8 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 text-obs-text">
      <div className="max-w-6xl mx-auto space-y-20 lg:space-y-28">
        {/* Barre sommaire éditoriale sobre non-sticky */}
        <nav
          aria-label="Navigation rapide de la présentation"
          className="rounded-[var(--radius-panel)] border border-obs-border bg-obs-surface/80 backdrop-blur-md px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4 shadow-card"
        >
          <div className="flex items-center gap-2.5 shrink-0">
            <Globe2 className="w-4 h-4 text-obs-accent" />
            <span className="font-display text-sm font-semibold tracking-wide text-obs-text">
              CARBONOR
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 lg:gap-6 text-sm text-obs-text-muted">
            {QUICK_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="hover:text-obs-accent transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:text-obs-accent focus-visible:underline"
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => onSelectView('dashboard')}
          >
            <span>Lancer l&apos;App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </nav>

        {/* 1. Hero éditorial + chiffres clés */}
        <HeroSection
          onSelectView={onSelectView}
          onScrollToSection={scrollToSection}
        />

        {/* 2. Principe épistémologique en frise interactive */}
        <EpistemologySection onSelectView={onSelectView} />

        {/* 3. Architecture pipeline + garanties (#rigueur) + sources officielles (#sources) */}
        <PipelineAndSourcesSection onSelectView={onSelectView} />

        {/* 4. Modules & captures d'écran réelles en grille Bento */}
        <ModulesBentoSection
          onSelectView={onSelectView}
          onOpenReport={onOpenReport}
          onZoomScreenshot={setZoomedScreenshot}
        />

        {/* 5. Mécanismes scientifiques & simulateur de forçage radiatif */}
        <MechanismsAndSimulatorSection onSelectView={onSelectView} />

        {/* 6. Architecture PWA hors-ligne & publics ciblés */}
        <AudienceAndPwaSection />

        {/* 7. FAQ méthodologique & citation académique */}
        <FaqSection />

        {/* 8. Appel à l'action final & footer */}
        <FinalCtaAndFooterSection
          onSelectView={onSelectView}
          onOpenReport={onOpenReport}
        />
      </div>

      {/* Modal plein écran d'inspection des captures réelles */}
      <ScreenshotLightboxModal
        screenshot={zoomedScreenshot}
        onClose={() => setZoomedScreenshot(null)}
        onSelectView={onSelectView}
      />
    </div>
  );
};
