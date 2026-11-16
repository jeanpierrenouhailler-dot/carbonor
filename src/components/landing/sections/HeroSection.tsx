import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ViewKey } from '../../layout/Sidebar';
import { Button } from '../ui/Button';
import { StatTile } from '../ui/StatTile';
import { HERO_STATS } from './landingData';

interface HeroSectionProps {
  onSelectView: (view: ViewKey) => void;
  onScrollToSection: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectView,
  onScrollToSection,
}) => {
  return (
    <section id="hero" className="relative pt-4 sm:pt-8 lg:pt-12 pb-6">
      <div className="max-w-6xl mx-auto space-y-12 lg:space-y-16">
        {/* Composition asymétrique 2 colonnes (1 colonne sur mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Colonne gauche : Wordmark + titre-promesse + accroche + 2 boutons distincts */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-obs-text-subtle">
              <span className="text-obs-accent font-semibold">Carbonor</span>
              <span aria-hidden="true">·</span>
              <span>Observatoire du CO₂ &amp; Cycle du Carbone</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-semibold tracking-tight text-obs-text leading-[1.08] [text-wrap:balance]">
              Le CO₂ atmosphérique, de la molécule à la planète
            </h1>

            <p className="text-base sm:text-lg text-obs-text-muted leading-[1.65] max-w-xl">
              Explorez les mesures in situ, les observations satellitaires XCO₂, les profils verticaux et la spectroscopie infrarouge HITRAN dans un laboratoire numérique ouvert qui ne confond jamais observation, modèle et simulation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onSelectView('dashboard')}
              >
                <span>Découvrir Carbonor</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => onScrollToSection('pourquoi')}
              >
                <BookOpen className="w-4 h-4 text-obs-accent" />
                <span>Comprendre son fonctionnement</span>
              </Button>
            </div>
          </div>

          {/* Colonne droite : Terre nocturne, halo atmosphérique et molécules CO₂ */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[var(--radius-panel)] border border-obs-border bg-obs-surface/80 overflow-hidden p-6 sm:p-8 shadow-card min-h-[320px] sm:min-h-[360px] flex flex-col justify-between">
              {/* Halo atmosphérique doux */}
              <div
                aria-hidden="true"
                className="obs-animate-halo absolute -bottom-32 left-1/2 -translate-x-1/2 w-[140%] h-72 rounded-[100%] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.22),transparent_70%)] pointer-events-none"
              />

              {/* Limbe terrestre nocturne */}
              <div
                aria-hidden="true"
                className="absolute -bottom-44 left-1/2 -translate-x-1/2 w-[135%] h-72 rounded-[100%] border-t-2 border-obs-accent/70 bg-obs-bg shadow-glow pointer-events-none"
              />

              {/* Flux spectraux en SVG */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full opacity-55 pointer-events-none"
                viewBox="0 0 460 360"
                fill="none"
              >
                <path
                  d="M 20 195 Q 150 115, 245 170 T 445 140"
                  stroke="currentColor"
                  className="text-obs-accent"
                  strokeWidth="1.2"
                  strokeDasharray="5 5"
                  strokeOpacity="0.45"
                />
                <path
                  d="M 10 235 Q 140 165, 255 210 T 450 185"
                  stroke="currentColor"
                  className="text-obs-text-subtle"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                  strokeOpacity="0.35"
                />
              </svg>

              {/* Molécules de CO₂ flottant lentement */}
              <div className="relative z-10 flex flex-col gap-5">
                <div className="obs-animate-float self-start inline-flex items-center gap-2.5 px-3.5 py-2 rounded-[var(--radius-control)] border border-obs-border bg-obs-bg/85 backdrop-blur-xs">
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-obs-text">
                    <span className="w-2 h-2 rounded-full bg-cat-simulated inline-block" />
                    <span className="text-obs-text-subtle">=</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-obs-text inline-block" />
                    <span className="text-obs-text-subtle">=</span>
                    <span className="w-2 h-2 rounded-full bg-cat-simulated inline-block" />
                  </span>
                  <span className="font-mono text-xs text-obs-accent">
                    O=C=O · ν₂ 667.4 cm⁻¹
                  </span>
                </div>

                <div className="obs-animate-float-delayed self-end inline-flex items-center gap-2.5 px-3.5 py-2 rounded-[var(--radius-control)] border border-obs-border bg-obs-bg/85 backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-cat-observed inline-block" />
                  <span className="font-mono text-xs text-obs-text-muted">
                    OCO-2 · SWIR 1.61 / 2.06 µm
                  </span>
                </div>
              </div>

              {/* Légende d'altitude en bas du limbe */}
              <div className="relative z-10 pt-16 flex items-end justify-between gap-4 text-xs font-mono text-obs-text-subtle">
                <div>
                  <span className="block text-obs-text font-medium">Troposphère &amp; Stratosphère</span>
                  <span>Colonne intégrée 0 – 50 km</span>
                </div>
                <span className="text-obs-accent tabular-nums">14.98 µm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de chiffres clés sous le hero */}
        <div
          aria-label="Indicateurs scientifiques de référence"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-obs-border rounded-[var(--radius-card)] border border-obs-border overflow-hidden shadow-card"
        >
          {HERO_STATS.map((stat) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              numericValue={stat.numericValue}
              decimals={stat.decimals}
              suffix={stat.suffix}
              unit={stat.unit}
              source={stat.source}
              category={stat.category}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
