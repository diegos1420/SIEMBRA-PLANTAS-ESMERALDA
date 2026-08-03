import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_DATA } from './data/initialData';
import { supabase, APP_STATE_ID } from './lib/supabase';
import { crearChecklistVacio, isBlockReady } from './utils/checklist';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BlockManagement from './components/BlockManagement';
import PlantingPlanner from './components/PlantingPlanner';
import WaterBalance from './components/WaterBalance';
import InventoryManager from './components/InventoryManager';
import FinancialCosts from './components/FinancialCosts';
import TimelineTasks from './components/TimelineTasks';
import DecisionsRisks from './components/DecisionsRisks';
import ReporteGerencia from './components/ReporteGerencia';
import Modal from './components/Modal';

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [planVersion, setPlanVersion] = useState('PLAN1');

  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [syncError, setSyncError] = useState(null);

  // Carga inicial desde Supabase
  useEffect(() => {
    if (!supabase) {
      setSyncError('Configuración de Supabase ausente (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Los datos no se guardarán.');
      setLoading(false);
      return;
    }
    supabase
      .from('app_state')
      .select('data')
      .eq('id', APP_STATE_ID)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (error) {
          setSyncError('No se pudo conectar con la base de datos: ' + error.message);
        } else if (row?.data) {
          const saved = row.data;
          setData({
            ...INITIAL_DATA,
            ...saved,
            meta: { ...INITIAL_DATA.meta, ...(saved.meta || {}) },
            sustrato: { ...INITIAL_DATA.sustrato, ...(saved.sustrato || {}) },
          });
          setPlanVersion(saved.planVersion || 'PLAN1');
        }
        setLoading(false);
      });
  }, []);

  // Guarda en Supabase cada vez que cambia data o planVersion
  useEffect(() => {
    if (loading || !supabase) return;
    supabase
      .from('app_state')
      .upsert({ id: APP_STATE_ID, data: { ...data, planVersion } }, { onConflict: 'id' })
      .then(({ error }) => {
        if (error) setSyncError('Error al guardar en la base de datos: ' + error.message);
        else setSyncError(null);
      });
  }, [data, planVersion, loading]);

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setFormData({});
  };

  // ── Reset / Export ────────────────────────────────────────────────────────
  const handleResetData = () => {
    if (window.confirm("¿Deseas restablecer todos los datos a la configuración inicial de Finca La Esmeralda?")) {
      setData(INITIAL_DATA);
      setPlanVersion('PLAN1');
      if (supabase) {
        supabase.from('app_state').upsert({ id: APP_STATE_ID, data: { ...INITIAL_DATA, planVersion: 'PLAN1' } }, { onConflict: 'id' });
      }
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `Agroventure_Siembra_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── Checklist de infraestructura ──────────────────────────────────────────
  const handleUpdateChecklist = (blockId, grupos) => {
    setData(prev => ({
      ...prev,
      bloques: prev.bloques.map(b =>
        b.id === blockId ? { ...b, infraestructura: { grupos } } : b
      )
    }));
  };

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const handleToggleTaskStatus = (taskId) => {
    setData(prev => ({
      ...prev,
      tareas: prev.tareas.map(t =>
        t.id === taskId ? { ...t, estado: t.estado === 'hecha' ? 'pendiente' : 'hecha' } : t
      )
    }));
  };

  const handleToggleCostStatus = (costId) => {
    setData(prev => ({
      ...prev,
      costos: prev.costos.map(c =>
        c.id === costId
          ? { ...c, estadoFlujoCaja: c.estadoFlujoCaja === 'PENDIENTE' ? 'AVISADO' : 'PENDIENTE' }
          : c
      )
    }));
  };

  const handleToggleRiskStatus = (riskId) => {
    setData(prev => ({
      ...prev,
      riesgos: prev.riesgos.map(r =>
        r.id === riskId ? { ...r, estado: r.estado === 'ABIERTO' ? 'MITIGADO' : 'ABIERTO' } : r
      )
    }));
  };

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteBlock = (id) => {
    if (window.confirm("¿Eliminar este bloque?")) {
      setData(prev => ({ ...prev, bloques: prev.bloques.filter(b => b.id !== id) }));
    }
  };

  const handleDeleteLot = (id) => {
    if (window.confirm("¿Eliminar este lote de siembra?")) {
      setData(prev => ({ ...prev, siembras: prev.siembras.filter(s => s.id !== id) }));
    }
  };

  const handleDeleteInsumo = (id) => {
    if (window.confirm("¿Eliminar este insumo?")) {
      setData(prev => ({ ...prev, insumos: prev.insumos.filter(i => i.id !== id) }));
    }
  };

  const handleDeleteCosto = (id) => {
    if (window.confirm("¿Eliminar este costo?")) {
      setData(prev => ({ ...prev, costos: prev.costos.filter(c => c.id !== id) }));
    }
  };

  const handleDeleteTarea = (id) => {
    if (window.confirm("¿Eliminar esta tarea?")) {
      setData(prev => ({ ...prev, tareas: prev.tareas.filter(t => t.id !== id) }));
    }
  };

  const handleDeleteDecision = (id) => {
    if (window.confirm("¿Eliminar esta decisión?")) {
      setData(prev => ({ ...prev, decisiones: prev.decisiones.filter(d => d.id !== id) }));
    }
  };

  const handleDeleteRisk = (id) => {
    if (window.confirm("¿Eliminar este riesgo?")) {
      setData(prev => ({ ...prev, riesgos: prev.riesgos.filter(r => r.id !== id) }));
    }
  };

  const handleDeleteTimelineEvent = (id) => {
    if (window.confirm("¿Eliminar este evento de la línea de tiempo?")) {
      setData(prev => ({ ...prev, cronologiaSustrato: (prev.cronologiaSustrato || []).filter(ev => ev.id !== id) }));
    }
  };

  // ── Open edit modals ──────────────────────────────────────────────────────
  const openEdit = (type, item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalType(type);
  };

  // La línea de tiempo tiene un array anidado (metricas), así que se "aplana"
  // en hasta 3 pares label/valor para poder editarlo con el mismo patrón de formulario.
  const openEditTimeline = (ev) => {
    setEditingItem(ev);
    const m = ev.metricas || [];
    setFormData({
      titulo: ev.titulo, descripcion: ev.descripcion, tipo: ev.tipo, estado: ev.estado,
      semana: ev.semana ?? '', fecha: ev.fecha || '',
      m1Label: m[0]?.label || '', m1Valor: m[0]?.valor || '',
      m2Label: m[1]?.label || '', m2Valor: m[1]?.valor || '',
      m3Label: m[2]?.label || '', m3Valor: m[2]?.valor || '',
    });
    setModalType('timelineEvento');
  };

  // ── KPI calculations ──────────────────────────────────────────────────────
  const helperCalculations = (() => {
    const totalPlantasObjetivo = data?.meta?.totalPlantasObjetivo || 110000;
    const totalPlantasAsignadas = (data.siembras || []).reduce((sum, s) => sum + Math.round(s?.cantidad || 0), 0);
    const plantasFaltantes = Math.max(0, totalPlantasObjetivo - totalPlantasAsignadas);
    const totalBloques = data.bloques.length;
    const bloquesListos = data.bloques.filter(isBlockReady).length;
    const consumoRiegoDiario = data.bloques.reduce((sum, b) => sum + (b.consumoAguaEst || 0), 0);
    const consumoLavadoSustrato = data.sustrato.volumenAguaLavadoM3;
    const consumoHidricoTotal = consumoRiegoDiario + consumoLavadoSustrato;
    const capacidadHidrica = data.meta.capacidadHidricaDiaria;
    const pancogerCost = data.costos.find(c => c.concepto.includes('Pancoger'));
    const tareasCriticas = data.tareas.filter(t => t.estado !== 'hecha');
    const decisionesAbiertas = data.decisiones.filter(d => d.estado !== 'RESUELTA').length;
    const riesgosAbiertos = data.riesgos.filter(r => r.estado === 'ABIERTO').length;
    return {
      totalPlantasObjetivo, totalPlantasAsignadas, plantasFaltantes,
      totalBloques, bloquesListos,
      consumoRiegoDiario, consumoLavadoSustrato, consumoHidricoTotal, capacidadHidrica,
      pancogerCost, tareasCriticas, decisionesAbiertas, riesgosAbiertos
    };
  })();

  const pancogerPendiente = helperCalculations.pancogerCost && helperCalculations.pancogerCost.estadoFlujoCaja === 'PENDIENTE';

  // ── Save modal form ───────────────────────────────────────────────────────
  const handleSaveModalForm = (e) => {
    e.preventDefault();

    if (modalType === 'block') {
      if (editingItem) {
        setData(prev => ({
          ...prev,
          bloques: prev.bloques.map(b => b.id === editingItem.id ? {
            ...b,
            codigo: formData.codigo || b.codigo,
            propietarioInfra: formData.propietarioInfra || b.propietarioInfra,
            propietarioPlantas: formData.propietarioPlantas || b.propietarioPlantas,
            area: parseFloat(formData.area) || b.area,
            capacidadPlan1: parseInt(formData.capacidadPlan1) || b.capacidadPlan1 || 0,
            capacidadPlan2: parseInt(formData.capacidadPlan2) || b.capacidadPlan2 || 0,
            valvulas: parseInt(formData.valvulas) || b.valvulas,
            consumoAguaEst: parseInt(formData.consumoAguaEst) || b.consumoAguaEst,
            destinoNotas: formData.destinoNotas ?? b.destinoNotas,
            fechaDisponibilidad: formData.fechaDisponibilidad || b.fechaDisponibilidad,
          } : b)
        }));
      } else {
        const newBlock = {
          id: `b_${Date.now()}`,
          codigo: formData.codigo || `Bloque ${data.bloques.length + 1}`,
          propietarioInfra: formData.propietarioInfra || 'Agroventure',
          propietarioPlantas: formData.propietarioPlantas || 'Agroventure',
          area: parseFloat(formData.area) || 1.5,
          capacidadPlan1: parseInt(formData.capacidadPlan1) || 0,
          capacidadPlan2: parseInt(formData.capacidadPlan2) || 0,
          valvulas: parseInt(formData.valvulas) || 5,
          consumoAguaEst: parseInt(formData.consumoAguaEst) || 20,
          destinoNotas: formData.destinoNotas || '',
          fechaDisponibilidad: formData.fechaDisponibilidad || '',
          infraestructura: crearChecklistVacio()
        };
        setData(prev => ({ ...prev, bloques: [...prev.bloques, newBlock] }));
      }

    } else if (modalType === 'lot') {
      const lotData = {
        nombre: formData.nombre || 'Nuevo Lote',
        bloqueId: formData.bloqueId || data.bloques[0]?.id || 'b2',
        cantidad: parseInt(formData.cantidad) || 15000,
        tipoPlanta: formData.tipoPlanta || 'Arándano',
        fechaPlan: formData.fechaPlan || '2026-08-05',
        estado: formData.estado || 'Planificada',
        contenedorTipo: formData.contenedorTipo || '27L Coco',
        planAsociado: formData.planAsociado || 'PLAN1',
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          siembras: prev.siembras.map(s => s.id === editingItem.id ? { ...s, ...lotData } : s)
        }));
      } else {
        setData(prev => ({ ...prev, siembras: [...prev.siembras, { id: `s_${Date.now()}`, ...lotData }] }));
      }

    } else if (modalType === 'insumo') {
      const insumoData = {
        nombre: formData.nombre || 'Nuevo Insumo',
        categoria: formData.categoria || 'Goteros',
        bodega: parseInt(formData.bodega) || 0,
        campo: parseInt(formData.campo) || 0,
        requerido: parseInt(formData.requerido) || 0,
        unidad: formData.unidad || 'unidades',
        proveedor: formData.proveedor || '',
        costoUnitarioEst: parseInt(formData.costoUnitarioEst) || 0,
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          insumos: prev.insumos.map(i => i.id === editingItem.id ? { ...i, ...insumoData } : i)
        }));
      } else {
        setData(prev => ({ ...prev, insumos: [...prev.insumos, { id: `i_${Date.now()}`, ...insumoData }] }));
      }

    } else if (modalType === 'cost') {
      const costData = {
        concepto: formData.concepto || 'Nuevo Costo',
        centroCosto: formData.centroCosto || 'General',
        bloqueId: formData.bloqueId || 'b2',
        propietario: formData.propietario || 'Agroventure',
        montoCOP: parseInt(formData.montoCOP) || 0,
        estadoFlujoCaja: formData.estadoFlujoCaja || 'PENDIENTE',
        esCritico: formData.esCritico === 'true' || formData.esCritico === true,
        notas: formData.notas || '',
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          costos: prev.costos.map(c => c.id === editingItem.id ? { ...c, ...costData } : c)
        }));
      } else {
        setData(prev => ({ ...prev, costos: [...prev.costos, { id: `c_${Date.now()}`, ...costData }] }));
      }

    } else if (modalType === 'task') {
      const taskData = {
        descripcion: formData.descripcion || 'Nueva Tarea',
        responsable: formData.responsable || 'Miller',
        fechaLimite: formData.fechaLimite || '2026-08-01',
        estado: formData.estado || 'pendiente',
        bloqueId: formData.bloqueId || 'b2',
        categoria: formData.categoria || 'infraestructura',
        prioridad: formData.prioridad || 'media',
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          tareas: prev.tareas.map(t => t.id === editingItem.id ? { ...t, ...taskData } : t)
        }));
      } else {
        setData(prev => ({ ...prev, tareas: [...prev.tareas, { id: `t_${Date.now()}`, ...taskData }] }));
      }

    } else if (modalType === 'decision') {
      const decData = {
        titulo: formData.titulo || 'Nueva Decisión',
        descripcion: formData.descripcion || '',
        vencimiento: formData.vencimiento || '2026-08-01',
        responsable: formData.responsable || 'Gerencia',
        planContingencia: formData.planContingencia || '',
        estado: formData.estado || 'ABIERTA',
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          decisiones: prev.decisiones.map(d => d.id === editingItem.id ? { ...d, ...decData } : d)
        }));
      } else {
        setData(prev => ({ ...prev, decisiones: [...prev.decisiones, { id: `d_${Date.now()}`, ...decData }] }));
      }

    } else if (modalType === 'risk') {
      const riskData = {
        titulo: formData.titulo || 'Nuevo Riesgo',
        descripcion: formData.descripcion || '',
        impacto: formData.impacto || 'ALTO',
        probabilidad: formData.probabilidad || 'MEDIA',
        responsable: formData.responsable || 'Logística',
        mitigacion: formData.mitigacion || '',
        estado: formData.estado || 'ABIERTO',
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          riesgos: prev.riesgos.map(r => r.id === editingItem.id ? { ...r, ...riskData } : r)
        }));
      } else {
        setData(prev => ({ ...prev, riesgos: [...prev.riesgos, { id: `r_${Date.now()}`, ...riskData }] }));
      }

    } else if (modalType === 'timelineEvento') {
      const metricas = [];
      if (formData.m1Label && formData.m1Valor) metricas.push({ label: formData.m1Label, valor: formData.m1Valor });
      if (formData.m2Label && formData.m2Valor) metricas.push({ label: formData.m2Label, valor: formData.m2Valor });
      if (formData.m3Label && formData.m3Valor) metricas.push({ label: formData.m3Label, valor: formData.m3Valor });
      const eventoData = {
        titulo: formData.titulo || 'Nuevo Evento',
        descripcion: formData.descripcion || '',
        tipo: formData.tipo || 'HITO',
        estado: formData.estado || 'PENDIENTE',
        semana: formData.semana !== '' && formData.semana != null ? parseInt(formData.semana) : null,
        fecha: formData.fecha || '',
        metricas,
      };
      if (editingItem) {
        setData(prev => ({
          ...prev,
          cronologiaSustrato: (prev.cronologiaSustrato || []).map(ev => ev.id === editingItem.id ? { ...ev, ...eventoData } : ev)
        }));
      } else {
        setData(prev => ({ ...prev, cronologiaSustrato: [...(prev.cronologiaSustrato || []), { id: `tl_${Date.now()}`, ...eventoData }] }));
      }
    }

    closeModal();
  };

  // ── Modal title helper ────────────────────────────────────────────────────
  const modalTitle = {
    block: editingItem ? 'Editar Bloque' : 'Crear Nuevo Bloque',
    lot: editingItem ? 'Editar Lote de Siembra' : 'Programar Lote de Siembra',
    cost: editingItem ? 'Editar Costo' : 'Registrar Centro de Costo',
    task: editingItem ? 'Editar Tarea' : 'Crear Tarea en Plan de Acción',
    insumo: editingItem ? 'Editar Insumo' : 'Registrar Insumo de Riego',
    decision: editingItem ? 'Editar Decisión' : 'Registrar Decisión Pendiente',
    risk: editingItem ? 'Editar Riesgo' : 'Registrar Riesgo Operacional',
    timelineEvento: editingItem ? 'Editar Evento de Línea de Tiempo' : 'Agregar Evento a Línea de Tiempo',
  }[modalType] || '';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-crema gap-4">
        <img src="/avc_logo.png" alt="Agroventure Capital" className="h-20 w-auto object-contain" />
        <p className="text-brand-carbon font-semibold text-sm animate-pulse">Cargando datos de Finca La Esmeralda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-crema">

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        planVersion={planVersion}
        setPlanVersion={setPlanVersion}
        onResetData={handleResetData}
        onExportData={handleExportData}
        pancogerPendiente={pancogerPendiente}
      />

      {syncError && (
        <div className="bg-red-600 text-white text-xs font-semibold px-4 py-2 text-center">
          ⚠ {syncError} — los cambios pueden no estar guardándose en la base de datos.
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            setActiveTab={setActiveTab}
            planVersion={planVersion}
            helperCalculations={helperCalculations}
          />
        )}

        {activeTab === 'bloques' && (
          <BlockManagement
            data={data}
            onUpdateChecklist={handleUpdateChecklist}
            onOpenAddBlockModal={() => { setEditingItem(null); setFormData({}); setModalType('block'); }}
            onOpenEditBlockModal={(b) => openEdit('block', b)}
            onDeleteBlock={handleDeleteBlock}
          />
        )}

        {activeTab === 'siembra' && (
          <PlantingPlanner
            data={data}
            planVersion={planVersion}
            setPlanVersion={setPlanVersion}
            onOpenAddLotModal={() => {
              setEditingItem(null);
              setFormData({ bloqueId: data.bloques[0]?.id, contenedorTipo: '27L Coco', planAsociado: 'PLAN1', estado: 'Planificada' });
              setModalType('lot');
            }}
            onOpenEditLotModal={(lote) => openEdit('lot', lote)}
            onDeleteLot={handleDeleteLot}
          />
        )}

        {activeTab === 'agua' && (
          <WaterBalance data={data} />
        )}

        {activeTab === 'insumos' && (
          <InventoryManager
            data={data}
            onOpenAddInsumoModal={() => {
              setEditingItem(null);
              setFormData({ categoria: 'Goteros', proveedor: 'Agrodinco', bodega: 0, campo: 0 });
              setModalType('insumo');
            }}
            onOpenEditInsumoModal={(insumo) => openEdit('insumo', insumo)}
            onDeleteInsumo={handleDeleteInsumo}
          />
        )}

        {activeTab === 'costos' && (
          <FinancialCosts
            data={data}
            onToggleCostStatus={handleToggleCostStatus}
            onOpenAddCostModal={() => {
              setEditingItem(null);
              setFormData({ propietario: 'Agroventure', estadoFlujoCaja: 'PENDIENTE', esCritico: 'false' });
              setModalType('cost');
            }}
            onOpenEditCostModal={(costo) => openEdit('cost', { ...costo, esCritico: String(costo.esCritico) })}
            onDeleteCosto={handleDeleteCosto}
          />
        )}

        {activeTab === 'tareas' && (
          <TimelineTasks
            data={data}
            onToggleTaskStatus={handleToggleTaskStatus}
            onOpenAddTaskModal={() => {
              setEditingItem(null);
              setFormData({ responsable: 'Miller', categoria: 'infraestructura', prioridad: 'media', estado: 'pendiente' });
              setModalType('task');
            }}
            onOpenEditTaskModal={(tarea) => openEdit('task', tarea)}
            onDeleteTarea={handleDeleteTarea}
          />
        )}

        {activeTab === 'informe' && (
          <ReporteGerencia
            data={data}
            planVersion={planVersion}
            helperCalculations={helperCalculations}
          />
        )}

        {activeTab === 'decisiones' && (
          <DecisionsRisks
            data={data}
            onOpenAddDecisionModal={() => {
              setEditingItem(null);
              setFormData({ estado: 'ABIERTA' });
              setModalType('decision');
            }}
            onOpenEditDecisionModal={(dec) => openEdit('decision', dec)}
            onDeleteDecision={handleDeleteDecision}
            onOpenAddRiskModal={() => {
              setEditingItem(null);
              setFormData({ impacto: 'ALTO', probabilidad: 'ALTA', estado: 'ABIERTO' });
              setModalType('risk');
            }}
            onOpenEditRiskModal={(riesgo) => openEdit('risk', riesgo)}
            onDeleteRisk={handleDeleteRisk}
            onToggleRiskStatus={handleToggleRiskStatus}
            onOpenAddTimelineModal={() => {
              setEditingItem(null);
              setFormData({ tipo: 'HITO', estado: 'PENDIENTE' });
              setModalType('timelineEvento');
            }}
            onOpenEditTimelineModal={(ev) => openEditTimeline(ev)}
            onDeleteTimelineEvent={handleDeleteTimelineEvent}
          />
        )}
      </main>

      <footer className="bg-brand-carbon text-white py-4 border-t border-white/10 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agroventure Capital © 2026 — Finca La Esmeralda</span>
          <span className="text-brand-crema-dark">Plan de Siembra (142.000 Plantas)</span>
        </div>
      </footer>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <Modal isOpen={!!modalType} onClose={closeModal} title={modalTitle}>
        <form onSubmit={handleSaveModalForm} className="space-y-3">

          {/* BLOCK FORM */}
          {modalType === 'block' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Nombre / Código del Bloque:</label>
                <input type="text" required value={formData.codigo || ''} onChange={e => setFormData({ ...formData, codigo: e.target.value })} placeholder="Ej. Bloque 10" className="w-full p-2 border border-brand-border rounded focus:outline-none focus:border-brand-verde" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Propietario Infra:</label>
                  <select value={formData.propietarioInfra || 'Agroventure'} onChange={e => setFormData({ ...formData, propietarioInfra: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="Agroventure">Agroventure</option>
                    <option value="Proberries">Proberries</option>
                    <option value="Combinados">Combinados</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Propietario Plantas:</label>
                  <select value={formData.propietarioPlantas || 'Agroventure'} onChange={e => setFormData({ ...formData, propietarioPlantas: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="Agroventure">Agroventure</option>
                    <option value="Proberries">Proberries</option>
                    <option value="Combinados">Combinados</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Área (Ha):</label>
                  <input type="number" step="0.1" value={formData.area || ''} onChange={e => setFormData({ ...formData, area: e.target.value })} placeholder="1.5" className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-emerald-700">Capacidad Plan 1 (27L Coco):</label>
                  <input type="number" required value={formData.capacidadPlan1 || ''} onChange={e => setFormData({ ...formData, capacidadPlan1: e.target.value })} placeholder="Ej. 15000" className="w-full p-2 border border-emerald-300 rounded focus:outline-none focus:border-brand-verde" />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-amber-700">Capacidad Plan 2 (3L Vivero):</label>
                  <input type="number" required value={formData.capacidadPlan2 || ''} onChange={e => setFormData({ ...formData, capacidadPlan2: e.target.value })} placeholder="Ej. 25000" className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:border-brand-ocre" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Consumo Agua Est (m³/día):</label>
                  <input type="number" value={formData.consumoAguaEst || ''} onChange={e => setFormData({ ...formData, consumoAguaEst: e.target.value })} placeholder="20" className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">N° Válvulas:</label>
                  <input type="number" value={formData.valvulas || ''} onChange={e => setFormData({ ...formData, valvulas: e.target.value })} placeholder="5" className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Fecha Disponibilidad:</label>
                <input type="date" value={formData.fechaDisponibilidad || ''} onChange={e => setFormData({ ...formData, fechaDisponibilidad: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Notas / Destino:</label>
                <textarea rows={2} value={formData.destinoNotas || ''} onChange={e => setFormData({ ...formData, destinoNotas: e.target.value })} placeholder="Descripción del uso del bloque..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
            </>
          )}

          {/* LOT FORM */}
          {modalType === 'lot' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Nombre del Lote:</label>
                <input type="text" required value={formData.nombre || ''} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej. Plan 1 – Lote C" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Bloque Asignado:</label>
                  <select value={formData.bloqueId || data.bloques[0]?.id} onChange={e => setFormData({ ...formData, bloqueId: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    {data.bloques.map(b => <option key={b.id} value={b.id}>{b.codigo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Cantidad Plantas:</label>
                  <input type="number" required value={formData.cantidad || ''} onChange={e => setFormData({ ...formData, cantidad: e.target.value })} placeholder="15000" className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Plan Asociado:</label>
                  <select value={formData.planAsociado || 'PLAN1'} onChange={e => setFormData({ ...formData, planAsociado: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="PLAN1">Plan 1 — Definitivo (27L Coco)</option>
                    <option value="PLAN2">Plan 2 — Contingencia (3L Vivero)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tipo de Contenedor:</label>
                  <select value={formData.contenedorTipo || '27L Coco'} onChange={e => setFormData({ ...formData, contenedorTipo: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="27L Coco">27L Coco</option>
                    <option value="3L Sustrato Alt.">3L Sustrato Alt.</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Tipo de Planta:</label>
                  <input type="text" value={formData.tipoPlanta || ''} onChange={e => setFormData({ ...formData, tipoPlanta: e.target.value })} placeholder="Arándano — Bolsa 27L" className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Fecha Planeada:</label>
                  <input type="date" value={formData.fechaPlan || ''} onChange={e => setFormData({ ...formData, fechaPlan: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Estado:</label>
                <select value={formData.estado || 'Planificada'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                  <option value="Planificada">Planificada</option>
                  <option value="En Siembra">En Siembra</option>
                  <option value="Completada">Completada</option>
                  <option value="Pausada">Pausada</option>
                </select>
              </div>
            </>
          )}

          {/* INSUMO FORM */}
          {modalType === 'insumo' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Nombre del Insumo:</label>
                <input type="text" required value={formData.nombre || ''} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej. Goteros 2.0 L/h" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Categoría:</label>
                  <select value={formData.categoria || 'Goteros'} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="Contenedores & Sustrato">Contenedores & Sustrato</option>
                    <option value="Sustrato">Sustrato</option>
                    <option value="Goteros">Goteros</option>
                    <option value="Líneas">Líneas</option>
                    <option value="Bigotes">Bigotes</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Unidad de Medida:</label>
                  <input type="text" value={formData.unidad || ''} onChange={e => setFormData({ ...formData, unidad: e.target.value })} placeholder="unidades / bolsas / m³ / rollos" className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">En Bodega:</label>
                  <input type="number" value={formData.bodega ?? 0} onChange={e => setFormData({ ...formData, bodega: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">En Campo:</label>
                  <input type="number" value={formData.campo ?? 0} onChange={e => setFormData({ ...formData, campo: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Requerido Total:</label>
                  <input type="number" required value={formData.requerido || ''} onChange={e => setFormData({ ...formData, requerido: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Proveedor:</label>
                  <input type="text" value={formData.proveedor || ''} onChange={e => setFormData({ ...formData, proveedor: e.target.value })} placeholder="Agrodinco / INEP / Miller" className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Costo Unitario (COP):</label>
                  <input type="number" value={formData.costoUnitarioEst || ''} onChange={e => setFormData({ ...formData, costoUnitarioEst: e.target.value })} placeholder="45000" className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
            </>
          )}

          {/* COST FORM */}
          {modalType === 'cost' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Concepto del Costo:</label>
                <input type="text" required value={formData.concepto || ''} onChange={e => setFormData({ ...formData, concepto: e.target.value })} placeholder="Ej. Adquisición Válvulas Extra" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Centro de Costos:</label>
                  <input type="text" value={formData.centroCosto || ''} onChange={e => setFormData({ ...formData, centroCosto: e.target.value })} placeholder="Bloque 7A" className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Bloque Asociado:</label>
                  <select value={formData.bloqueId || 'b2'} onChange={e => setFormData({ ...formData, bloqueId: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    {data.bloques.map(b => <option key={b.id} value={b.id}>{b.codigo}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Propietario:</label>
                  <select value={formData.propietario || 'Agroventure'} onChange={e => setFormData({ ...formData, propietario: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="Agroventure">Agroventure</option>
                    <option value="Proberries">Proberries</option>
                    <option value="Agroventure / Proberries">Agroventure / Proberries</option>
                    <option value="Combinados">Combinados</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Monto (COP):</label>
                  <input type="number" required value={formData.montoCOP || ''} onChange={e => setFormData({ ...formData, montoCOP: e.target.value })} placeholder="5000000" className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Estado en Flujo de Caja:</label>
                  <select value={formData.estadoFlujoCaja || 'PENDIENTE'} onChange={e => setFormData({ ...formData, estadoFlujoCaja: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="PENDIENTE">PENDIENTE (Avisar a Tesorería)</option>
                    <option value="AVISADO">AVISADO (En presupuesto)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">¿Es Crítico?</label>
                  <select value={String(formData.esCritico)} onChange={e => setFormData({ ...formData, esCritico: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="true">Sí — Crítico</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Notas:</label>
                <textarea rows={2} value={formData.notas || ''} onChange={e => setFormData({ ...formData, notas: e.target.value })} placeholder="Observaciones adicionales..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
            </>
          )}

          {/* TASK FORM */}
          {modalType === 'task' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Descripción de la Tarea:</label>
                <input type="text" required value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Ej. Verificar presión de tubería Bloque 2" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Responsable:</label>
                  <input type="text" required value={formData.responsable || ''} onChange={e => setFormData({ ...formData, responsable: e.target.value })} placeholder="Miller / Paolo / Campo" className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Fecha Límite:</label>
                  <input type="date" required value={formData.fechaLimite || ''} onChange={e => setFormData({ ...formData, fechaLimite: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Bloque:</label>
                  <select value={formData.bloqueId || 'b2'} onChange={e => setFormData({ ...formData, bloqueId: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    {data.bloques.map(b => <option key={b.id} value={b.id}>{b.codigo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Categoría:</label>
                  <select value={formData.categoria || 'infraestructura'} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="infraestructura">Infraestructura</option>
                    <option value="insumos">Insumos</option>
                    <option value="agua">Agua</option>
                    <option value="costos">Costos</option>
                    <option value="sustrato">Sustrato</option>
                    <option value="decision">Decisión</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Prioridad:</label>
                  <select value={formData.prioridad || 'media'} onChange={e => setFormData({ ...formData, prioridad: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="alta">Alta / Urgente</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Estado:</label>
                  <select value={formData.estado || 'pendiente'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="pendiente">Pendiente</option>
                    <option value="en_curso">En Curso</option>
                    <option value="hecha">Hecha</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* DECISION FORM */}
          {modalType === 'decision' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Título de la Decisión:</label>
                <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ej. Selección de proveedor de sustrato" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Descripción:</label>
                <textarea rows={3} value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Contexto y detalles de la decisión..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Responsable:</label>
                  <input type="text" required value={formData.responsable || ''} onChange={e => setFormData({ ...formData, responsable: e.target.value })} placeholder="Gerencia / Compras..." className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Fecha de Vencimiento:</label>
                  <input type="date" required value={formData.vencimiento || ''} onChange={e => setFormData({ ...formData, vencimiento: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Plan de Contingencia:</label>
                <textarea rows={2} value={formData.planContingencia || ''} onChange={e => setFormData({ ...formData, planContingencia: e.target.value })} placeholder="Si no se resuelve, se activará..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Estado:</label>
                <select value={formData.estado || 'ABIERTA'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                  <option value="ABIERTA">ABIERTA</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="RESUELTA">RESUELTA</option>
                </select>
              </div>
            </>
          )}

          {/* RISK FORM */}
          {modalType === 'risk' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Título del Riesgo:</label>
                <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ej. Retraso en entrega de insumos" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Descripción:</label>
                <textarea rows={2} value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Detalle del riesgo identificado..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Impacto:</label>
                  <select value={formData.impacto || 'ALTO'} onChange={e => setFormData({ ...formData, impacto: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="ALTO">ALTO</option>
                    <option value="MEDIO">MEDIO</option>
                    <option value="BAJO">BAJO</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Probabilidad:</label>
                  <select value={formData.probabilidad || 'ALTA'} onChange={e => setFormData({ ...formData, probabilidad: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="BAJA">BAJA</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Estado:</label>
                  <select value={formData.estado || 'ABIERTO'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="ABIERTO">ABIERTO</option>
                    <option value="EN_MITIGACION">EN MITIGACIÓN</option>
                    <option value="MITIGADO">MITIGADO</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Responsable:</label>
                <input type="text" required value={formData.responsable || ''} onChange={e => setFormData({ ...formData, responsable: e.target.value })} placeholder="Logística / Tesorería / Miller..." className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Acción de Mitigación:</label>
                <textarea rows={2} value={formData.mitigacion || ''} onChange={e => setFormData({ ...formData, mitigacion: e.target.value })} placeholder="Acciones para reducir o eliminar el riesgo..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
            </>
          )}

          {/* TIMELINE EVENT FORM */}
          {modalType === 'timelineEvento' && (
            <>
              <div>
                <label className="font-semibold block mb-1">Título del Evento:</label>
                <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ej. Llegada de bolsas con sustrato" className="w-full p-2 border border-brand-border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Descripción:</label>
                <textarea rows={3} value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Detalle del hito, alerta o acción de compra..." className="w-full p-2 border border-brand-border rounded resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Tipo:</label>
                  <select value={formData.tipo || 'HITO'} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                    <option value="HITO">Hito (Llegada)</option>
                    <option value="ALERTA">Alerta (Déficit)</option>
                    <option value="COMPRA">Acción de Compra</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Semana (opcional):</label>
                  <input type="number" value={formData.semana ?? ''} onChange={e => setFormData({ ...formData, semana: e.target.value })} placeholder="Ej. 31" className="w-full p-2 border border-brand-border rounded" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Fecha (opcional):</label>
                  <input type="date" value={formData.fecha || ''} onChange={e => setFormData({ ...formData, fecha: e.target.value })} className="w-full p-2 border border-brand-border rounded" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Estado:</label>
                <select value={formData.estado || 'PENDIENTE'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="w-full p-2 border border-brand-border rounded">
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="RESUELTO">RESUELTO</option>
                </select>
              </div>
              <div className="pt-2 border-t border-brand-border">
                <label className="font-semibold block mb-2 text-brand-carbon-muted">Métricas destacadas (opcional, máx. 3):</label>
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="grid grid-cols-2 gap-2">
                      <input type="text" value={formData[`m${n}Label`] || ''} onChange={e => setFormData({ ...formData, [`m${n}Label`]: e.target.value })} placeholder={`Etiqueta métrica ${n} (Ej. Total llegada)`} className="w-full p-2 border border-brand-border rounded text-sm" />
                      <input type="text" value={formData[`m${n}Valor`] || ''} onChange={e => setFormData({ ...formData, [`m${n}Valor`]: e.target.value })} placeholder="Valor (Ej. 29.936 bolsas)" className="w-full p-2 border border-brand-border rounded text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-brand-border">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
