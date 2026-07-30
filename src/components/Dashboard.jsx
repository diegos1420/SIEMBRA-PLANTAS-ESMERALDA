import React from 'react';
import { 
  Sprout, 
  Boxes, 
  Droplets, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Building2,
  FileCheck2
} from 'lucide-react';

export default function Dashboard({ 
  data, 
  setActiveTab, 
  planVersion,
  helperCalculations 
}) {
  const {
    totalPlantasObjetivo,
    totalPlantasAsignadas,
    plantasFaltantes,
    bloquesListos,
    totalBloques,
    consumoRiegoDiario,
    consumoLavadoSustrato,
    consumoHidricoTotal,
    capacidadHidrica,
    pancogerCost,
    tareasCriticas,
    decisionesAbiertas,
    riesgosAbiertos
  } = helperCalculations;

  const pctWater = Math.round((consumoHidricoTotal / capacidadHidrica) * 100);

  return (
    <div className="space-y-6">
      
      {/* Executive Welcome & Brand Header Banner */}
      <div className="bg-gradient-to-r from-brand-verde via-brand-verde-hover to-brand-carbon text-white rounded-2xl p-6 shadow-card border border-brand-verde/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Sprout className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-ocre text-white uppercase tracking-wider">
              Control Operativo de Siembra
            </span>
            <span className="text-xs text-brand-crema/80 font-medium">
              Finca La Esmeralda
            </span>
          </div>
          
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resumen Ejecutivo & Logística de Siembra (Arándano)
          </h1>
          
          <p className="text-sm text-brand-crema/90 font-normal leading-relaxed">
            Monitoreo en tiempo real para <strong>110.000 plantas de Arándano</strong>, adecuación de infraestructura por bloques, balance de recursos hídricos y estrategia dual: <strong>Plan 1 (Bolsa 27L Coco)</strong> vs. <strong>Plan 2 (Contingencia Bolsa 3L)</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <span className="text-brand-crema">Estrategia Activa:</span>
              <strong className="text-white font-bold underline decoration-brand-ocre">
                {planVersion === 'PLAN1' || planVersion === 'A' 
                  ? 'Plan 1: Siembra Definitiva Bolsa 27L Coco (7.686 Disponibles)' 
                  : 'Plan 2: Contingencia Vivero Bolsa 3L (24.314 Plantas)'}
              </strong>
            </div>
            <div className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <span className="text-brand-crema">Disponibilidad Coco 27L:</span>
              <strong className="text-emerald-300">7.686 / 32.000 (Déficit: 24.314)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL FINANCIAL & OPERATIONAL ALERT BANNER (PANCOGER & WATER) */}
      {pancogerCost && pancogerCost.estadoFlujoCaja === 'PENDIENTE' && (
        <div className="bg-gradient-to-r from-red-900/90 via-red-800 to-brand-carbon text-white p-5 rounded-xl shadow-lg border-2 border-red-500 animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600 rounded-xl shadow-inner flex-shrink-0">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-red-500 text-white uppercase">
                  ALERTA GERENCIAL CRÍTICA
                </span>
                <span className="text-xs text-red-200">Pendiente de comunicación a Flujo de Caja</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Contratación Pancoger ~${(pancogerCost.montoCOP / 1000000).toLocaleString('es-CO')} Millones de Pesos
              </h3>
              <p className="text-xs text-red-100 mt-1 max-w-2xl">
                {pancogerCost.notas} Este compromiso financiero debe ser notificado de inmediato a Tesorería para evitar descalces en la proyección de caja de agosto.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('costos')}
            className="btn-accent text-xs whitespace-nowrap self-start md:self-center shadow-lg hover:bg-brand-ocre-hover"
          >
            Ver Módulo de Costos
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Plantas Totales */}
        <div className="brand-card space-y-2 border-l-4 border-l-brand-verde">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-carbon-muted">
              Plantas por Ubicar
            </span>
            <div className="p-2 rounded-lg bg-brand-verde-light text-brand-verde">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-brand-carbon">
              {totalPlantasAsignadas.toLocaleString('es-CO')}
            </span>
            <span className="text-xs text-brand-carbon-muted font-medium">
              de {totalPlantasObjetivo.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-verde h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((totalPlantasAsignadas / totalPlantasObjetivo) * 100))}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-brand-carbon-muted pt-1">
            <span>Asignadas: {Math.round((totalPlantasAsignadas / totalPlantasObjetivo) * 100)}%</span>
            <span className="font-semibold text-brand-ocre">Faltan: {plantasFaltantes.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {/* KPI 2: Disponibilidad de Bloques */}
        <div className="brand-card space-y-2 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-carbon-muted">
              Bloques 100% Listos
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-brand-carbon">
              {bloquesListos} / {totalBloques}
            </span>
            <span className="status-badge status-excelente">
              {totalBloques > 0 ? Math.round((bloquesListos / totalBloques) * 100) : 0}% Preparados
            </span>
          </div>
          <p className="text-xs text-brand-carbon-muted">
            Checklist completo de 6 ítems (Techo, Cubierta, Tubería, Bigotes, Goteros, Líneas).
          </p>
          <button
            onClick={() => setActiveTab('bloques')}
            className="text-xs font-semibold text-brand-verde hover:underline inline-flex items-center gap-1 pt-1"
          >
            Revisar estado de bloques →
          </button>
        </div>

        {/* KPI 3: Balance Hídrico */}
        <div className="brand-card space-y-2 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-carbon-muted">
              Balance Hídrico Diario
            </span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-brand-carbon">
              {consumoHidricoTotal} m³
            </span>
            <span className="text-xs font-semibold text-blue-800">
              Cap: {capacidadHidrica} m³/día
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                pctWater > 90 ? 'bg-red-600' : pctWater > 75 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, pctWater)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-brand-carbon-muted flex justify-between pt-1">
            <span>Riego: {consumoRiegoDiario} m³</span>
            <span className="font-semibold text-brand-ocre">+ Lavado Sustrato: {consumoLavadoSustrato} m³</span>
          </div>
        </div>

        {/* KPI 4: Decisiones & Riesgos */}
        <div className="brand-card space-y-2 border-l-4 border-l-brand-ocre">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-carbon-muted">
              Riesgos & Decisiones
            </span>
            <div className="p-2 rounded-lg bg-brand-ocre-light text-brand-ocre">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-4">
            <div>
              <span className="font-display text-2xl font-bold text-brand-ocre">
                {decisionesAbiertas}
              </span>
              <span className="text-xs text-brand-carbon-muted block">Decisiones pend.</span>
            </div>
            <div className="border-l border-gray-300 pl-4">
              <span className="font-display text-2xl font-bold text-red-600">
                {riesgosAbiertos}
              </span>
              <span className="text-xs text-brand-carbon-muted block">Riesgos abiertos</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('decisiones')}
            className="text-xs font-semibold text-brand-ocre hover:underline inline-flex items-center gap-1 pt-1"
          >
            Ver matriz de riesgos →
          </button>
        </div>

      </div>

      {/* Main Grid: Status Semáforo of Blocks & Critical Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Semáforo Estado de Bloques (2 cols) */}
        <div className="lg:col-span-2 brand-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-brand-verde" />
              <h2 className="font-display text-lg font-bold text-brand-carbon">
                Estado de Infraestructura por Bloques (Semáforo)
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('bloques')}
              className="text-xs font-medium text-brand-verde hover:underline"
            >
              Ver Checklist Detallado
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.bloques.map((bloque) => {
              const infraKeys = Object.keys(bloque.infraestructura);
              const installedCount = Object.values(bloque.infraestructura).filter(Boolean).length;
              const pct = Math.round((installedCount / infraKeys.length) * 100);
              const isReady = installedCount === infraKeys.length;

              return (
                <div 
                  key={bloque.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isReady 
                      ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500' 
                      : pct >= 60
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-red-50/40 border-red-200 hover:border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-brand-carbon">{bloque.codigo}</span>
                    <span className={`status-badge ${
                      isReady ? 'status-excelente' : pct >= 60 ? 'status-atencion' : 'status-critico'
                    }`}>
                      {isReady ? '✓ LISTO' : `${pct}% LISTO`}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-brand-carbon-muted space-y-1">
                    <div className="flex justify-between">
                      <span>Propietario Infra:</span>
                      <strong className="text-brand-carbon">{bloque.propietarioInfra}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cap. P1 / P2:</span>
                      <strong className="text-brand-carbon">
                        {(bloque.capacidadPlan1 || 0).toLocaleString('es-CO')} / {(bloque.capacidadPlan2 || 0).toLocaleString('es-CO')}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Disponible:</span>
                      <span className="text-gray-500">{bloque.fechaDisponibilidad}</span>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isReady ? 'bg-brand-verde' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Key Alerts & Critical Action Plan (1 col) */}
        <div className="space-y-6">
          
          {/* Key Decisions & Contingencies */}
          <div className="brand-card space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand-ocre" />
                <h3 className="font-display text-base font-bold text-brand-carbon">
                  Decisión Pendiente Clave
                </h3>
              </div>
            </div>

            {data.decisiones.slice(0, 2).map((dec) => (
              <div key={dec.id} className="p-3 bg-brand-crema-light rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <strong className="text-brand-carbon font-semibold leading-snug">{dec.titulo}</strong>
                  <span className="px-2 py-0.5 rounded bg-brand-ocre/20 text-brand-ocre font-bold text-[10px] whitespace-nowrap">
                    Vence: {dec.vencimiento}
                  </span>
                </div>
                <p className="text-brand-carbon-muted">{dec.descripcion}</p>
                <div className="p-2 bg-white rounded border border-brand-border text-[11px] text-brand-carbon">
                  <strong className="text-brand-verde block">Plan de Contingencia:</strong>
                  {dec.planContingencia}
                </div>
              </div>
            ))}
          </div>

          {/* Action Plan Tasks */}
          <div className="brand-card space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-verde" />
                <h3 className="font-display text-base font-bold text-brand-carbon">
                  Próximas Tareas Críticas
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tareas')}
                className="text-xs text-brand-verde hover:underline"
              >
                Ver todas ({data.tareas.length})
              </button>
            </div>

            <div className="space-y-2">
              {tareasCriticas.slice(0, 4).map((tarea) => (
                <div key={tarea.id} className="p-2.5 bg-white rounded-lg border border-brand-border text-xs flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    tarea.prioridad === 'alta' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-brand-carbon leading-snug">{tarea.descripcion}</p>
                    <div className="flex items-center justify-between text-[11px] text-brand-carbon-muted">
                      <span>Resp: <strong>{tarea.responsable}</strong></span>
                      <span className="text-red-700 font-semibold">{tarea.fechaLimite}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
