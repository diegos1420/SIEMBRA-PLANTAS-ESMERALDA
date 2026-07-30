import React from 'react';
import {
  DollarSign, ShieldAlert, CheckCircle2, Plus, Edit3, Trash2
} from 'lucide-react';

export default function FinancialCosts({
  data,
  onToggleCostStatus,
  onOpenAddCostModal,
  onOpenEditCostModal,
  onDeleteCosto
}) {
  const totalCostos = data.costos.reduce((sum, c) => sum + c.montoCOP, 0);
  const totalPendientes = data.costos.filter(c => c.estadoFlujoCaja === 'PENDIENTE').reduce((sum, c) => sum + c.montoCOP, 0);
  const totalAvisados = totalCostos - totalPendientes;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-verde" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Centros de Costo & Notificaciones a Flujo de Caja
            </h2>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Articulación de costos por bloque, propietario y control de notificaciones a Tesorería.
          </p>
        </div>
        <button onClick={onOpenAddCostModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Registrar Costo
        </button>
      </div>

      {/* Pancoger Alert */}
      {(() => {
        const pancoger = data.costos.find(c => c.concepto.includes('Pancoger'));
        if (!pancoger || pancoger.estadoFlujoCaja !== 'PENDIENTE') return null;
        return (
          <div className="bg-gradient-to-br from-red-950 via-red-900 to-brand-carbon text-white p-6 rounded-2xl shadow-xl border-2 border-red-500 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 rounded-xl">
                  <ShieldAlert className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-red-500 text-white uppercase tracking-wider">
                    HALLAZGO Y RIESGO FINANCIERO CRÍTICO
                  </span>
                  <h3 className="font-display text-xl font-extrabold text-white mt-1">
                    Contratación Pancoger ~ $30.000.000 COP
                  </h3>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/30 border border-red-400 text-red-100">
                Centro de Costos: Bloque 7A / 7B
              </span>
            </div>
            <p className="text-sm text-red-100 leading-relaxed max-w-3xl">
              Existe un <strong>riesgo financiero abierto</strong>: el pago estimado de $30M por la posible contratación de "Pancoger" <strong>aún no ha sido comunicado al área de flujo de caja</strong>. Notificar a Tesorería antes del desembolso de agosto.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-red-800">
              <div className="text-xs text-red-200">
                Estado: <strong className="text-amber-300 font-bold uppercase">PENDIENTE DE COMUNICAR A CAJA</strong>
              </div>
              <button onClick={() => onToggleCostStatus(pancoger.id)} className="btn-accent text-xs shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                Marcar como Notificado a Flujo de Caja
              </button>
            </div>
          </div>
        );
      })()}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="brand-card border-l-4 border-l-brand-carbon space-y-1">
          <span className="text-xs text-brand-carbon-muted uppercase font-semibold">Total Costos Registrados</span>
          <div className="font-display text-2xl font-bold text-brand-carbon">${(totalCostos / 1000000).toFixed(1)} M COP</div>
          <span className="text-xs text-gray-500">Finca La Esmeralda</span>
        </div>
        <div className="brand-card border-l-4 border-l-emerald-600 space-y-1">
          <span className="text-xs text-brand-carbon-muted uppercase font-semibold">Notificados a Flujo de Caja</span>
          <div className="font-display text-2xl font-bold text-emerald-700">${(totalAvisados / 1000000).toFixed(1)} M COP</div>
          <span className="text-xs text-emerald-700 font-medium">✓ En presupuesto de Tesorería</span>
        </div>
        <div className="brand-card border-l-4 border-l-red-600 space-y-1">
          <span className="text-xs text-brand-carbon-muted uppercase font-semibold">Pendientes por Notificar</span>
          <div className="font-display text-2xl font-bold text-red-600">${(totalPendientes / 1000000).toFixed(1)} M COP</div>
          <span className="text-xs text-red-600 font-medium">⚠️ Requiere envío a caja</span>
        </div>
      </div>

      {/* Costs Table */}
      <div className="brand-card space-y-4">
        <h3 className="font-display text-lg font-bold text-brand-carbon border-b border-brand-border pb-3">
          Listado de Costos y Centros de Costos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-crema text-brand-carbon uppercase font-bold text-[11px] border-b border-brand-border">
              <tr>
                <th className="p-3">Concepto</th>
                <th className="p-3">Centro Costo</th>
                <th className="p-3">Propietario</th>
                <th className="p-3">Monto (COP)</th>
                <th className="p-3">Estado Flujo de Caja</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {data.costos.map((costo) => {
                const isPendiente = costo.estadoFlujoCaja === 'PENDIENTE';
                return (
                  <tr
                    key={costo.id}
                    className={`hover:bg-brand-crema-light/50 transition-colors ${costo.esCritico ? 'bg-red-50/60 font-semibold' : ''}`}
                  >
                    <td className="p-3 font-bold text-brand-carbon">
                      {costo.concepto}
                      {costo.esCritico && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-600 text-white font-extrabold rounded">CRÍTICO</span>
                      )}
                      {costo.notas && (
                        <p className="text-[11px] text-brand-carbon-muted font-normal mt-0.5">{costo.notas}</p>
                      )}
                    </td>
                    <td className="p-3 text-brand-verde font-semibold">{costo.centroCosto}</td>
                    <td className="p-3 text-brand-carbon-muted">{costo.propietario}</td>
                    <td className="p-3 font-bold text-brand-carbon">${costo.montoCOP.toLocaleString('es-CO')}</td>
                    <td className="p-3">
                      <span className={`status-badge ${isPendiente ? 'status-critico' : 'status-excelente'}`}>
                        {isPendiente ? '⚠️ PENDIENTE' : '✓ AVISADO'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleCostStatus(costo.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                            isPendiente ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {isPendiente ? 'Marcar Avisado' : 'Revertir'}
                        </button>
                        <button
                          onClick={() => onOpenEditCostModal(costo)}
                          className="p-1.5 rounded text-gray-400 hover:text-brand-verde hover:bg-emerald-50 transition-colors"
                          title="Editar costo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCosto(costo.id)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar costo"
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

    </div>
  );
}
