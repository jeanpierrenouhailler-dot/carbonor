import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { CategoryBadge, EpistemologicalCategory } from './CategoryBadge';

interface StatTileProps {
  label: string;
  numericValue: number;
  decimals?: number;
  suffix?: string;
  unit?: string;
  source: string;
  category?: EpistemologicalCategory;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  numericValue,
  decimals = 0,
  suffix = '',
  unit,
  source,
  category,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(
    shouldReduceMotion ? numericValue : 0
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(numericValue);
      return;
    }

    const node = ref.current;
    if (!node || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setHasAnimated(true);

        const duration = 900;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(numericValue * eased);
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayValue(numericValue);
          }
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [numericValue, shouldReduceMotion, hasAnimated]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('fr-FR');

  return (
    <div
      ref={ref}
      className="flex flex-col justify-between gap-2 py-4 px-5 bg-obs-surface-muted/70"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-obs-text-subtle">{label}</span>
        {category && <CategoryBadge category={category} className="py-0.5 px-2" />}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-obs-accent tracking-tight">
          {formatted}
          {suffix}
        </span>
        {unit && (
          <span className="font-mono text-xs text-obs-text-subtle">{unit}</span>
        )}
      </div>

      <span className="text-xs text-obs-text-subtle">{source}</span>
    </div>
  );
};
