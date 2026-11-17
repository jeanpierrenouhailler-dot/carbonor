import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'sm', className = '' }) => {
  return (
    <img
      src="/logo.svg"
      alt="Logo Carbonor — Observatoire CO₂"
      className={`${sizeMap[size]} shrink-0 select-none ${className}`}
    />
  );
};
