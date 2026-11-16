import React from 'react';
import { ArrowRight, ExternalLink, FileText, Globe2 } from 'lucide-react';
import type { ViewKey } from '../../layout/Sidebar';
import { AnimatedSection } from '../ui/AnimatedSection';
import { Button } from '../ui/Button';

interface FinalCtaAndFooterSectionProps {
  onSelectView: (view: ViewKey) => void;
  onOpenReport?: () => void;
}

export const FinalCtaAndFooterSection: React.FC<
  FinalCtaAndFooterSectionProps
> = ({ onSelectView, onOpenReport }) => {
  return (
    <div className="space-y-16">
      {/* CTA Final pleine largeur avec dégradé et un seul bouton d'action principal */}
      <AnimatedSection id="cta" className="scroll-mt-24">
        <div className="obs-cta-gradient rounded-[var(--radius-panel)] border border-obs-border-strong p-8 sm:p-12 lg:p-16 text-center shadow-card">
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-obs-accent">
              Science Ouverte · Accès Libre
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold tracking-tight text-obs-text leading-[1.15] [text-wrap:balance]">
              Explorez l&apos;atmosphère dès aujourd&apos;hui
            </h2>
            <p className="text-base text-obs-text-muted leading-[1.65]">
              Manipulez les séries séculaires, comparez les observations sol et satellites OCO-2 et résolvez les 2 551 raies HITRAN sans inscription.
            </p>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onSelectView('dashboard')}
              >
                <span>Accéder à Carbonor</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer éditorial */}
      <footer className="max-w-6xl mx-auto pt-12 pb-6 border-t border-obs-border text-sm text-obs-text-subtle space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonne 1 : Identité */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-obs-text font-semibold text-base">
              <Globe2 className="w-4 h-4 text-obs-accent" />
              <span className="font-display tracking-tight">CARBONOR</span>
            </div>
            <p className="text-sm text-obs-text-muted leading-relaxed">
              Plateforme scientifique ouverte pour explorer le CO₂ atmosphérique, de la spectroscopie moléculaire HITRAN aux observations planétaires in situ et satellites.
            </p>
            <div className="font-mono text-xs text-obs-text-subtle pt-1">
              Licence Open-Source MIT · 2026
            </div>
          </div>

          {/* Colonne 2 : Modules */}
          <div className="space-y-3">
            <strong className="text-xs font-medium uppercase tracking-[0.16em] text-obs-text block">
              Modules
            </strong>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Tableau de Bord & Keeling', view: 'dashboard' as ViewKey },
                { label: 'Carte OpenStreetMap', view: 'map' as ViewKey },
                { label: 'Concentration au Sol In Situ', view: 'surface' as ViewKey },
                { label: 'Télédétection XCO₂ (OCO-2)', view: 'xco2' as ViewKey },
                { label: 'Profils Verticaux AirCore', view: 'profiles' as ViewKey },
                { label: 'Laboratoire Beer-Lambert', view: 'spectroscopy-lab' as ViewKey },
                { label: 'Raies Quantiques HITRAN', view: 'spectroscopy-lines' as ViewKey },
                { label: 'Flux CAMS & CITEPA', view: 'flux' as ViewKey },
                { label: 'Comparateur Multi-Sources', view: 'compare' as ViewKey },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => onSelectView(item.view)}
                    className="text-obs-text-muted hover:text-obs-accent transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:underline"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Données & Rigueur */}
          <div className="space-y-3">
            <strong className="text-xs font-medium uppercase tracking-[0.16em] text-obs-text block">
              Données &amp; Rigueur
            </strong>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectView('sources')}
                  className="text-obs-text-muted hover:text-obs-accent transition-colors cursor-pointer"
                >
                  Sources &amp; Licences Officielles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectView('pipeline-audit')}
                  className="text-obs-text-muted hover:text-obs-accent transition-colors cursor-pointer"
                >
                  Audit du Pipeline &amp; SHA-256
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectView('docs')}
                  className="text-obs-text-muted hover:text-obs-accent transition-colors cursor-pointer"
                >
                  Méthodes Scientifiques
                </button>
              </li>
              <li>
                <a
                  href="https://gml.noaa.gov/ccgg/trends/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-obs-text-muted hover:text-obs-accent transition-colors"
                >
                  NOAA Global Monitoring Lab ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.icos-cp.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-obs-text-muted hover:text-obs-accent transition-colors"
                >
                  ICOS Carbon Portal ↗
                </a>
              </li>
              <li>
                <a
                  href="https://oco2.jpl.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-obs-text-muted hover:text-obs-accent transition-colors"
                >
                  NASA OCO-2 Science Team ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Projet & Partage */}
          <div className="space-y-3">
            <strong className="text-xs font-medium uppercase tracking-[0.16em] text-obs-text block">
              Projet &amp; Partage
            </strong>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/jeanpierrenouhailler-dot/carbonor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-obs-accent font-medium hover:underline"
                >
                  <span>Dépôt GitHub Officiel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              {onOpenReport && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenReport}
                    className="inline-flex items-center gap-1.5 text-obs-text-muted hover:text-obs-accent transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-obs-accent" />
                    <span>Télécharger Rapport PDF</span>
                  </button>
                </li>
              )}
              <li className="pt-2 font-mono text-xs text-obs-text-subtle leading-relaxed">
                Étalons certifiés WMO-CO2-X2019. Résolution raie-par-raie HITRAN 2020.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-obs-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-obs-text-subtle text-center sm:text-left leading-relaxed">
            Données scientifiques fournies à titre de recherche et d&apos;enseignement ouvert : NOAA GML, ICOS ERIC, NASA Earthdata JPL, Copernicus ECMWF, Harvard-Smithsonian CfA et CITEPA.
          </p>
          <div className="flex items-center gap-3 font-mono text-obs-text-subtle shrink-0">
            <span>v2.4.0</span>
            <span aria-hidden="true">·</span>
            <span>PWA Ouverte</span>
            <span aria-hidden="true">·</span>
            <span className="text-obs-accent font-medium">Carbonor 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
