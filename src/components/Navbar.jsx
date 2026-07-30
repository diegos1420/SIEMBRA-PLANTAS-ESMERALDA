import React from 'react';
import {
  LayoutDashboard, Boxes, Sprout, Droplets, Package,
  DollarSign, CalendarCheck, AlertTriangle, FileText
} from 'lucide-react';


export default function Navbar({ 
  activeTab, 
  setActiveTab,
  pancogerPendiente 
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bloques', label: 'Bloques e Infraestructura', icon: Boxes },
    { id: 'siembra', label: 'Plan de Siembra (Arándano)', icon: Sprout },
    { id: 'agua', label: 'Balance Hídrico', icon: Droplets },
    { id: 'insumos', label: 'Insumos & Sustrato', icon: Package },
    { 
      id: 'costos', 
      label: 'Costos & Caja', 
      icon: DollarSign,
      badge: pancogerPendiente ? 'ALERTA $30M' : null
    },
    { id: 'tareas', label: 'Cronograma & Tareas', icon: CalendarCheck },
    { id: 'decisiones', label: 'Decisiones & Riesgos', icon: AlertTriangle },
    { id: 'informe', label: 'Informe Gerencia', icon: FileText },
  ];

  return (
    <header className="bg-brand-carbon text-white shadow-lg sticky top-0 z-40">
      {/* Top Brand Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-verde via-brand-ocre to-brand-verde"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/avc_logo.png"
              alt="Agroventure Capital"
              className="h-14 w-auto object-contain rounded-lg"
            />
            <p className="text-xs text-brand-crema-dark font-medium">
              Arándano · Finca La Esmeralda
            </p>
          </div>



        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'bg-brand-crema text-brand-carbon font-bold shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-verde' : 'text-gray-400'}`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-verde"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
