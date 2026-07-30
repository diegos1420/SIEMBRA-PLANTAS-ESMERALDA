import React, { useState } from 'react';
import {
  CalendarCheck, Plus, Filter, CheckSquare, Square, Flag, Edit3, Trash2
} from 'lucide-react';

export default function TimelineTasks({
  data,
  onToggleTaskStatus,
  onOpenAddTaskModal,
  onOpenEditTaskModal,
  onDeleteTarea
}) {
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterState, setFilterState] = useState('ALL');

  const hitos = [
    { fecha: '2026-07-25', titulo: 'Vencimiento respuesta Agrodinco', desc: 'Define densidad doble (2.5) vs sencilla.', estado: 'VENCIDO' },
    { fecha: '2026-07-27', titulo: 'Notificación Pancoger $30M', desc: 'Envío de compromiso a Flujo de Caja.', estado: 'URGENTE' },
    { fecha: '2026-08-01', titulo: 'Disponibilidad Bloques 2, 6, 8', desc: 'Infraestructura lista para recibir plantas.', estado: 'PROGRAMADO' },
    { fecha: '2026-08-03', titulo: 'Inicio 1ª Siembra (32.000 Plantas)', desc: 'Fase 1: Bloque 2 y Bloque 7A.', estado: 'CLAVE' },
    { fecha: '2026-08-10', titulo: 'Adecuación Bloque 4 (Contingencia)', desc: 'Finalización de cubiertas y líneas de riego.', estado: 'PROGRAMADO' },
    { fecha: '2026-08-14', titulo: 'Siembra Plantas de Belleza (30.000)', desc: 'Fase 2: Bloque 8.', estado: 'CLAVE' }
  ];

  const filteredTareas = data.tareas.filter((t) => {
    if (filterCat !== 'ALL' && t.categoria !== filterCat) return false;
    if (filterState !== 'ALL' && t.estado !== filterState) return false;
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-verde" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Cronograma de Hitos & Plan de Acción
            </h2>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Fechas críticas del proyecto y tareas operativas asignadas por responsable.
          </p>
        </div>
        <button onClick={onOpenAddTaskModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>

      {/* Visual Timeline */}
      <div className="brand-card space-y-4">
        <h3 className="font-display text-lg font-bold text-brand-carbon border-b border-brand-border pb-3 flex items-center gap-2">
          <Flag className="w-5 h-5 text-brand-ocre" />
          Línea de Tiempo del Proyecto (Hitos Clave)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {hitos.map((hito, idx) => (
            <div key={idx} className="p-3 bg-brand-crema-light rounded-xl border border-brand-border space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-verde">{hito.fecha}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                    hito.estado === 'URGENTE' || hito.estado === 'VENCIDO' ? 'bg-red-600 text-white' : 'bg-brand-ocre text-white'
                  }`}>
                    {hito.estado}
                  </span>
                </div>
                <strong className="text-xs font-bold text-brand-carbon block mt-1 leading-snug">{hito.titulo}</strong>
                <p className="text-[11px] text-brand-carbon-muted mt-1">{hito.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="brand-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
          <h3 className="font-display text-lg font-bold text-brand-carbon">
            Plan de Acción de Tareas ({filteredTareas.length})
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-brand-crema px-3 py-1.5 rounded-lg text-xs border border-brand-border">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500">Categoría:</span>
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-transparent font-semibold text-brand-carbon focus:outline-none">
                <option value="ALL">Todas</option>
                <option value="costos">Costos</option>
                <option value="sustrato">Sustrato</option>
                <option value="decision">Decisión</option>
                <option value="insumos">Insumos</option>
                <option value="infraestructura">Infraestructura</option>
                <option value="agua">Agua</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-brand-crema px-3 py-1.5 rounded-lg text-xs border border-brand-border">
              <span className="text-gray-500">Estado:</span>
              <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="bg-transparent font-semibold text-brand-carbon focus:outline-none">
                <option value="ALL">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En Curso</option>
                <option value="hecha">Hecha</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {filteredTareas.length === 0 && (
            <p className="text-xs text-center text-brand-carbon-muted py-6">No hay tareas con los filtros seleccionados.</p>
          )}
          {filteredTareas.map((tarea) => {
            const isDone = tarea.estado === 'hecha';
            const isEnCurso = tarea.estado === 'en_curso';
            return (
              <div
                key={tarea.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200 opacity-75'
                    : tarea.prioridad === 'alta'
                    ? 'bg-white border-red-200 hover:border-red-400 shadow-sm'
                    : 'bg-white border-brand-border hover:border-brand-verde/50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button onClick={() => onToggleTaskStatus(tarea.id)} className="mt-0.5 focus:outline-none flex-shrink-0">
                    {isDone
                      ? <CheckSquare className="w-5 h-5 text-brand-verde" />
                      : <Square className="w-5 h-5 text-gray-400 hover:text-brand-verde" />
                    }
                  </button>
                  <div className="space-y-1 min-w-0">
                    <p className={`text-xs font-semibold leading-snug ${isDone ? 'line-through text-gray-500' : 'text-brand-carbon'}`}>
                      {tarea.descripcion}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-carbon-muted">
                      <span>Resp: <strong className="text-brand-carbon">{tarea.responsable}</strong></span>
                      <span>Vence: <strong className="text-red-700">{tarea.fechaLimite}</strong></span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 uppercase font-bold text-[10px]">{tarea.categoria}</span>
                      {tarea.prioridad === 'alta' && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase font-bold text-[10px]">ALTA PRIORIDAD</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`status-badge whitespace-nowrap ${
                    isDone ? 'status-excelente' : isEnCurso ? 'status-atencion' : 'status-critico'
                  }`}>
                    {tarea.estado.toUpperCase().replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onOpenEditTaskModal(tarea)}
                    className="p-1.5 rounded text-gray-400 hover:text-brand-verde hover:bg-emerald-50 transition-colors"
                    title="Editar tarea"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTarea(tarea.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
