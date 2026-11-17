import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface FieldTooltipProps {
  label: string;
  description: string;
  example?: string;
  demoId?: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({
  label,
  description,
  example,
  demoId,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        data-demo-id={demoId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={`Aide sur le champ : ${label}`}
        aria-expanded={open}
        title={`${label} — ${description}`}
        className="inline-flex items-center justify-center p-0.5 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-left text-xs text-slate-200 space-y-1.5 pointer-events-auto"
        >
          <span className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
            <strong className="text-white font-semibold">{label}</strong>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer l'infobulle"
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="block text-slate-300 leading-relaxed font-sans">
            {description}
          </span>
          {example && (
            <span className="block text-[11px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              Exemple : {example}
            </span>
          )}
        </span>
      )}
    </span>
  );
};
