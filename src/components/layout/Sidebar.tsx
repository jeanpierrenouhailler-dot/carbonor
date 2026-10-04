import React from 'react';
import { 
  Home, 
  Map, 
  Thermometer, 
  Satellite, 
  Layers, 
  Atom, 
  SlidersHorizontal, 
  Wind, 
  Scale, 
  Flag, 
  Database, 
  BookOpen, 
  ChevronRight,
  Flame
} from 'lucide-react';

export type ViewKey = 
  | 'dashboard'
  | 'map'
  | 'surface'
  | 'xco2'
  | 'profiles'
  | 'spectroscopy-lines'
  | 'spectroscopy-pqr'
  | 'spectroscopy-lab'
  | 'flux'
  | 'emissions'
  | 'compare'
  | 'france'
  | 'sources'
  | 'docs';

interface SidebarProps {
  currentView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onCloseMobile
}) => {
  const navSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard' as ViewKey, label: 'Accueil / Synthèse', icon: Home },
        { id: 'map' as ViewKey, label: 'Carte Interactive Multi-couches', icon: Map, badge: 'Sol + OCO' }
      ]
    },
    {
      title: 'Atmosphère & Concentrations',
      items: [
        { id: 'surface' as ViewKey, label: 'CO₂ au Sol (NOAA / ICOS)', icon: Thermometer },
        { id: 'xco2' as ViewKey, label: 'XCO₂ Satellites (OCO-2 / OCO-3)', icon: Satellite },
        { id: 'profiles' as ViewKey, label: 'Profils Verticaux (AirCore & CAMS)', icon: Layers }
      ]
    },
    {
      title: 'Physique & Spectroscopie',
      items: [
        { id: 'spectroscopy-lines' as ViewKey, label: 'Explorateur de Raies HITRAN', icon: Atom },
        { id: 'spectroscopy-pqr' as ViewKey, label: 'Structure P / Q / R (15 & 4.3 µm)', icon: Wind },
        { id: 'spectroscopy-lab' as ViewKey, label: 'Laboratoire CO₂ (Beer-Lambert)', icon: SlidersHorizontal, badge: '280-1000 ppm' }
      ]
    },
    {
      title: 'Flux, Émissions & Inversion',
      items: [
        { id: 'flux' as ViewKey, label: 'Flux de Surface & Inversions CAMS', icon: Wind },
        { id: 'emissions' as ViewKey, label: 'Émissions & Inventaires CITEPA', icon: Flame },
        { id: 'france' as ViewKey, label: 'France & Europe', icon: Flag }
      ]
    },
    {
      title: 'Analyse & Validation',
      items: [
        { id: 'compare' as ViewKey, label: 'Comparateur Multi-Sources', icon: Scale },
        { id: 'sources' as ViewKey, label: 'Sources, Licences & Provenance', icon: Database },
        { id: 'docs' as ViewKey, label: 'Documentation Scientifique', icon: BookOpen }
      ]
    }
  ];

  const handleSelect = (id: ViewKey) => {
    onSelectView(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-950/95 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {navSections.map(sec => (
            <div key={sec.title}>
              <h2 className="px-2 mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                {sec.title}
              </h2>
              <nav className="space-y-0.5">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Scientific citation footer */}
        <div className="p-4 mt-6 mx-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="font-semibold text-slate-300">Portail Ouvert CO₂</div>
          <div className="text-[10px] text-slate-500">NOAA · ICOS · CAMS · OCO · HITRAN</div>
        </div>
      </aside>
    </>
  );
};
