import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { TARGET_AUDIENCES } from './landingData';
import { PWAInstallButton } from '../../pwa/PWAInstallButton';

export const AudienceAndPwaSection: React.FC = () => {
  return (
    <AnimatedSection id="public" className="scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Bandeau PWA & Accessibilité (#pwa) */}
        <Card id="pwa" elevated className="p-6 sm:p-8 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-obs-accent">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Progressive Web App &amp; Hors-Ligne</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-obs-text">
                Une application pensée pour le terrain, les amphis et les laboratoires
              </h3>
              <p className="text-[15px] sm:text-base text-obs-text-muted leading-[1.65]">
                Carbonor s&apos;installe en un clic sur ordinateur (macOS, Windows, Linux) et mobile (iOS, Android). Grâce à son Service Worker et à ses fixtures embarquées, elle reste exploitable en mode Démonstration même sans connexion Internet.
              </p>
              <div className="pt-1">
                <PWAInstallButton variant="button" />
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              {[
                {
                  title: 'Installation instantanée W3C',
                  desc: 'Aucun magasin d’applications requis : installez directement depuis le navigateur.',
                },
                {
                  title: 'Persistance locale sécurisée',
                  desc: 'Préférences, stations sélectionnées et paramètres de simulation conservés sur votre appareil.',
                },
                {
                  title: 'Accessibilité clavier & ARIA',
                  desc: 'Balisage sémantique complet, contrastes vérifiés et navigation au clavier sans souris.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-3.5 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted"
                >
                  <Check className="w-4 h-4 text-obs-accent shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-semibold text-obs-text block">
                      {item.title}
                    </strong>
                    <p className="text-xs text-obs-text-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Publics & Usages Ciblés */}
        <div className="space-y-8">
          <SectionHeader
            eyebrow="Publics & Usages"
            title="À qui s'adresse Carbonor ?"
            intro="De la recherche académique à l'enseignement des sciences physiques et de la vie, chaque communauté dispose d'outils transparents et citables."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARGET_AUDIENCES.map((aud) => {
              const IconComp = aud.icon;
              return (
                <Card
                  key={aud.role}
                  className="p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-obs-accent" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-obs-text leading-snug">
                      {aud.role}
                    </h3>
                    <p className="text-[15px] text-obs-text-muted leading-[1.6]">
                      {aud.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-obs-border font-mono text-xs text-obs-text-subtle">
                    {aud.tag}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};
