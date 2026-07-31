import React, { useState } from 'react';
import {
  Boxes, Plus, Edit3, Filter, Trash2, ClipboardList
} from 'lucide-react';
import ChecklistEditModal from './ChecklistEditModal';
import { getGroupPct, getBlockPct, isBlockReady, ESTADO_COLORS, ESTADO_LABELS } from '../utils/checklist';

export default function BlockManagement({
  data,
  onUpdateChecklist,
  onOpenAddBlockModal,
  onOpenEditBlockModal,
  onDeleteBlock
}) {
  const [filterOwner, setFilterOwner] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [checklistBlock, setChecklistBlock] = useState(null);

  const filteredBloques = data.bloques.filter((b) => {
    const isReady = isBlockReady(b);

    if (filterOwner !== 'ALL' && b.propietarioInfra !== filterOwner) return false;
    if (filterStatus === 'READY' && !isReady) return false;
    if (filterStatus === 'PENDING' && isReady) return false;
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-brand-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-brand-verde" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Gestión de Bloques e Infraestructura
            </h2>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Trazabilidad de ejecución por bloque: Infraestructura y Sistema de Riego.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Owner Filter */}
          <div className="flex items-center gap-1 bg-brand-crema px-3 py-1.5 rounded-lg text-xs border border-brand-border">
            <Filter className="w-3.5 h-3.5 text-brand-carbon-muted" />
            <span className="text-brand-carbon-muted">Propietario:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-transparent font-semibold text-brand-carbon focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos</option>
              <option value="Agroventure">Agroventure</option>
              <option value="Proberries">Proberries</option>
              <option value="Combinados">Combinados</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-brand-crema px-3 py-1.5 rounded-lg text-xs border border-brand-border">
            <span className="text-brand-carbon-muted">Estado:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-semibold text-brand-carbon focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos</option>
              <option value="READY">100% Listos</option>
              <option value="PENDING">En Preparación</option>
            </select>
          </div>

          <button
            onClick={onOpenAddBlockModal}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo Bloque
          </button>
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBloques.map((bloque) => {
          const pct = getBlockPct(bloque);
          const isReady = isBlockReady(bloque);
          const grupos = bloque.infraestructura?.grupos || [];

          return (
            <div
              key={bloque.id}
              className={`brand-card relative flex flex-col justify-between space-y-4 border-2 transition-all ${
                isReady
                  ? 'border-brand-verde/60 bg-emerald-50/30'
                  : pct >= 60
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-red-300 bg-red-50/20'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-lg font-bold text-brand-carbon">
                      {bloque.codigo}
                    </h3>
                    <button
                      onClick={() => onOpenEditBlockModal(bloque)}
                      className="text-gray-400 hover:text-brand-verde p-1 rounded transition-colors"
                      title="Editar bloque"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBlock(bloque.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Eliminar bloque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className={`status-badge ${
                    isReady ? 'status-excelente' : pct >= 60 ? 'status-atencion' : 'status-critico'
                  }`}>
                    {isReady ? '✓ LISTO PARA SIEMBRA' : `${pct}% LISTO`}
                  </span>
                </div>

                {/* Specs breakdown */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-white/80 rounded-lg border border-brand-border/60 text-xs">
                  <div>
                    <span className="text-brand-carbon-muted block">Infra:</span>
                    <strong className="text-brand-carbon">{bloque.propietarioInfra}</strong>
                  </div>
                  <div>
                    <span className="text-brand-carbon-muted block">Plantas:</span>
                    <strong className="text-brand-carbon">{bloque.propietarioPlantas}</strong>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-2 pt-1 border-t border-brand-border/40 mt-1">
                    <div className="bg-emerald-50 rounded p-1.5 border border-emerald-200">
                      <span className="text-emerald-700 text-[10px] font-bold uppercase block">Plan 1 (27L Coco)</span>
                      <strong className="text-emerald-900">{(bloque.capacidadPlan1 || 0).toLocaleString('es-CO')} pl.</strong>
                    </div>
                    <div className="bg-amber-50 rounded p-1.5 border border-amber-200">
                      <span className="text-amber-700 text-[10px] font-bold uppercase block">Plan 2 (3L Vivero)</span>
                      <strong className="text-amber-900">{(bloque.capacidadPlan2 || 0).toLocaleString('es-CO')} pl.</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-brand-carbon-muted block">Área:</span>
                    <strong className="text-brand-carbon">{bloque.area} Ha</strong>
                  </div>
                  <div>
                    <span className="text-brand-carbon-muted block">Riego Est:</span>
                    <strong className="text-blue-700">{bloque.consumoAguaEst} m³/día</strong>
                  </div>
                </div>

                {/* Checklist por grupo */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-carbon-muted uppercase tracking-wider">
                      Avance de Ejecución
                    </span>
                    <button
                      onClick={() => setChecklistBlock(bloque)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-brand-verde hover:underline"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Editar Checklist
                    </button>
                  </div>

                  {grupos.map(grupo => {
                    const gpct = getGroupPct(grupo);
                    const pendientes = grupo.items.filter(i => (i.pct || 0) < 100);
                    return (
                      <div key={grupo.nombre} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-medium text-brand-carbon">
                          <span>{grupo.nombre}</span>
                          <span>{gpct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${gpct === 100 ? 'bg-brand-verde' : gpct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${gpct}%` }}
                          ></div>
                        </div>
                        {pendientes.length > 0 && (
                          <div className="space-y-0.5">
                            {pendientes.slice(0, 3).map(item => (
                              <div key={item.nombre} className="flex items-center justify-between text-[10px] bg-white/70 rounded px-2 py-1 border border-brand-border/40">
                                <span className="text-brand-carbon-muted truncate flex-1">{item.nombre}</span>
                                <span className={`ml-2 px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${ESTADO_COLORS[item.estado]?.bg} ${ESTADO_COLORS[item.estado]?.text}`}>
                                  {item.pct}% · {ESTADO_LABELS[item.estado]}
                                </span>
                              </div>
                            ))}
                            {pendientes.length > 3 && (
                              <p className="text-[10px] text-brand-carbon-muted italic pl-2">
                                +{pendientes.length - 3} ítem(s) más pendientes...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer / Notes */}
              {bloque.destinoNotas && (
                <div className="pt-3 border-t border-brand-border text-xs text-brand-carbon-muted bg-white/60 p-2.5 rounded-lg">
                  <strong className="text-brand-carbon font-semibold">Notas / Destino:</strong> {bloque.destinoNotas}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ChecklistEditModal
        key={checklistBlock?.id || 'none'}
        bloque={checklistBlock}
        onClose={() => setChecklistBlock(null)}
        onSave={(grupos) => {
          onUpdateChecklist(checklistBlock.id, grupos);
          setChecklistBlock(null);
        }}
      />

    </div>
  );
}
