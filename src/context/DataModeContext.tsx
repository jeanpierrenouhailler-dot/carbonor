import React, { createContext, useContext, useState, useEffect } from 'react';

export type DataMode = 'DEMO' | 'REAL_DATA';

export interface DataModeContextValue {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  toggleDataMode: () => void;
  isRealData: boolean;
  modeLabel: string;
  modeDescription: string;
}

const DataModeContext = createContext<DataModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'carbonor_data_mode';

export const DataModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataMode, setDataModeState] = useState<DataMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'REAL_DATA' || saved === 'DEMO') {
        return saved;
      }
      // Vérifier si un paramètre d'URL impose le mode
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode') || params.get('dataMode');
      if (urlMode?.toLowerCase() === 'real') return 'REAL_DATA';
      if (urlMode?.toLowerCase() === 'demo') return 'DEMO';
    }
    // Par précaution déontologique et scientifique, le mode par défaut initial est DEMO
    // pour ne pas tromper l'utilisateur sur la provenance des fixtures embarquées.
    return 'DEMO';
  });

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
    // Informer le serveur de l'état choisi si disponible
    fetch('/api/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    }).catch(() => {
      // Tolérance hors-ligne
    });
  };

  const toggleDataMode = () => {
    setDataMode(dataMode === 'DEMO' ? 'REAL_DATA' : 'DEMO');
  };

  // Synchronisation avec l'API serveur au démarrage
  useEffect(() => {
    fetch('/api/mode')
      .then(res => res.json())
      .then(data => {
        if (data && (data.mode === 'DEMO' || data.mode === 'REAL_DATA')) {
          // Si rien n'était forcé en local, adopter le mode du serveur
          const saved = localStorage.getItem(STORAGE_KEY);
          if (!saved) {
            setDataModeState(data.mode);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isRealData = dataMode === 'REAL_DATA';
  const modeLabel = isRealData ? '🟢 MODE DONNÉES RÉELLES' : '🟡 MODE DÉMONSTRATION';
  const modeDescription = isRealData
    ? 'Données récupérées auprès de la source officielle.'
    : "Données d'exemple / fixtures scientifiques embarquées.";

  return (
    <DataModeContext.Provider
      value={{
        dataMode,
        setDataMode,
        toggleDataMode,
        isRealData,
        modeLabel,
        modeDescription
      }}
    >
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = (): DataModeContextValue => {
  const context = useContext(DataModeContext);
  if (!context) {
    // Fournir une valeur par défaut sécurisée si utilisé hors Provider
    return {
      dataMode: 'DEMO',
      setDataMode: () => {},
      toggleDataMode: () => {},
      isRealData: false,
      modeLabel: '🟡 MODE DÉMONSTRATION',
      modeDescription: "Données d'exemple / fixtures scientifiques embarquées."
    };
  }
  return context;
};
