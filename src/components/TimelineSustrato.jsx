import React from 'react';
import { CalendarClock, PackageX, Package, ShoppingCart, AlertTriangle } from 'lucide-react';

const TIPO_CONFIG = {
  ALERTA: {
    icon: AlertTriangle,
    dot: 'bg-red-500',
    ring: 'ring-red-200',
    badge: 'bg-red-100 text-red-700 border-red-200',
    card: 'border-red-200 bg-red-50/40',
    label: 'Déficit',
  },
  HITO: {
    icon: Package,
    dot: 'bg-blue-500',
    ring: 'ring-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    card: 'border-blue-200 bg-blue-50/40',
    label: 'Llegada',
  },
  COMPRA: {
    icon: ShoppingCart,
    dot: 'bg-amber-500',
    ring: 'ring-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    card: 'border-amber-200 bg-amber-50/40',
    label: 'Acción de compra',
  },
};

export default function TimelineSustrato({ eventos = [], compact = false }) {
  if (!eventos.length) return null;

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-amber-400" />

      <div className="space-y-4">
        {eventos.map((ev) => {
          const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG.HITO;
          const Icon = cfg.icon;
          return (
            <div key={ev.id} className="relative flex gap-4 pdf-avoid-break">
              {/* Nodo */}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${cfg.dot} ring-4 ${cfg.ring} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>

              {/* Contenido */}
              <div className={`flex-1 rounded-xl border p-3 ${cfg.card} ${compact ? 'text-[11px]' : 'text-xs'}`}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {ev.semana != null && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-carbon text-white font-bold text-[10px]">
                      <CalendarClock className="w-3 h-3" />
                      Semana {ev.semana}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded border font-bold text-[10px] uppercase ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  {ev.fecha && (
                    <span className="text-[10px] text-brand-carbon-muted">{ev.fecha}</span>
                  )}
                </div>

                <p className="font-bold text-brand-carbon leading-snug">{ev.titulo}</p>
                <p className="text-brand-carbon-muted mt-1 leading-relaxed">{ev.descripcion}</p>

                {ev.metricas?.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {ev.metricas.map((m, i) => (
                      <div key={i} className="bg-white/80 rounded p-1.5 border border-brand-border/50 text-center">
                        <span className="block text-[9px] uppercase text-gray-500 font-semibold leading-tight">{m.label}</span>
                        <strong className="text-brand-carbon text-[11px]">{m.valor}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
