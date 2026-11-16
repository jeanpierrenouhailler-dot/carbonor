import React, { useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { ViewKey } from '../../layout/Sidebar';
import type { ScreenshotItem } from './landingData';
import { Button } from '../ui/Button';

interface ScreenshotLightboxModalProps {
  screenshot: ScreenshotItem | null;
  onClose: () => void;
  onSelectView: (view: ViewKey) => void;
}

export const ScreenshotLightboxModal: React.FC<
  ScreenshotLightboxModalProps
> = ({ screenshot, onClose, onSelectView }) => {
  useEffect(() => {
    if (!screenshot) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenshot, onClose]);

  if (!screenshot) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-obs-bg/90 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div
        className="relative w-full max-w-5xl rounded-[var(--radius-panel)] bg-obs-surface border border-obs-border-strong shadow-card p-5 sm:p-6 space-y-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-obs-border pb-4">
          <div className="space-y-0.5">
            <span className="font-mono text-xs text-obs-accent uppercase tracking-wider block">
              {screenshot.category} · Capture Haute Définition
            </span>
            <h3
              id="lightbox-title"
              className="font-display text-lg sm:text-xl font-semibold text-obs-text"
            >
              {screenshot.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => {
                const target = screenshot.targetView;
                onClose();
                onSelectView(target);
              }}
            >
              <span>Ouvrir dans l&apos;App</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la vue agrandie"
              className="p-2 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted text-obs-text-subtle hover:text-obs-text hover:border-obs-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto rounded-[var(--radius-card)] border border-obs-border bg-obs-bg">
          <img
            src={screenshot.image}
            alt={screenshot.title}
            className="w-full h-auto object-contain"
          />
        </div>

        <p className="text-[15px] text-obs-text-muted leading-relaxed">
          {screenshot.description}
        </p>
      </div>
    </div>
  );
};
