import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Station, XCO2Observation, DataProvenance, ScientificDataCategory } from '../../types/observation';
import { NoaaErddapProvider } from '../../providers/noaaProvider';
import { IcosProvider } from '../../providers/icosProvider';
import { OcoProvider } from '../../providers/ocoProvider';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { DataProvenanceModal } from '../common/DataProvenanceModal';
import { ExportButton } from '../common/ExportButton';
import { ScienceTooltip } from '../common/ScienceTooltip';
import { useDataMode } from '../../context/DataModeContext';
import { 
  MapPin, 
  Satellite, 
  Layers, 
  Filter, 
  ShieldCheck, 
  Compass, 
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Eye,
  Globe2
} from 'lucide-react';

// Fix Leaflet standard icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type TileLayerKey = 'osm-standard' | 'osm-dark' | 'osm-topo' | 'satellite';

export const InteractiveMapView: React.FC = () => {
  const { dataMode, isRealData, modeLabel } = useDataMode();
  const [stations, setStations] = useState<Station[]>([]);
  const [ocoSoundings, setOcoSoundings] = useState<XCO2Observation[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedSounding, setSelectedSounding] = useState<XCO2Observation | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<DataProvenance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScientificDataCategory>('MEASURED');

  // Layer toggles
  const [showStations, setShowStations] = useState(true);
  const [showOco, setShowOco] = useState(true);
  const [showCamsGrid, setShowCamsGrid] = useState(false);
  const [filterQualityOnly, setFilterQualityOnly] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<'ALL' | 'NOAA' | 'ICOS'>('ALL');

  // Tile background style: default is real OpenStreetMap standard as requested by user
  const [tileStyle, setTileStyle] = useState<TileLayerKey>('osm-standard');

  // Map DOM and instance references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);
  const ocoLayerRef = useRef<L.LayerGroup | null>(null);
  const camsLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialisation des données
  useEffect(() => {
    async function load() {
      try {
        const noaa = await NoaaErddapProvider.getStations();
        const icos = await IcosProvider.getStations();
        const combined = [...noaa, ...icos];
        setStations(combined);

        const oco = await OcoProvider.getXCO2('Europe-France');
        setOcoSoundings(oco);

        // Sélection par défaut : Puy de Dôme
        const puy = icos.find(s => s.code === 'PUY') || combined[0];
        if (puy) setSelectedStation(puy);
      } catch (e) {
        console.error('Erreur chargement données carte:', e);
      }
    }
    load();
  }, []);

  // 2. Initialisation de la carte Leaflet avec fond OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centrage initial sur l'Europe occidentale (France/Europe)
    const map = L.map(mapContainerRef.current, {
      center: [46.8, 2.8],
      zoom: 5,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false // Contrôle de zoom personnalisé en haut à droite
    });

    // Contrôles Leaflet
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Initialisation des couches de données
    const stationsLayer = L.layerGroup().addTo(map);
    const ocoLayer = L.layerGroup().addTo(map);
    const camsLayer = L.layerGroup().addTo(map);

    stationsLayerRef.current = stationsLayer;
    ocoLayerRef.current = ocoLayer;
    camsLayerRef.current = camsLayer;
    mapInstanceRef.current = map;

    // Force le recalcul de géométrie pour afficher immédiatement toutes les tuiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Gestion du fond de carte OpenStreetMap (Standard vs Sombre vs Topo vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributeurs';
    let maxZoom = 19;

    if (tileStyle === 'osm-dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributeurs &copy; CARTO';
      maxZoom = 19;
    } else if (tileStyle === 'osm-topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributeurs, SRTM';
      maxZoom = 17;
    } else if (tileStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Maxar, Earthstar Geographics &copy; OpenStreetMap';
      maxZoom = 19;
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom,
      subdomains: 'abc'
    }).addTo(map);

    // Mettre la couche de tuiles en arrière-plan
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [tileStyle]);

  // Filtrage des données
  const filteredStations = stations.filter(s => {
    if (networkFilter === 'NOAA') return s.network === 'NOAA';
    if (networkFilter === 'ICOS') return s.network === 'ICOS';
    return true;
  });

  const filteredSoundings = ocoSoundings.filter(s => {
    if (filterQualityOnly) return s.qualityFlag === '0';
    return true;
  });

  // 4. Rendu dynamique des marqueurs de stations au sol
  useEffect(() => {
    const layer = stationsLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showStations) return;

    filteredStations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      const isNoaa = station.network === 'NOAA';
      const markerColor = isNoaa ? '#10b981' : '#06b6d4';

      // Marqueur circulaire principal
      const circle = L.circleMarker([station.latitude, station.longitude], {
        radius: isSelected ? 10 : 7,
        fillColor: markerColor,
        color: '#ffffff',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.95
      });

      // Infobulle permanente ou au survol
      circle.bindTooltip(`
        <div style="font-family: monospace; font-size: 11px; line-height: 1.4;">
          <strong style="color: ${markerColor};">${station.code}</strong> — ${station.name}<br/>
          <strong>CO₂ :</strong> <span style="color: #ffffff; font-weight: bold;">${station.currentCO2.toFixed(2)} ppm</span><br/>
          <strong>Réseau :</strong> ${station.network} · Alt. ${station.altitude} m
        </div>
      `, {
        direction: 'top',
        offset: [0, -8],
        opacity: 0.95
      });

      // Événement clic : sélection
      circle.on('click', () => {
        setSelectedStation(station);
        setSelectedSounding(null);
      });

      circle.addTo(layer);

      // Si sélectionné, ajouter une bague d'animation pulsante via DivIcon
      if (isSelected) {
        const pulseIcon = L.divIcon({
          className: 'station-pulse-marker',
          html: `
            <div style="
              width: 28px;
              height: 28px;
              margin-left: -14px;
              margin-top: -14px;
              border-radius: 50%;
              border: 2px solid ${markerColor};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              pointer-events: none;
            "></div>
          `,
          iconSize: [0, 0]
        });
        L.marker([station.latitude, station.longitude], { icon: pulseIcon, interactive: false }).addTo(layer);
      }
    });
  }, [filteredStations, showStations, selectedStation]);

  // 5. Rendu dynamique des sondages et trace orbitale OCO-2
  useEffect(() => {
    const layer = ocoLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showOco || filteredSoundings.length === 0) return;

    // 5.1 Trace orbitale (Polyline)
    const latLngs: L.LatLngExpression[] = filteredSoundings.map(s => [s.latitude, s.longitude]);
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.8
      }).addTo(layer);
    }

    // 5.2 Points de sondages individuels
    filteredSoundings.forEach(sounding => {
      const isSelected = selectedSounding?.observationId === sounding.observationId;
      const isGood = sounding.qualityFlag === '0';
      const color = isGood ? '#38bdf8' : '#f59e0b';

      const circle = L.circleMarker([sounding.latitude, sounding.longitude], {
        radius: isSelected ? 8 : 4.5,
        fillColor: color,
        color: '#0f172a',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.95
      });

      circle.bindTooltip(`
        <div style="font-family: monospace; font-size: 11px; line-height: 1.4;">
          <strong style="color: #38bdf8;">${sounding.satellite} Sondage</strong><br/>
          <strong>XCO₂ :</strong> <span style="color: #ffffff; font-weight: bold;">${sounding.xco2.toFixed(2)} ppm</span><br/>
          <strong>Qualité :</strong> Flag ${isGood ? '0 (Good - Assimilation)' : '1 (Caution)'}<br/>
          <strong>Incertitude :</strong> ±${sounding.xco2Uncertainty.toFixed(2)} ppm
        </div>
      `, {
        direction: 'top',
        offset: [0, -6],
        opacity: 0.95
      });

      circle.on('click', () => {
        setSelectedSounding(sounding);
        setSelectedStation(null);
      });

      circle.addTo(layer);

      if (isSelected) {
        const pulseIcon = L.divIcon({
          className: 'sounding-pulse-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              margin-left: -12px;
              margin-top: -12px;
              border-radius: 50%;
              border: 2px solid ${color};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              pointer-events: none;
            "></div>
          `,
          iconSize: [0, 0]
        });
        L.marker([sounding.latitude, sounding.longitude], { icon: pulseIcon, interactive: false }).addTo(layer);
      }
    });
  }, [filteredSoundings, showOco, selectedSounding]);

  // 6. Rendu de la grille CAMS Modèle
  useEffect(() => {
    const layer = camsLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showCamsGrid) return;

    // Empreinte d'assimilation CAMS Europe occidentale
    L.circle([48.0, 4.0], {
      radius: 450000,
      color: '#a855f7',
      fillColor: '#a855f7',
      fillOpacity: 0.18,
      weight: 1.5,
      dashArray: '4, 4'
    }).bindTooltip(`
      <div style="font-family: monospace; font-size: 11px;">
        <strong style="color: #c084fc;">Grille CAMS ECMWF IFS</strong><br/>
        Champ de CO₂ réanalysé par assimilation 4D-Var
      </div>
    `).addTo(layer);
  }, [showCamsGrid]);

  // Vues prédéfinies
  const setPresetView = (preset: 'europe' | 'france' | 'world' | 'mlo') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    switch (preset) {
      case 'france':
        map.flyTo([46.6, 2.5], 6, { duration: 1 });
        break;
      case 'mlo':
        map.flyTo([19.5362, -155.5763], 7, { duration: 1.2 });
        break;
      case 'world':
        map.flyTo([25.0, 0.0], 2, { duration: 1.2 });
        break;
      case 'europe':
      default:
        map.flyTo([48.0, 5.0], 5, { duration: 1 });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec titre, tooltip et bouton d'exportation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Carte Interactive Multi-Réseaux</span>
              <ScienceTooltip
                title="Superposition Géospatiale In-Situ &amp; Satellitaire"
                summary="Visualisation en arrière-plan d'une vraie carte OpenStreetMap avec les stations in-situ terrestres (NOAA, ICOS) et les traces d'orbite héliosynchrone NASA OCO-2 / OCO-3."
                details={[
                  "Fond de carte : Tuiles cartographiques officielles OpenStreetMap (OSM) avec projection Web Mercator EPSG:3857.",
                  "Stations au sol : Échantillonnage continu haute fréquence de la couche limite ou de l'air libre (inlet 10 à 180 mètres de hauteur).",
                  "Sondages OCO-2 : Orbite polaire à 705 km d'altitude, heure de passage à l'équateur ~13h30 locale (A-Train). Empreinte au sol de 1.29 × 2.25 km.",
                  "Les cercles de couleur des stations représentent la concentration mesurée en ppm ; les pastilles le long des traces représentent le XCO₂ intégré de la colonne d'air sec."
                ]}
                badge="OPENSTREETMAP"
                variant="cyan"
              />
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="OBSERVED" />
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-cyan-400" />
              FOND OPENSTREETMAP RÉEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cartographie géographique OpenStreetMap avec stations de surface NOAA / ICOS et traces orbitales de sondages XCO₂ NASA OCO-2 / OCO-3
          </p>
        </div>

        {/* Bouton d'exportation certifié */}
        <div className="flex items-center gap-3">
          <ExportButton
            data={[...filteredStations, ...filteredSoundings]}
            datasetName="co2_geospatial_observations"
            title="Observations géospatiales de surface et satellitaires"
          />
        </div>
      </div>

      {/* Barre de contrôle des couches et du fond de carte */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-md">
        {/* Filtres de couches */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Couches :
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={showStations}
              onChange={e => setShowStations(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Stations au sol ({filteredStations.length})
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={showOco}
              onChange={e => setShowOco(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Trace Satellitaire OCO-2 ({filteredSoundings.length})
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={showCamsGrid}
              onChange={e => setShowCamsGrid(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              Grille CAMS Modèle
            </span>
          </label>
        </div>

        {/* Sélecteur de style OpenStreetMap */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] border-l border-slate-800 pl-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-cyan-400" />
              Fond OSM :
            </span>
            <button
              onClick={() => setTileStyle('osm-standard')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                tileStyle === 'osm-standard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Tuiles officielles OpenStreetMap standard"
            >
              🗺️ Standard
            </button>
            <button
              onClick={() => setTileStyle('osm-dark')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                tileStyle === 'osm-dark'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Données OpenStreetMap avec rendu sombre Carto"
            >
              🌙 Sombre
            </button>
            <button
              onClick={() => setTileStyle('osm-topo')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                tileStyle === 'osm-topo'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Données OpenStreetMap avec relief OpenTopoMap"
            >
              ⛰️ Topo
            </button>
            <button
              onClick={() => setTileStyle('satellite')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                tileStyle === 'satellite'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Imagerie satellite haute résolution avec tracé OSM"
            >
              🛰️ Satellite
            </button>
          </div>

          {/* Réseau filtré */}
          <div className="flex items-center gap-1 font-mono border-l border-slate-800 pl-3">
            <span className="text-slate-500">Réseau :</span>
            {(['ALL', 'NOAA', 'ICOS'] as const).map(n => (
              <button
                key={n}
                onClick={() => setNetworkFilter(n)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  networkFilter === n
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-mono text-[11px] border-l border-slate-800 pl-3">
            <input
              type="checkbox"
              checked={filterQualityOnly}
              onChange={e => setFilterQualityOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span>Flag '0' (Bon)</span>
          </label>
        </div>
      </div>

      {/* Vue Principale : Carte Leaflet OpenStreetMap + Panneau d'inspection latéral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteneur Carte Leaflet (2 colonnes) */}
        <div className="lg:col-span-2 relative rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl overflow-hidden flex flex-col justify-between">
          {/* Barre supérieure de la carte avec cadrages rapides */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono pb-2.5 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Projection OpenStreetMap (Web Mercator EPSG:3857)
              </span>
            </div>

            {/* Boutons de cadrages rapides */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[10px]">Cadrage :</span>
              <button
                onClick={() => setPresetView('france')}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                🇫🇷 France
              </button>
              <button
                onClick={() => setPresetView('europe')}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                🇪🇺 Europe
              </button>
              <button
                onClick={() => setPresetView('mlo')}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                🌺 Mauna Loa
              </button>
              <button
                onClick={() => setPresetView('world')}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                🌍 Monde
              </button>
            </div>
          </div>

          {/* Canvas Leaflet interactif avec OpenStreetMap en arrière-plan */}
          <div className="relative w-full h-[500px] md:h-[560px] rounded-xl overflow-hidden border border-slate-800/80 shadow-inner z-0 isolation-isolate">
            <div 
              ref={mapContainerRef} 
              className="w-full h-full select-none"
              style={{ background: '#020617' }}
            />

            {/* Badge flottant d'attribution OpenStreetMap & Mode */}
            <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1 pointer-events-none">
              <span className="px-2 py-1 rounded bg-slate-950/85 backdrop-blur-xs text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/40 shadow-md">
                Fond : OpenStreetMap · {tileStyle === 'osm-standard' ? 'Standard OSM' : tileStyle === 'osm-dark' ? 'OSM Sombre' : tileStyle === 'osm-topo' ? 'OSM Topo' : 'Imagerie Satellite'}
              </span>
              <span className={`px-2 py-0.5 rounded backdrop-blur-xs text-[10px] font-mono font-bold border shadow-md ${
                isRealData
                  ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/85 text-amber-300 border-amber-500/40'
              }`}>
                {modeLabel}
              </span>
            </div>
          </div>

          {/* Légende de la carte */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-900 mt-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
                <span>Station sol NOAA</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-500 border border-white"></span>
                <span>Station sol ICOS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>OCO-2 (Flag 0 - Valide)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>OCO-2 (Flag 1 - Alerte)</span>
              </span>
            </div>
            <span className="text-slate-500">Cliquez sur un marqueur pour inspecter les métadonnées</span>
          </div>
        </div>

        {/* Panneau d'inspection des détails (1 colonne) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          {selectedStation && (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedStation.network === 'NOAA' 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' 
                        : 'bg-cyan-950 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {selectedStation.network}
                    </span>
                    <ProvenanceBadge
                      category="MEASURED"
                      onClick={() => {
                        setSelectedProvenance(selectedStation.provenance);
                        setSelectedCategory('MEASURED');
                      }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedStation.name}</h3>
                  <p className="text-xs text-slate-400">Code : {selectedStation.code} · {selectedStation.country}</p>
                </div>
              </div>

              {/* Valeur Principale */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Dernière mesure de surface</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{selectedStation.currentCO2}</span>
                  <span className="text-sm font-semibold text-emerald-400 font-mono">ppm</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Horodatage : {new Date(selectedStation.currentCO2Date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Métriques géographiques et métrologiques */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Altitude</span>
                  <strong className="text-slate-200">{selectedStation.altitude} m</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Tendance annuelle</span>
                  <strong className="text-emerald-400">+{selectedStation.trendYearlyPpm} ppm/an</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Cycle saisonnier</span>
                  <strong className="text-slate-200">±{selectedStation.seasonalAmplitudePpm / 2} ppm</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Coordonnées</span>
                  <strong className="text-slate-300">{selectedStation.latitude.toFixed(2)}°N, {selectedStation.longitude.toFixed(2)}°E</strong>
                </div>
              </div>

              {/* Niveaux de prélèvement mât Traînou si disponibles */}
              {selectedStation.samplingInletHeights && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Niveaux de prélèvement mât :</span>
                  <div className="flex gap-2">
                    {selectedStation.samplingInletHeights.map(h => (
                      <span key={h} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
                        {h} m
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instrument */}
              <div className="text-xs text-slate-300 space-y-1">
                <span className="text-slate-500 font-semibold block">Instrument métrologique :</span>
                <p className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                  {selectedStation.instrument}
                </p>
              </div>

              {/* Bouton de traçabilité et DOI */}
              <button
                onClick={() => {
                  setSelectedProvenance(selectedStation.provenance);
                  setSelectedCategory('MEASURED');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Consulter la traçabilité &amp; DOI</span>
              </button>
            </div>
          )}

          {selectedSounding && (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {selectedSounding.satellite}
                    </span>
                    <ProvenanceBadge
                      category="OBSERVED"
                      onClick={() => {
                        setSelectedProvenance(selectedSounding.provenance);
                        setSelectedCategory('OBSERVED');
                      }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white">Sondage Satellitaire XCO₂</h3>
                  <p className="text-xs text-slate-400">ID : {selectedSounding.observationId}</p>
                </div>
              </div>

              {/* Valeur et Quality Flag */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Fraction molaire moyenne de colonne</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{selectedSounding.xco2}</span>
                  <span className="text-sm font-semibold text-cyan-400 font-mono">ppm</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-xs font-mono">
                  <span className="text-slate-400">Incertitude : ±{selectedSounding.xco2Uncertainty} ppm</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedSounding.qualityFlag === '0'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}>
                    Flag {selectedSounding.qualityFlag === '0' ? '0 (Good)' : '1 (Warn)'}
                  </span>
                </div>
              </div>

              {/* Footprint & spécifications satellitaires */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Footprint (Empreinte)</span>
                  <strong className="text-slate-200">#{selectedSounding.footprint} (sur 8)</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Type de surface</span>
                  <strong className="text-cyan-400">{selectedSounding.surfaceType}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Angle zénithal solaire</span>
                  <strong className="text-slate-200">{selectedSounding.solarZenithAngle}°</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Pression surface</span>
                  <strong className="text-slate-200">{selectedSounding.surfacePressureHpa} hPa</strong>
                </div>
              </div>

              {/* Rappel Scientifique */}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Rappel Scientifique XCO₂
                </span>
                <p className="text-[11px] leading-relaxed">
                  XCO₂ mesure l'intégrale verticale moyenne d'air sec pondérée par la masse d'air depuis le sol jusqu'au sommet de l'atmosphère. Elle diffère naturellement de la concentration de surface.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProvenance(selectedSounding.provenance);
                  setSelectedCategory('OBSERVED');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Voir métadonnées granule NASA</span>
              </button>
            </div>
          )}

          {!selectedStation && !selectedSounding && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-slate-600 animate-spin" style={{ animationDuration: '10s' }} />
              <p className="text-xs">Cliquez sur un marqueur de station ou de satellite pour inspecter les observations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modale de traçabilité métrologique certifiée */}
      <DataProvenanceModal
        provenance={selectedProvenance}
        category={selectedCategory}
        onClose={() => setSelectedProvenance(null)}
      />
    </div>
  );
};
