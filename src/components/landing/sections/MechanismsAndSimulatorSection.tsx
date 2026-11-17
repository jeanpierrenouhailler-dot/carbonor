import React, { useState } from 'react';
import { ArrowRight, Atom, ChevronDown } from 'lucide-react';
import type { ViewKey } from '../../layout/Sidebar';
import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SCIENTIFIC_MECHANISMS } from './landingData';
import { FieldTooltip } from '../../common/FieldTooltip';

interface MechanismsAndSimulatorSectionProps {
  onSelectView: (view: ViewKey) => void;
}

const PREINDUSTRIAL_CO2 = 280;

export const MechanismsAndSimulatorSection: React.FC<
  MechanismsAndSimulatorSectionProps
> = ({ onSelectView }) => {
  const [activeMechIdx, setActiveMechIdx] = useState<number>(0);
  const [co2Slider, setCo2Slider] = useState<number>(426);

  const radiativeForcing = Number(
    (5.35 * Math.log(co2Slider / PREINDUSTRIAL_CO2)).toFixed(2)
  );
  const deltaTempEquilibrium = Number((radiativeForcing * 0.8).toFixed(2));

  const presets = [
    { label: '280 ppm · Préindustriel', value: 280 },
    { label: '426 ppm · Actuel 2026', value: 426 },
    { label: '560 ppm · Doublement 2×', value: 560 },
  ];

  return (
    <AnimatedSection id="mecanismes" className="scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-10">
        <SectionHeader
          eyebrow="Physique & Pédagogie"
          title="Comprendre les mécanismes du carbone et du transfert radiatif"
          intro="Explorez cinq questions fondamentales sur le fonctionnement physico-chimique de l'atmosphère et testez directement la loi logarithmique de forçage radiatif du GIEC."
        />

        {/* Composition asymétrique 7 / 5 en zigzag */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Colonne gauche : Accordéon pédagogique des 5 mécanismes */}
          <div className="lg:col-span-7 space-y-3">
            {SCIENTIFIC_MECHANISMS.map((mech, idx) => {
              const isOpen = activeMechIdx === idx;
              return (
                <Card
                  key={mech.id}
                  elevated={isOpen}
                  className="overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveMechIdx(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent"
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-xs text-obs-accent block">
                        0{idx + 1} · {mech.shortTitle}
                      </span>
                      <span className="font-display text-lg font-semibold text-obs-text leading-snug block">
                        {mech.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 text-obs-accent'
                          : 'text-obs-text-subtle'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-2 border-t border-obs-border space-y-4">
                      <div className="px-3.5 py-2.5 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted font-mono text-xs sm:text-[13px] text-obs-accent overflow-x-auto">
                        {mech.formula}
                      </div>

                      <p className="text-[15px] sm:text-base text-obs-text-muted leading-[1.65]">
                        {mech.explanation}
                      </p>

                      <div className="pl-4 border-l-2 border-obs-accent/60 space-y-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-obs-text-subtle block">
                          À retenir
                        </span>
                        <p className="text-sm text-obs-text leading-relaxed">
                          {mech.keyTakeaway}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Colonne droite : Mini-simulateur interactif de forçage radiatif */}
          <Card elevated className="lg:col-span-5 p-6 sm:p-7 space-y-6">
            <div className="space-y-2 border-b border-obs-border pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-obs-accent">
                <Atom className="w-4 h-4" />
                <span>Simulateur Interactif · GIEC AR6</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-obs-text">
                Forçage radiatif instantané
              </h3>
              <p className="text-sm text-obs-text-muted leading-relaxed">
                Modifiez la fraction molaire atmosphérique de CO₂ pour observer le caractère logarithmique de l&apos;absorption infrarouge.
              </p>
            </div>

            {/* Curseur de concentration */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="landing-co2-slider"
                  className="text-sm font-medium text-obs-text inline-flex items-center gap-1.5"
                >
                  <span>Concentration atmosphérique</span>
                  <FieldTooltip
                    label="Curseur CO₂ (ppm)"
                    description="Déplacez ce curseur pour tester le forçage radiatif (chaleur piégée en W/m²) par rapport à 1750 (280 ppm)."
                    example="426 ppm = niveau mondial actuel"
                  />
                </label>
                <span className="font-mono text-2xl font-semibold text-obs-accent tabular-nums">
                  {co2Slider}{' '}
                  <span className="text-xs text-obs-text-subtle">ppm</span>
                </span>
              </div>

              <input
                id="landing-co2-slider"
                type="range"
                min={200}
                max={900}
                step={2}
                value={co2Slider}
                onChange={(e) => setCo2Slider(Number(e.target.value))}
                className="w-full accent-obs-accent cursor-pointer h-2 rounded-lg bg-obs-surface-muted"
              />

              <div className="flex items-center justify-between font-mono text-xs text-obs-text-subtle">
                <span>200 ppm</span>
                <span>550 ppm</span>
                <span>900 ppm</span>
              </div>

              {/* Boutons de scénarios rapides */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map((preset) => {
                  const isActive = co2Slider === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setCo2Slider(preset.value)}
                      className={`px-3 py-1.5 rounded-[var(--radius-control)] border font-mono text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent ${
                        isActive
                          ? 'bg-obs-accent-soft border-obs-border-strong text-obs-accent'
                          : 'bg-obs-surface-muted border-obs-border text-obs-text-subtle hover:text-obs-text hover:border-obs-border-strong'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Résultats calculés en temps réel */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted space-y-1">
                <span className="text-xs text-obs-text-subtle block">
                  Forçage ΔF
                </span>
                <span className="font-mono text-xl font-semibold text-obs-text tabular-nums block">
                  {radiativeForcing >= 0 ? `+${radiativeForcing}` : radiativeForcing}{' '}
                  <span className="text-xs text-obs-accent">W/m²</span>
                </span>
              </div>

              <div className="p-4 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted space-y-1">
                <span className="text-xs text-obs-text-subtle block">
                  Réponse d&apos;équilibre ΔT
                </span>
                <span className="font-mono text-xl font-semibold text-obs-text tabular-nums block">
                  {deltaTempEquilibrium >= 0
                    ? `+${deltaTempEquilibrium}`
                    : deltaTempEquilibrium}{' '}
                  <span className="text-xs text-obs-accent">°C</span>
                </span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-[var(--radius-control)] border border-obs-border bg-obs-bg/70 font-mono text-xs text-obs-text-subtle leading-relaxed">
              ΔF = 5.35 · ln(C / 280) W/m² · Sensibilité climatique médiane 0.8 °C/(W·m⁻²)
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => onSelectView('spectroscopy-lab')}
            >
              <span>Ouvrir le laboratoire complet (2 551 raies)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
};
