import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-obs-accent hover:bg-obs-accent-strong text-obs-accent-ink font-semibold shadow-glow',
  secondary:
    'bg-obs-surface-elevated hover:bg-obs-surface text-obs-text border border-obs-border hover:border-obs-border-strong font-medium',
  ghost:
    'bg-transparent hover:bg-obs-surface text-obs-text-muted hover:text-obs-text font-medium',
};

const sizeClasses: Record<'md' | 'lg', string> = {
  md: 'px-4 py-2 text-sm rounded-[var(--radius-control)]',
  lg: 'px-6 py-3.5 text-[15px] rounded-[var(--radius-control)]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obs-accent focus-visible:ring-offset-2 focus-visible:ring-offset-obs-bg ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
