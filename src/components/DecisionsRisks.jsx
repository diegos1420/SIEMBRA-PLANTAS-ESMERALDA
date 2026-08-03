import React from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, Plus, Lightbulb, Edit3, Trash2, CalendarClock
} from 'lucide-react';
import TimelineSustrato from './TimelineSustrato';

export default function DecisionsRisks({
  data,
  onOpenAddDecisionModal,
  onOpenEditDecisionModal,
  onDeleteDecision,
  onOpenAddRiskModal,
  onOpenEditRiskModal,
  onDeleteRisk,
  onToggleRiskStatus,
  onOpenAddTimelineModal,
  onOpenEditTimelineModal,
  onDeleteTimelineEvent
}) {
  const estadoDecisionColor = {
    ABIERTA: 'bg-red-100 text-red-700 border border-red-200',
    EN_PROCESO: 'bg-amber-100 text-amber-700 border border-amber-200',
    RESUELTA: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-brand-ocre" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Decisiones Pendientes & Matriz de Riesgos Operacionales
            </h2>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Gestión proactiva de cuellos de botella, contingencias y mitigación de riesgos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenAddDecisionModal} className="btn-secondary">
            <Plus className="w-4 h-4" />
            Registrar Decisión
          </button>
          <button onClick={onOpenAddRiskModal} className="btn-accent">
            <Plus className="w-4 h-4" />
            Registrar Riesgo
          </button>
        </div>
      </div>

      {/* Timeline de Abastecimiento de Sustrato */}
      <div className="brand-card space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <h3 className="font-display text-lg font-bold text-brand-carbon">
              Línea de Tiempo — Abastecimiento de Sustrato y Bolsas
            </h3>
          </div>
          <button onClick={onOpenAddTimelineModal} className="btn-secondary">
            <Plus className="w-4 h-4" />
            Agregar Evento
          </button>
        </div>

        {(!data.cronologiaSustrato || data.cronologiaSustrato.length === 0) && (
          <p className="text-xs text-center text-brand-carbon-muted py-6">No hay eventos registrados en la línea de tiempo.</p>
        )}

        <TimelineSustrato
          eventos={data.cronologiaSustrato}
          onEdit={onOpenEditTimelineModal}
          onDelete={onDeleteTimelineEvent}
        />
      </div>

      {/* Decisions Board */}
      <div className="brand-card space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-ocre" />
            <h3 className="font-display text-lg font-bold text-brand-carbon">
              Tablero de Decisiones ({data.decisiones.length})
            </h3>
          </div>
        </div>

        {data.decisiones.length === 0 && (
          <p className="text-xs text-center text-brand-carbon-muted py-6">No hay decisiones registradas.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.decisiones.map((dec) => (
            <div key={dec.id} className="p-4 bg-brand-crema-light/70 rounded-xl border border-brand-border space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <strong className="text-sm font-bold text-brand-carbon leading-snug flex-1">
                    {dec.titulo}
                  </strong>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onOpenEditDecisionModal(dec)}
                      className="p-1 rounded text-gray-400 hover:text-brand-verde hover:bg-white transition-colors"
                      title="Editar decisión"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDecision(dec.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
                      title="Eliminar decisión"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded bg-brand-ocre text-white font-extrabold text-[10px]">
                    Vence: {dec.vencimiento}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${estadoDecisionColor[dec.estado] || 'bg-gray-100 text-gray-700'}`}>
                    {dec.estado}
                  </span>
                </div>

                <p className="text-xs text-brand-carbon-muted mt-2 leading-relaxed">
                  {dec.descripcion}
                </p>

                {dec.planContingencia && (
                  <div className="mt-3 p-2.5 bg-white rounded-lg border border-brand-border text-xs space-y-1">
                    <span className="font-bold text-brand-verde block">Plan de Contingencia:</span>
                    <p className="text-brand-carbon italic">{dec.planContingencia}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-500 pt-2 border-t border-brand-border">
                <span>Resp: <strong>{dec.responsable}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Register */}
      <div className="brand-card space-y-4 border-l-4 border-l-red-600">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-display text-lg font-bold text-brand-carbon">
              Matriz de Riesgos Operacionales ({data.riesgos.length})
            </h3>
          </div>
        </div>

        {data.riesgos.length === 0 && (
          <p className="text-xs text-center text-brand-carbon-muted py-6">No hay riesgos registrados.</p>
        )}

        <div className="space-y-3">
          {data.riesgos.map((riesgo) => {
            const isMitigated = riesgo.estado === 'MITIGADO';
            const isEnMitigacion = riesgo.estado === 'EN_MITIGACION';
            return (
              <div
                key={riesgo.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isMitigated
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : riesgo.impacto === 'ALTO'
                    ? 'bg-red-50/40 border-red-300'
                    : 'bg-amber-50/40 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <strong className="font-bold text-sm text-brand-carbon">{riesgo.titulo}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex-shrink-0 ${
                      riesgo.impacto === 'ALTO' ? 'bg-red-600 text-white' : riesgo.impacto === 'MEDIO' ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white'
                    }`}>
                      IMPACTO {riesgo.impacto}
                    </span>
                    {isEnMitigacion && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 flex-shrink-0">
                        EN MITIGACIÓN
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onToggleRiskStatus(riesgo.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${
                        isMitigated
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {isMitigated ? '✓ Mitigado' : 'Marcar Mitigado'}
                    </button>
                    <button
                      onClick={() => onOpenEditRiskModal(riesgo)}
                      className="p-1.5 rounded text-gray-400 hover:text-brand-verde hover:bg-white transition-colors"
                      title="Editar riesgo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRisk(riesgo.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
                      title="Eliminar riesgo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-brand-carbon-muted">{riesgo.descripcion}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white rounded border border-brand-border">
                    <strong className="text-brand-carbon block">Acción de Mitigación:</strong>
                    <span className="text-brand-carbon-muted">{riesgo.mitigacion}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-brand-border flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block">Responsable:</span>
                      <strong className="text-brand-carbon">{riesgo.responsable}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block">Probabilidad:</span>
                      <strong className="text-brand-ocre">{riesgo.probabilidad}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
