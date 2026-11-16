import React, { useState } from 'react';
import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { ViewKey } from '../../layout/Sidebar';
import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PIPELINE_STEPS, SCIENTIFIC_SOURCES } from './landingData';

interface PipelineAndSourcesSectionProps {
  onSelectView: (view: ViewKey) => void;
}

export const PipelineAndSourcesSection: React.FC<
  PipelineAndSourcesSectionProps
> = ({ onSelectView }) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    SCIENTIFIC_SOURCES[0].id
  );

  const currentStep = PIPELINE_STEPS[activeStepIdx] ?? PIPELINE_STEPS[0];
  const activeSource =
    SCIENTIFIC_SOURCES.find((s) => s.id === selectedSourceId) ??
    SCIENTIFIC_SOURCES[0];

  return (
    <AnimatedSection id="fonctionnement" className="scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Partie 1 : Chaîne de flux horizontale (Sources -> Validation -> Normalisation -> Interface) */}
        <div className="space-y-8">
          <SectionHeader
            eyebrow="Architecture Scientifique"
            title="De la donnée brute certifiée à l'analyse interactive"
            intro="Chaque observation suit un pipeline traçable en six étapes vérifiées cryptographiquement, sans approximation silencieuse en cas d'indisponibilité."
          />

          {/* Schéma de flux horizontal connecté */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-8 left-[6%] right-[6%] h-px bg-obs-border pointer-events-none"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PIPELINE_STEPS.map((step, idx) => {
                const IconComp = step.icon;
                const isActive = activeStepIdx === idx;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    aria-pressed={isActive}
                    className={`relative z-10 p-4 rounded-[var(--radius-card)] border text-left transition-all duration-200 cursor-pointer space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent ${
                      isActive
                        ? 'bg-obs-surface-elevated border-obs-border-strong shadow-card'
                        : 'bg-obs-surface border-obs-border hover:border-obs-border-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-medium tabular-nums ${
                          isActive ? 'text-obs-accent' : 'text-obs-text-subtle'
                        }`}
                      >
                        {step.num}
                      </span>
                      <IconComp
                        className={`w-4 h-4 ${
                          isActive ? 'text-obs-accent' : 'text-obs-text-subtle'
                        }`}
                      />
                    </div>
                    <div className="text-sm font-semibold text-obs-text leading-snug">
                      {step.shortTitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Détail de l'étape + garanties de rigueur (#rigueur) */}
          <Card id="rigueur" elevated className="p-6 sm:p-8 scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-obs-accent">
                    ÉTAPE {currentStep.num} / 06
                  </span>
                  <span aria-hidden="true" className="text-obs-text-subtle">
                    ·
                  </span>
                  <span className="font-mono text-xs text-obs-text-subtle">
                    {currentStep.target}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-obs-text">
                  {currentStep.title}
                </h3>
                <p className="text-[15px] sm:text-base text-obs-text-muted leading-[1.65]">
                  {currentStep.desc}
                </p>
              </div>

              <div className="lg:col-span-5 space-y-4 lg:border-l lg:border-obs-border lg:pl-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-obs-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-obs-text">
                      Traçabilité SHA-256 &amp; Double Régime
                    </h4>
                    <p className="text-sm text-obs-text-muted leading-relaxed">
                      Dans l&apos;application, basculez entre les flux officiels vérifiés et les fixtures hors-ligne embarquées. Toute source absente en mode réel renvoie explicitement <span className="font-mono text-xs text-obs-accent">SOURCE_INDISPONIBLE</span>.
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => onSelectView('pipeline-audit')}
                >
                  <span>Inspecter la provenance</span>
                  <ArrowRight className="w-4 h-4 text-obs-accent" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Partie 2 : Bandeau des sources officielles en niveaux de gris s'allumant au survol (#sources) */}
        <div id="sources" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-obs-accent">
                Sources Primaires &amp; Licences Ouvertes
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-obs-text">
                Sept institutions scientifiques internationales intégrées
              </h3>
            </div>
            <p className="text-xs text-obs-text-subtle">
              Cliquez sur une source pour consulter ses standards et son DOI.
            </p>
          </div>

          {/* Bandeau de noms sobres qui s'éclairent au survol */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {SCIENTIFIC_SOURCES.map((src) => {
              const active = src.id === activeSource.id;
              return (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setSelectedSourceId(src.id)}
                  className={`px-3 py-3.5 rounded-[var(--radius-control)] border text-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent ${
                    active
                      ? 'bg-obs-surface-elevated border-obs-border-strong text-obs-text opacity-100'
                      : 'bg-obs-surface/60 border-obs-border text-obs-text-subtle opacity-70 hover:opacity-100 hover:text-obs-text hover:border-obs-border-strong'
                  }`}
                >
                  <span className="block text-sm font-semibold tracking-tight whitespace-nowrap">
                    {src.shortName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fiche détaillée de la source sélectionnée */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-obs-border pb-4">
              <div className="space-y-1">
                <h4 className="font-display text-lg sm:text-xl font-semibold text-obs-text">
                  {activeSource.name}
                </h4>
                <p className="text-sm text-obs-text-subtle">{activeSource.org}</p>
              </div>
              <a
                href={activeSource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-obs-accent hover:underline shrink-0"
              >
                <span>Portail officiel</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Nature des données
                </span>
                <p className="text-obs-text-muted leading-relaxed">
                  {activeSource.dataType}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Couverture / stations
                </span>
                <p className="text-obs-text-muted leading-relaxed">
                  {activeSource.stations}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Standard &amp; licence
                </span>
                <p className="text-obs-text-muted leading-relaxed">
                  {activeSource.standard} · {activeSource.license}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                  Identifiant / DOI
                </span>
                <p className="font-mono text-xs sm:text-[13px] text-obs-accent break-all">
                  {activeSource.doi}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
};
