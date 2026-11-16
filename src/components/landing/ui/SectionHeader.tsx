import React from 'react';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  intro,
  align = 'left',
  className = '',
}) => {
  const alignClasses =
    align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-2xl';

  return (
    <div className={`space-y-3 ${alignClasses} ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-obs-accent">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-semibold tracking-tight text-obs-text leading-[1.18] [text-wrap:balance]">
        {title}
      </h2>
      {intro && (
        <p className="text-[15px] sm:text-base text-obs-text-muted leading-[1.65]">
          {intro}
        </p>
      )}
    </div>
  );
};
