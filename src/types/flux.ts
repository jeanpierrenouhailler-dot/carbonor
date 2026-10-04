import { DataProvenance, ScientificDataCategory } from './observation';

export interface FluxRecord {
  id: string;
  region: string;              // 'France' | 'Europe' | 'Global' | 'Land Biosphere' | 'Oceans'
  timestamp: string;
  category: ScientificDataCategory;
  netFlux: number;             // Flux net atmosphère -> surface ou inverse (convention: positif vers atmosphère)
  naturalFluxNEE: number;      // Net Ecosystem Exchange (respiration - photosynthèse)
  anthropogenicFossil: number; // Combustibles fossiles + cimenterie
  oceanUptake: number;         // Puits océanique de CO2 (souvent négatif = absorption)
  landSink: number;            // Puits biosphère terrestre
  inversionPosterior: number;  // Flux déduit par assimilation inverse CAMS
  unit: 'µmol/(m²·s)' | 'gC/(m²·d)' | 'MtCO₂/an' | 'GtC/an';
  uncertaintyPercentage: number;
  provenance: DataProvenance;
}

export interface EmissionInventoryItem {
  id: string;
  sector: string;              // 'Énergie & Électricité' | 'Transports' | 'Industrie & Matériaux' | 'Bâtiments' | 'Agriculture' | 'Déchets'
  country: string;
  year: number;
  valueMtCO2: number;          // Mt CO₂ / an
  sharePercent: number;        // % du total national
  category: ScientificDataCategory; // ESTIMATED
  isDirectMeasurement: false;  // Ne jamais présenter une émission estimée comme une mesure directe !
  inventoryAgency: string;     // 'CITEPA (France)' | 'EEA (Europe)' | 'EDGAR / Global Carbon Project'
  provenance: DataProvenance;
}
