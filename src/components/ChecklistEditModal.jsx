import React, { useState } from 'react';
import Modal from './Modal';
import { getGroupPct } from '../utils/checklist';

export default function ChecklistEditModal({ bloque, onClose, onSave }) {
  const [grupos, setGrupos] = useState(() =>
    JSON.parse(JSON.stringify(bloque?.infraestructura?.grupos || []))
  );

  if (!bloque) return null;

  const updateItem = (gi, ii, field, value) => {
    setGrupos(prev => {
      const next = [...prev];
      const items = [...next[gi].items];
      const item = { ...items[ii], [field]: value };
      if (field === 'pct') {
        const pct = Math.max(0, Math.min(100, parseInt(value) || 0));
        item.pct = pct;
        item.estado = pct === 100 ? 'CULMINADO' : pct === 0 ? 'PENDIENTE' : 'EN_CURSO';
      }
      items[ii] = item;
      next[gi] = { ...next[gi], items };
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(grupos);
  };

  return (
    <Modal isOpen={!!bloque} onClose={onClose} title={`Checklist de Ejecución — ${bloque.codigo}`} wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        {grupos.map((grupo, gi) => (
          <div key={grupo.nombre} className="space-y-2">
            <div className="flex items-center justify-between bg-brand-crema px-3 py-1.5 rounded-lg">
              <span className="font-bold text-brand-carbon uppercase text-xs">{grupo.nombre}</span>
              <span className="font-bold text-brand-verde text-xs">{getGroupPct(grupo)}%</span>
            </div>
            <div className="space-y-1.5">
              {grupo.items.map((item, ii) => (
                <div key={item.nombre} className="grid grid-cols-12 gap-2 items-center p-2 border border-brand-border rounded-lg">
                  <span className="col-span-5 text-brand-carbon font-medium">{item.nombre}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.pct}
                    onChange={e => updateItem(gi, ii, 'pct', e.target.value)}
                    className="col-span-2 p-1.5 border border-brand-border rounded text-center"
                  />
                  <select
                    value={item.estado}
                    onChange={e => updateItem(gi, ii, 'estado', e.target.value)}
                    className="col-span-3 p-1.5 border border-brand-border rounded"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_CURSO">En Curso</option>
                    <option value="CULMINADO">Culminado</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nota..."
                    value={item.nota || ''}
                    onChange={e => updateItem(gi, ii, 'nota', e.target.value)}
                    className="col-span-2 p-1.5 border border-brand-border rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 flex justify-end gap-2 border-t border-brand-border">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </Modal>
  );
}
