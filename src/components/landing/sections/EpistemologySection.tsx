import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewKey } from '../../layout/Sidebar';
import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { CategoryBadge } from '../ui/CategoryBadge';
import { Button } from '../ui/Button';
import { EPISTEMOLOGY_PILLARS } from './landingData';

interface EpistemologySectionProps {
  onSelectView: (view: ViewKey) => void;
}

export const EpistemologySection: React.FC<EpistemologySectionProps> = ({
  onSelectView,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('measured');
  const activePillar =
    EPISTEMOLOGY_PILLARS.find((p) => p.key === selectedKey) ??
    EPISTEMOLOGY_PILLARS[0];

  return (
    <AnimatedSection id="pourquoi" className="scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Principe Épistémologique"
            title="Mesuré ≠ Observé ≠ Estimé ≠ Modélisé ≠ Simulé"
            intro="Le CO₂ atmosphérique ne se résume jamais à une valeur unique. Carbonor sépare rigoureusement cinq régimes de connaissance qui ne sont pas interchangeables."
          />
          <p className="text-xs text-obs-text-subtle shrink-0">
            Sélectionnez une étape de la frise pour afficher sa méthodologie.
          </p>
        </div>

        {/* Frise horizontale de 5 étapes reliées par une ligne lumineuse */}
        <div className="relative">
          {/* Ligne de liaison lumineuse horizontale (desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-11 left-[8%] right-[8%] h-px bg-gradient-to-r from-obs-border via-obs-border-strong to-obs-border pointer-events-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {EPISTEMOLOGY_PILLARS.map((pillar) => {
              const IconComp = pillar.icon;
              const isSelected = pillar.key === activePillar.key;
              return (
                <button
                  key={pillar.key}
                  type="button"
                  onClick={() => setSelectedKey(pillar.key)}
                  aria-expanded={isSelected}
                  className={`relative z-10 text-left rounded-[var(--radius-card)] border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent ${
                    isSelected
                      ? 'bg-obs-surface-elevated border-obs-border-strong shadow-card -translate-y-0.5'
                      : 'bg-obs-surface border-obs-border hover:border-obs-border-strong hover:bg-obs-surface-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-[var(--radius-control)] border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-obs-accent-soft border-obs-border-strong text-obs-accent'
                          : 'bg-obs-surface-muted border-obs-border text-obs-text-subtle'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs text-obs-text-subtle tabular-nums">
                      {pillar.stepNumber}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <CategoryBadge category={pillar.key} label={pillar.category} />
                    <p className="text-[14px] text-obs-text-muted leading-[1.55]">
                      {pillar.shortLine}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panneau de détail ouvert au clic */}
        <Card elevated className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <CategoryBadge
                  category={activePillar.key}
                  label={`${activePillar.stepNumber} · ${activePillar.category}`}
                />
                <span className="text-xs text-obs-text-subtle">
                  {activePillar.sources}
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-semibold text-obs-text">
                {activePillar.subtitle}
              </h3>

              <p className="text-[15px] sm:text-base text-obs-text-muted leading-[1.65]">
                {activePillar.summary}
              </p>
            </div>

            <div className="lg:col-span-5 space-y-4 lg:border-l lg:border-obs-border lg:pl-8">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Instruments &amp; méthode
                </span>
                <p className="text-sm text-obs-text">{activePillar.instruments}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Invariant métrologique
                </span>
                <p className="font-mono text-xs sm:text-[13px] text-obs-accent leading-relaxed">
                  {activePillar.invariants}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Exemples dans Carbonor
                </span>
                <p className="text-sm text-obs-text-muted">{activePillar.examples}</p>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={() => onSelectView(activePillar.targetView)}
                >
                  <span>Explorer ce régime dans l&apos;app</span>
                  <ArrowRight className="w-4 h-4 text-obs-accent" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AnimatedSection>
  );
};
