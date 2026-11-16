import React from 'react';
import { ArrowRight, Maximize2 } from 'lucide-react';
import type { ViewKey } from '../../layout/Sidebar';
import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { CategoryBadge } from '../ui/CategoryBadge';
import { BENTO_MODULES, type ScreenshotItem } from './landingData';

interface ModulesBentoSectionProps {
  onSelectView: (view: ViewKey) => void;
  onOpenReport?: () => void;
  onZoomScreenshot: (screenshot: ScreenshotItem) => void;
}

export const ModulesBentoSection: React.FC<ModulesBentoSectionProps> = ({
  onSelectView,
  onOpenReport,
  onZoomScreenshot,
}) => {
  const featuredModules = BENTO_MODULES.filter((m) => m.featured && m.screenshot);
  const compactModules = BENTO_MODULES.filter((m) => !m.featured);

  return (
    <AnimatedSection id="fonctionnalites" className="scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-10">
        <SectionHeader
          eyebrow="Explorateurs & Modules"
          title="Dix instruments d'observation, de l'orbite à la raie quantique"
          intro="Chaque module correspond à une vue opérationnelle de Carbonor. Inspectez les captures réelles ci-dessous ou ouvrez directement l'instrument souhaité."
        />

        {/* Grille Bento asymétrique pour les 4 modules phares avec captures réelles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {featuredModules.map((mod, idx) => {
            const IconComp = mod.icon;
            const screenshot = mod.screenshot!;
            // Alternance asymétrique 7 / 5 puis 5 / 7 pour briser la monotonie
            const spanClass =
              idx === 0 || idx === 3 ? 'lg:col-span-7' : 'lg:col-span-5';

            const handleOpenModule = () => {
              if (mod.targetView) {
                onSelectView(mod.targetView);
              }
            };

            return (
              <Card
                key={mod.code}
                interactive
                role="button"
                tabIndex={0}
                onClick={handleOpenModule}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenModule();
                  }
                }}
                aria-label={`Ouvrir ${mod.title}`}
                className={`${spanClass} overflow-hidden flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent`}
              >
                {/* Capture d'écran encadrée */}
                <div className="relative border-b border-obs-border bg-obs-surface-muted overflow-hidden aspect-[16/9]">
                  <img
                    src={screenshot.image}
                    alt={`${screenshot.title} — ${screenshot.subtitle}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-obs-bg/70 via-transparent to-transparent pointer-events-none"
                  />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <CategoryBadge category={mod.category} />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onZoomScreenshot(screenshot);
                      }}
                      aria-label={`Agrandir la capture : ${screenshot.title}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-control)] border border-obs-border bg-obs-bg/85 backdrop-blur-xs text-xs font-medium text-obs-text hover:border-obs-border-strong hover:text-obs-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Agrandir</span>
                    </button>
                  </div>
                </div>

                {/* Corps éditorial */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-mono text-xs text-obs-accent">
                        <IconComp className="w-4 h-4" />
                        <span>MODULE {mod.code}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-obs-text-subtle group-hover:text-obs-accent transition-colors">
                        <span>Ouvrir</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold text-obs-text leading-snug">
                      {mod.title}
                    </h3>

                    <p className="text-[15px] text-obs-text-muted leading-[1.6]">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-obs-border font-mono text-xs text-obs-text-subtle">
                    {mod.metricOrRule}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Grille compacte pour les 6 modules complémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compactModules.map((mod) => {
            const IconComp = mod.icon;
            const handleAction = () => {
              if (mod.actionType === 'report' && onOpenReport) {
                onOpenReport();
              } else if (mod.targetView) {
                onSelectView(mod.targetView);
              }
            };

            return (
              <Card
                key={mod.code}
                interactive
                role="button"
                tabIndex={0}
                onClick={handleAction}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAction();
                  }
                }}
                aria-label={`Ouvrir ${mod.title}`}
                className="p-5 flex flex-col justify-between gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-obs-accent shrink-0" />
                      <span className="font-mono text-xs text-obs-text-subtle">
                        {mod.code}
                      </span>
                    </div>
                    <CategoryBadge category={mod.category} />
                  </div>

                  <h3 className="font-display text-lg font-semibold text-obs-text leading-snug group-hover:text-obs-accent transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-[15px] text-obs-text-muted leading-[1.6]">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-obs-border flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-obs-text-subtle truncate">
                    {mod.metricOrRule}
                  </span>
                  <ArrowRight className="w-4 h-4 text-obs-text-subtle group-hover:text-obs-accent shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
};
