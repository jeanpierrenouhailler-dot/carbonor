import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-950/90 border border-amber-500/50 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-2xl backdrop-blur-md animate-pulse">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex items-center gap-1.5">
        <span>Mode Hors-Ligne actif</span>
        <span className="text-amber-400/80">•</span>
        <span className="flex items-center gap-1 text-amber-300/80">
          <Database className="w-3 h-3" />
          Données du cache local PWA
        </span>
      </div>
    </div>
  );
};
