import React from 'react';

export type EpistemologicalCategory =
  | 'measured'
  | 'observed'
  | 'estimated'
  | 'modeled'
  | 'simulated';

interface CategoryBadgeProps {
  category: EpistemologicalCategory;
  label?: string;
  className?: string;
}

const categoryConfig: Record<
  EpistemologicalCategory,
  { defaultLabel: string; dotClass: string }
> = {
  measured: { defaultLabel: 'MESURÉ', dotClass: 'bg-cat-measured' },
  observed: { defaultLabel: 'OBSERVÉ', dotClass: 'bg-cat-observed' },
  estimated: { defaultLabel: 'ESTIMÉ', dotClass: 'bg-cat-estimated' },
  modeled: { defaultLabel: 'MODÉLISÉ', dotClass: 'bg-cat-modeled' },
  simulated: { defaultLabel: 'SIMULÉ', dotClass: 'bg-cat-simulated' },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  label,
  className = '',
}) => {
  const cfg = categoryConfig[category];
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-control)] border border-obs-border bg-obs-surface-muted text-xs font-mono font-medium text-obs-text tracking-wide whitespace-nowrap ${className}`}
    >
      <span
        aria-hidden="true"
        className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`}
      />
      <span>{label ?? cfg.defaultLabel}</span>
    </span>
  );
};
