import React from 'react';
import {
  Sprout, Plus, Trash2, ShieldAlert, PackageCheck, Edit3
} from 'lucide-react';

export default function PlantingPlanner({
  data,
  planVersion,
  setPlanVersion,
  onOpenAddLotModal,
  onOpenEditLotModal,
  onDeleteLot
}) {
  const meta = data?.meta || {};
  const totalPlantasObjetivo = meta.totalPlantasObjetivo ?? 142000;
  const plan1Objetivo = meta.plan1Objetivo ?? 32000;
  const plan2Objetivo = meta.plan2Objetivo ?? 110000;
  const bolsas27LDisponibles = meta.bolsas27LDisponibles ?? 7686;
  const bolsas27LFaltantesFase1 = meta.bolsas27LFaltantesFase1 ?? 24314;
  const cultivo = meta.cultivo || 'Arándano';
  const plan1Precio = meta.plan1PrecioPorPlanta ?? 752;
  const plan2Precio = meta.plan2PrecioPorPlanta ?? 700;
  const sustractoPrecio = meta.sustractoPrecioPorPlanta ?? 890;
  const costoPlan1 = plan1Objetivo * plan1Precio;
  const costoPlan2 = plan2Objetivo * plan2Precio;
  const costoSustractoPlan1 = plan1Objetivo * sustractoPrecio;
  const costoSustractoPlan2 = plan2Objetivo * sustractoPrecio;

  const siembras = Array.isArray(data?.siembras) ? data.siembras : [];
  const bloques = Array.isArray(data?.bloques) ? data.bloques : [];

  // Plan 1: 32.000 plantas en bolsa 27L Coco (plan independiente)
  const total27LCoco = siembras
    .filter(s => s?.contenedorTipo === '27L Coco' || s?.planAsociado === 'PLAN1')
    .reduce((sum, s) => sum + (s?.cantidad || 0), 0);

  // Plan 2: 110.000 plantas en bolsa 3L con sustrato alternativo (plan independiente)
  const total3LContingencia = siembras
    .filter(s => s?.contenedorTipo === '3L Sustrato Alt.' || s?.planAsociado === 'PLAN2')
    .reduce((sum, s) => sum + (s?.cantidad || 0), 0);

  const plantasRestantesPlan1 = Math.max(0, plan1Objetivo - total27LCoco);
  const plantasRestantesPlan2 = Math.max(0, plan2Objetivo - total3LContingencia);

  const pct27LDisponible = plan1Objetivo > 0
    ? Math.round((bolsas27LDisponibles / plan1Objetivo) * 100)
    : 24;

  const pctPlan1Programado = plan1Objetivo > 0
    ? Math.min(100, Math.round((total27LCoco / plan1Objetivo) * 100))
    : 0;

  const pctPlan2Programado = plan2Objetivo > 0
    ? Math.min(100, Math.round((total3LContingencia / plan2Objetivo) * 100))
    : 0;

  const fmtNum = (num) => (num ?? 0).toLocaleString('es-CO');

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-brand-verde" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Planificación de Siembra de {cultivo}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Meta: {fmtNum(totalPlantasObjetivo)} Plantas
            </span>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Gestión dual: Plan Definitivo en Bolsa de 27L (Coco) vs. Plan de Contingencia en Bolsa de 3L (Sustrato Alternativo).
          </p>
        </div>

        {/* Plan Selector Buttons */}
        <div className="flex items-center gap-2 bg-brand-crema p-1.5 rounded-xl border border-brand-border flex-wrap">
          <span className="text-xs font-bold text-brand-carbon px-2">Estrategia Activa:</span>
          
          <button
            onClick={() => setPlanVersion('PLAN1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              planVersion === 'PLAN1' || planVersion === 'A'
                ? 'bg-brand-verde text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-emerald-300" />
            Plan 1: Definitivo (Bolsa 27L Coco)
          </button>

          <button
            onClick={() => setPlanVersion('PLAN2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              planVersion === 'PLAN2' || planVersion === 'B'
                ? 'bg-brand-ocre text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-200" />
            Plan 2: Contingencia (Bolsa 3L Vivero)
          </button>
        </div>
      </div>

      {/* Resumen Estratégico Doble Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Plan 1 Banner */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl border-y border-r border-emerald-200 text-emerald-900 text-xs">
          <div className="flex items-start gap-3">
            <PackageCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-extrabold text-emerald-900 uppercase text-[11px] block">
                Plan 1 — Siembra Definitiva (Bolsa 27L Coco)
              </span>
              <p className="mt-0.5 text-emerald-800">
                Meta: <strong>{fmtNum(plan1Objetivo)} plantas</strong> en bolsa de 27L con sustrato de coco.
                Plan independiente del Plan 2.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-emerald-100 rounded px-2 py-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Disponibles Hoy</div>
                  <div className="font-extrabold text-emerald-900">{fmtNum(bolsas27LDisponibles)} bolsas</div>
                </div>
                <div className="bg-amber-100 rounded px-2 py-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Por Adquirir</div>
                  <div className="font-extrabold text-amber-900">{fmtNum(bolsas27LFaltantesFase1)} bolsas</div>
                </div>
                <div className="bg-emerald-50 rounded px-2 py-1 border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Siembra — ${fmtNum(plan1Precio)}/pl.</div>
                  <div className="font-extrabold text-emerald-900">${(costoPlan1 / 1000000).toFixed(2)} M COP</div>
                  <div className="text-[10px] text-emerald-700">{fmtNum(plan1Objetivo)} pl. × ${fmtNum(plan1Precio)}</div>
                </div>
                <div className="bg-amber-50 rounded px-2 py-1 border border-amber-200">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Adq. Sustrato — ${fmtNum(sustractoPrecio)}/pl.</div>
                  <div className="font-extrabold text-amber-900">${(costoSustractoPlan1 / 1000000).toFixed(2)} M COP</div>
                  <div className="text-[10px] text-amber-700">{fmtNum(plan1Objetivo)} pl. × ${fmtNum(sustractoPrecio)}</div>
                </div>
              </div>
              <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(100, pct27LDisponible)}%` }}></div>
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">{pct27LDisponible}% del inventario de bolsas 27L disponible</div>
            </div>
          </div>
        </div>

        {/* Plan 2 Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl border-y border-r border-amber-200 text-amber-900 text-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-extrabold text-amber-900 uppercase text-[11px] block">
                Plan 2 — Contingencia Vivero (Bolsa 3L Sustrato Alt.) — PLAN INDEPENDIENTE
              </span>
              <p className="mt-0.5 text-amber-800">
                <strong>{fmtNum(plan2Objetivo)} plantas</strong> se siembran provisionalmente en
                <strong> bolsas de 3L</strong> con sustrato alternativo.
                Este plan es completamente independiente del Plan 1 (32.000 plantas en 27L).
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-amber-100 rounded px-2 py-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Meta Plan 2</div>
                  <div className="font-extrabold text-amber-900">{fmtNum(plan2Objetivo)} plantas</div>
                </div>
                <div className="bg-amber-100 rounded px-2 py-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Programadas</div>
                  <div className="font-extrabold text-amber-900">{fmtNum(total3LContingencia)} plantas ({pctPlan2Programado}%)</div>
                </div>
                <div className="bg-amber-50 rounded px-2 py-1 border border-amber-200">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Siembra — ${fmtNum(plan2Precio)}/pl.</div>
                  <div className="font-extrabold text-amber-900">${(costoPlan2 / 1000000).toFixed(2)} M COP</div>
                  <div className="text-[10px] text-amber-700">{fmtNum(plan2Objetivo)} pl. × ${fmtNum(plan2Precio)}</div>
                </div>
                <div className="bg-orange-50 rounded px-2 py-1 border border-orange-200">
                  <div className="text-[10px] uppercase font-bold text-orange-700">Adq. Sustrato — ${fmtNum(sustractoPrecio)}/pl.</div>
                  <div className="font-extrabold text-orange-900">${(costoSustractoPlan2 / 1000000).toFixed(2)} M COP</div>
                  <div className="text-[10px] text-orange-700">{fmtNum(plan2Objetivo)} pl. × ${fmtNum(sustractoPrecio)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* KPI Cards for Dual Plan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total combinado */}
        <div className="brand-card border-l-4 border-l-brand-verde space-y-1">
          <span className="text-xs text-brand-carbon-muted uppercase font-semibold">
            Total Combinado
          </span>
          <div className="font-display text-2xl font-bold text-brand-carbon">
            {fmtNum(plan1Objetivo + plan2Objetivo)}
          </div>
          <p className="text-xs text-brand-carbon-muted">
            Plan 1 ({fmtNum(plan1Objetivo)}) + Plan 2 ({fmtNum(plan2Objetivo)})
          </p>
        </div>

        {/* Plan 1 total 27L */}
        <div className="brand-card border-l-4 border-l-emerald-600 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-800 uppercase font-semibold">
              Plan 1: 27L Coco
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {pctPlan1Programado}% prog.
            </span>
          </div>
          <div className="font-display text-2xl font-bold text-emerald-700">
            {fmtNum(plan1Objetivo)} <span className="text-xs font-normal">plantas</span>
          </div>
          <p className="text-xs text-emerald-800">
            <span className="text-emerald-700 font-bold">{fmtNum(bolsas27LDisponibles)}</span> listas
            &nbsp;·&nbsp;
            <span className="text-amber-700 font-bold">{fmtNum(bolsas27LFaltantesFase1)}</span> por adquirir
          </p>
        </div>

        {/* Plan 2: 3L Contingencia */}
        <div className="brand-card border-l-4 border-l-amber-500 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-800 uppercase font-semibold">
              Plan 2: 3L Vivero
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
              {pctPlan2Programado}% prog.
            </span>
          </div>
          <div className="font-display text-2xl font-bold text-amber-700">
            {fmtNum(plan2Objetivo)} <span className="text-xs font-normal">plantas</span>
          </div>
          <p className="text-xs text-amber-800">
            Bolsa 3L con Sustrato Alt. — Plan independiente
          </p>
        </div>

        {/* Programadas total */}
        <div className="brand-card border-l-4 border-l-blue-600 space-y-1">
          <span className="text-xs text-brand-carbon-muted uppercase font-semibold">
            Lotes Programados
          </span>
          <div className="font-display text-2xl font-bold text-blue-700">
            {fmtNum(total27LCoco + total3LContingencia)}
          </div>
          <p className="text-xs text-brand-carbon-muted">
            27L: {fmtNum(total27LCoco)} · 3L: {fmtNum(total3LContingencia)}
          </p>
        </div>

      </div>

      {/* Main Lots Table */}
      <div className="brand-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-brand-carbon">
              Lotes de Siembra y Estrategia de Contenedores ({cultivo})
            </h3>
            <p className="text-xs text-brand-carbon-muted">
              {planVersion === 'PLAN1' || planVersion === 'A'
                ? 'Visualizando con énfasis en la Siembra Definitiva (Bolsa de 27L con Sustrato de Coco).'
                : 'Visualizando con énfasis en la Siembra Provisional (Bolsa de 3L con Sustrato Alternativo).'}
            </p>
          </div>

          <button onClick={onOpenAddLotModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Programar Lote
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-crema text-brand-carbon uppercase font-bold text-[11px] border-b border-brand-border">
              <tr>
                <th className="p-3">Nombre del Lote</th>
                <th className="p-3">Bloque</th>
                <th className="p-3">Tipo de Contenedor</th>
                <th className="p-3">Cantidad Plantas</th>
                <th className="p-3">Estrategia Plan</th>
                <th className="p-3">Fecha Plan</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {siembras.map((lote) => {
                const bloque = bloques.find(b => b.id === lote.bloqueId);
                const is27L = lote.contenedorTipo === '27L Coco' || lote.planAsociado === 'PLAN1' || lote.densidadFactor > 1;

                return (
                  <tr key={lote.id} className="hover:bg-brand-crema-light/50 transition-colors">
                    <td className="p-3 font-bold text-brand-carbon">
                      {lote.nombre}
                    </td>
                    <td className="p-3 font-semibold text-brand-verde">
                      {bloque ? bloque.codigo : lote.bloqueId}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        is27L ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {lote.contenedorTipo || (is27L ? '27L Coco' : '3L Sustrato Alt.')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-brand-carbon">
                      {fmtNum(lote.cantidad)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        is27L ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {is27L ? 'Plan 1 Definitivo' : 'Plan 2 Contingencia'}
                      </span>
                    </td>
                    <td className="p-3 text-brand-carbon-muted">
                      {lote.fechaPlan}
                    </td>
                    <td className="p-3">
                      <span className="status-badge status-atencion">
                        {lote.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenEditLotModal && onOpenEditLotModal(lote)}
                          className="p-1.5 rounded text-gray-400 hover:text-brand-verde hover:bg-emerald-50 transition-colors"
                          title="Editar lote"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLot && onDeleteLot(lote.id)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar lote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Capacity Analysis */}
      <div className="brand-card space-y-4">
        <h3 className="font-display text-lg font-bold text-brand-carbon border-b border-brand-border pb-3">
          Ocupación y Capacidad Restante por Bloque
        </h3>

        {bloques.length === 0 ? (
          <p className="text-xs text-brand-carbon-muted text-center py-4">
            No hay bloques registrados. Agregue bloques en la pestaña "Bloques e Infraestructura".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bloques.map((bloque) => {
              const asignadasP1 = siembras
                .filter(s => s.bloqueId === bloque.id && (s.planAsociado === 'PLAN1' || s.contenedorTipo === '27L Coco'))
                .reduce((sum, s) => sum + (s?.cantidad || 0), 0);
              const asignadasP2 = siembras
                .filter(s => s.bloqueId === bloque.id && (s.planAsociado === 'PLAN2' || s.contenedorTipo === '3L Sustrato Alt.'))
                .reduce((sum, s) => sum + (s?.cantidad || 0), 0);

              const capP1 = bloque.capacidadPlan1 || 0;
              const capP2 = bloque.capacidadPlan2 || 0;
              const pctP1 = capP1 > 0 ? Math.round((asignadasP1 / capP1) * 100) : 0;
              const pctP2 = capP2 > 0 ? Math.round((asignadasP2 / capP2) * 100) : 0;

              return (
                <div key={bloque.id} className="p-3 bg-white rounded-lg border border-brand-border space-y-3 text-xs">
                  <div className="font-bold text-brand-carbon text-sm">{bloque.codigo}</div>

                  {/* Plan 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-emerald-700">Plan 1 (27L Coco)</span>
                      <span className={pctP1 > 100 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {pctP1}% ocup.
                      </span>
                    </div>
                    <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pctP1 > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, pctP1)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-carbon-muted">
                      <span>{fmtNum(asignadasP1)} asignadas</span>
                      <span>Cap: {fmtNum(capP1)} pl.</span>
                    </div>
                  </div>

                  {/* Plan 2 */}
                  <div className="space-y-1 pt-1 border-t border-brand-border/40">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-amber-700">Plan 2 (3L Vivero)</span>
                      <span className={pctP2 > 100 ? 'text-red-600 font-bold' : 'text-amber-700 font-bold'}>
                        {pctP2}% ocup.
                      </span>
                    </div>
                    <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pctP2 > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, pctP2)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-carbon-muted">
                      <span>{fmtNum(asignadasP2)} asignadas</span>
                      <span>Cap: {fmtNum(capP2)} pl.</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
