import React, { useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { FAQ_ITEMS, RECOMMENDED_CITATION } from './landingData';

export const FaqSection: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  const handleCopyCitation = () => {
    navigator.clipboard?.writeText(RECOMMENDED_CITATION);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  return (
    <AnimatedSection id="faq" className="scroll-mt-24">
      <div className="max-w-4xl mx-auto space-y-10">
        <SectionHeader
          eyebrow="Questions Fréquentes"
          title="Foire aux questions méthodologique"
          intro="Douze réponses précises sur les sources officielles, l'interprétation des données, le moteur spectroscopique et la citation académique."
          align="center"
        />

        <div className="space-y-2.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <Card key={item.q} elevated={isExpanded} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  aria-expanded={isExpanded}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent"
                >
                  <span className="font-display text-base sm:text-lg font-medium text-obs-text leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isExpanded
                        ? 'rotate-180 text-obs-accent'
                        : 'text-obs-text-subtle'
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-obs-border">
                    <p className="text-[15px] sm:text-base text-obs-text-muted leading-[1.65]">
                      {item.a}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Format de citation recommandé */}
        <Card className="p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-obs-text-subtle">
              Format de citation recommandé
            </span>
            <button
              type="button"
              onClick={handleCopyCitation}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted hover:border-obs-border-strong text-xs font-medium text-obs-text transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-obs-accent" />
                  <span className="text-obs-accent">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-obs-text-subtle" />
                  <span>Copier la citation</span>
                </>
              )}
            </button>
          </div>

          <p className="p-4 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted text-sm text-obs-text-muted leading-relaxed">
            « {RECOMMENDED_CITATION} »
          </p>
        </Card>
      </div>
    </AnimatedSection>
  );
};
