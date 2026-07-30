import React from 'react';
import {
  Package, ShoppingCart, AlertCircle, Plus, Building2,
  CheckCircle2, Edit3, Trash2
} from 'lucide-react';

export default function InventoryManager({ data, onOpenAddInsumoModal, onOpenEditInsumoModal, onDeleteInsumo }) {
  const proveedoresConsolidados = data.insumos.reduce((acc, item) => {
    const faltante = Math.max(0, item.requerido - (item.bodega + item.campo));
    if (faltante > 0) {
      if (!acc[item.proveedor]) acc[item.proveedor] = [];
      acc[item.proveedor].push({ ...item, faltante });
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-verde" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Inventario de Insumos de Riego & Faltantes
            </h2>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Control de existencias en bodega, instalados en campo y solicitudes de compra a proveedores.
          </p>
        </div>
        <button onClick={onOpenAddInsumoModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Registrar Insumo
        </button>
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.insumos.map((item) => {
          const disponibleTotal = item.bodega + item.campo;
          const faltante = Math.max(0, item.requerido - disponibleTotal);
          const pctCubierto = item.requerido > 0 ? Math.round((disponibleTotal / item.requerido) * 100) : 100;

          return (
            <div key={item.id} className="brand-card space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-carbon-muted uppercase tracking-wider">
                    {item.categoria}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`status-badge ${faltante === 0 ? 'status-excelente' : 'status-riesgo'}`}>
                      {faltante === 0 ? '✓ COMPLETO' : `FALTAN ${faltante.toLocaleString('es-CO')}`}
                    </span>
                    <button
                      onClick={() => onOpenEditInsumoModal(item)}
                      className="p-1 rounded text-gray-400 hover:text-brand-verde hover:bg-emerald-50 transition-colors"
                      title="Editar insumo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteInsumo(item.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar insumo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-base font-bold text-brand-carbon mt-1">
                  {item.nombre}
                </h3>
                <span className="text-xs text-gray-500 block">Proveedor: {item.proveedor}</span>

                {/* Progress */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-carbon">
                    <span>Disponible: {disponibleTotal.toLocaleString('es-CO')}</span>
                    <span>Requerido: {item.requerido.toLocaleString('es-CO')} {item.unidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${faltante === 0 ? 'bg-brand-verde' : 'bg-brand-ocre'}`}
                      style={{ width: `${Math.min(100, pctCubierto)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[11px] text-brand-carbon-muted">{pctCubierto}% cubierto</div>
                </div>

                {/* Stock breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-brand-crema-light rounded border border-brand-border text-xs">
                  <div>
                    <span className="text-gray-500 block">Bodega:</span>
                    <strong className="text-brand-carbon">{item.bodega.toLocaleString('es-CO')}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Campo:</span>
                    <strong className="text-brand-carbon">{item.campo.toLocaleString('es-CO')}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Costo Unit.:</span>
                    <strong className="text-brand-carbon">${(item.costoUnitarioEst || 0).toLocaleString('es-CO')}</strong>
                  </div>
                </div>
              </div>

              {faltante > 0 && (
                <div className="p-2 bg-orange-50 rounded border border-orange-200 text-xs text-brand-ocre font-medium flex items-center justify-between">
                  <span>Compra urgente:</span>
                  <strong className="font-extrabold">{faltante.toLocaleString('es-CO')} {item.unidad}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Supplier Purchase Requisition */}
      <div className="brand-card space-y-4 border-l-4 border-l-brand-ocre">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <ShoppingCart className="w-5 h-5 text-brand-ocre" />
          <h3 className="font-display text-lg font-bold text-brand-carbon">
            Requerimientos Consolidados por Proveedor
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(proveedoresConsolidados).length === 0 ? (
            <p className="text-xs text-emerald-700 font-semibold p-4 bg-emerald-50 rounded-lg">
              ✓ Todo el inventario se encuentra cubierto al 100%. No se requieren compras inmediatas.
            </p>
          ) : (
            Object.entries(proveedoresConsolidados).map(([proveedor, items]) => (
              <div key={proveedor} className="p-4 bg-white rounded-xl border border-brand-border space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="font-bold text-sm text-brand-carbon flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand-verde" />
                    {proveedor}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-brand-ocre/10 text-brand-ocre font-bold rounded">
                    {items.length} ítem(s) faltante(s)
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-brand-crema-light rounded border border-brand-border">
                      <div>
                        <strong className="text-brand-carbon">{item.nombre}</strong>
                        <span className="text-gray-500 block text-[11px]">Categoría: {item.categoria}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-brand-ocre font-extrabold text-sm block">
                          {item.faltante.toLocaleString('es-CO')} {item.unidad}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Est: ${((item.faltante * (item.costoUnitarioEst || 0)) / 1000000).toFixed(1)} M COP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
