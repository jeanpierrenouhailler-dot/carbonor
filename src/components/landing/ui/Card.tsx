import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevated?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  elevated = false,
  className = '',
  children,
  ...props
}) => {
  const surfaceClass = elevated ? 'bg-obs-surface-elevated' : 'bg-obs-surface';
  const interactiveClass = interactive
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-obs-border-strong hover:bg-obs-surface-elevated cursor-pointer'
    : 'transition-colors duration-200';

  return (
    <div
      className={`rounded-[var(--radius-card)] border border-obs-border shadow-card obs-grain-surface ${surfaceClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
