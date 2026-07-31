import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  FileText, Download, Sprout, Droplets, DollarSign,
  AlertTriangle, CheckCircle2, Clock, Package,
  ShieldAlert, Lightbulb, Boxes, TrendingUp, XCircle,
  RefreshCw, Flag, Target
} from 'lucide-react';
import { getGroupPct, getBlockPct, isBlockReady, getPendientes, ESTADO_COLORS, ESTADO_LABELS } from '../utils/checklist';
import TimelineSustrato from './TimelineSustrato';

export default function ReporteGerencia({ data, planVersion, helperCalculations }) {
  const reportRef = useRef(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingLegacy, setGeneratingLegacy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Actualiza el timestamp cada vez que cambien los datos
  useEffect(() => {
    setLastUpdated(new Date());
  }, [data]);

  const fechaInforme = lastUpdated.toLocaleDateString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  const horaInforme = lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const { meta, planRiego, costos, tareas, decisiones, riesgos, siembras, insumos, bloques, sustrato } = data;

  const p1 = planRiego?.plan1 || {};
  const p2 = planRiego?.plan2 || {};
  const fmtNum = (n) => (n ?? 0).toLocaleString('es-CO');
  const fmtCOP = (v) => `$${((v || 0) / 1000000).toFixed(1)} M`;
  const fmtCOPFull = (v) => `$${(v || 0).toLocaleString('es-CO')} COP`;

  // ── Cálculos derivados (se recalculan con cada cambio de data) ────────────
  const calc = useMemo(() => {
    // Bloques
    const totalBloques = bloques.length;
    const bloqueStats = bloques.map(b => {
      const pct = getBlockPct(b);
      const grupos = (b.infraestructura?.grupos || []).map(g => ({ ...g, pct: getGroupPct(g) }));
      const pendientes = getPendientes(b);
      return { ...b, pct, grupos, pendientes, isReady: isBlockReady(b) };
    });
    const bloquesListos = bloqueStats.filter(b => b.isReady).length;
    const bloquesConAlerta = bloqueStats.filter(b => !b.isReady);
    const avancePromedioBloques = totalBloques > 0
      ? Math.round(bloqueStats.reduce((s, b) => s + b.pct, 0) / totalBloques)
      : 0;

    // Siembra
    const total27L = siembras.filter(s => s.planAsociado === 'PLAN1' || s.contenedorTipo === '27L Coco')
      .reduce((sum, s) => sum + (s.cantidad || 0), 0);
    const total3L = siembras.filter(s => s.planAsociado === 'PLAN2' || s.contenedorTipo === '3L Sustrato Alt.')
      .reduce((sum, s) => sum + (s.cantidad || 0), 0);
    const pct27L = meta.plan1Objetivo > 0 ? Math.min(100, Math.round((total27L / meta.plan1Objetivo) * 100)) : 0;
    const pct3L = meta.plan2Objetivo > 0 ? Math.min(100, Math.round((total3L / meta.plan2Objetivo) * 100)) : 0;

    // Capacidad total bloques por plan
    const capP1Total = bloques.reduce((s, b) => s + (b.capacidadPlan1 || 0), 0);
    const capP2Total = bloques.reduce((s, b) => s + (b.capacidadPlan2 || 0), 0);

    // Hídrico
    const peakP1 = (p1.lavadoM3Dia || 0) + (p1.riegoM3Dia || 0);
    const peakP2 = p2.riegoM3Dia || 0;
    const peakCombinado = peakP1 + peakP2;
    const margen = (meta.capacidadHidricaDiaria || 180) - peakCombinado;
    const consumoBloquesRegistrado = bloques.reduce((s, b) => s + (b.consumoAguaEst || 0), 0);

    // Costos
    const totalCostos = costos.reduce((s, c) => s + (c.montoCOP || 0), 0);
    const costosPendientes = costos.filter(c => c.estadoFlujoCaja === 'PENDIENTE').reduce((s, c) => s + (c.montoCOP || 0), 0);
    const costosAvisados = costos.filter(c => c.estadoFlujoCaja === 'AVISADO').reduce((s, c) => s + (c.montoCOP || 0), 0);
    const costosCriticos = costos.filter(c => c.esCritico && c.estadoFlujoCaja === 'PENDIENTE');

    // Insumos
    const insumosConFaltante = insumos.filter(i => {
      const disponible = (i.bodega || 0) + (i.campo || 0);
      return disponible < (i.requerido || 0);
    });
    const insumosOk = insumos.filter(i => {
      const disponible = (i.bodega || 0) + (i.campo || 0);
      return disponible >= (i.requerido || 0);
    });

    // Tareas
    const tareasPendientes = tareas.filter(t => t.estado !== 'hecha');
    const tareasAlta = tareasPendientes.filter(t => t.prioridad === 'alta');

    // Decisiones & Riesgos
    const decisAbiertas = decisiones.filter(d => d.estado !== 'RESUELTA');
    const riesgosAbiertos = riesgos.filter(r => r.estado === 'ABIERTO');
    const riesgosAlto = riesgosAbiertos.filter(r => r.impacto === 'ALTO');

    // Sustrato Plan 1
    const bolsasDisp = meta.bolsas27LDisponibles || 7686;
    const bolsasReq = meta.plan1Objetivo || 32000;
    const bolsasFaltantes = bolsasReq - bolsasDisp;
    const pctBolsas = Math.round((bolsasDisp / bolsasReq) * 100);

    return {
      totalBloques, bloquesListos, bloquesConAlerta, bloqueStats, avancePromedioBloques,
      total27L, total3L, pct27L, pct3L, capP1Total, capP2Total,
      peakP1, peakP2, peakCombinado, margen, consumoBloquesRegistrado,
      totalCostos, costosPendientes, costosAvisados, costosCriticos,
      insumosConFaltante, insumosOk,
      tareasPendientes, tareasAlta,
      decisAbiertas, riesgosAbiertos, riesgosAlto,
      bolsasDisp, bolsasReq, bolsasFaltantes, pctBolsas
    };
  }, [data]);

  // ── Alertas críticas ──────────────────────────────────────────────────────
  const alertasCriticas = useMemo(() => {
    const alerts = [];
    if (calc.bloquesConAlerta.length > 0)
      alerts.push({ tipo: 'infra', msg: `${calc.bloquesConAlerta.length} bloque(s) sin infraestructura completa para siembra`, nivel: 'alto' });
    if (calc.bolsasFaltantes > 0)
      alerts.push({ tipo: 'sustrato', msg: `Déficit de ${fmtNum(calc.bolsasFaltantes)} bolsas 27L — solo ${calc.pctBolsas}% del Plan 1 tiene sustrato`, nivel: 'alto' });
    if (calc.margen < 20)
      alerts.push({ tipo: 'agua', msg: `Margen hídrico ajustado: solo ${calc.margen.toFixed(1)} m³/día de reserva en pico`, nivel: calc.margen < 0 ? 'critico' : 'medio' });
    if (calc.costosCriticos.length > 0)
      alerts.push({ tipo: 'costos', msg: `${calc.costosCriticos.length} costo(s) críticos PENDIENTES de avisar a tesorería`, nivel: 'alto' });
    if (calc.riesgosAlto.length > 0)
      alerts.push({ tipo: 'riesgos', msg: `${calc.riesgosAlto.length} riesgo(s) de impacto ALTO abiertos`, nivel: 'alto' });
    return alerts;
  }, [calc]);

  // ── Próximos pasos priorizados (derivados de los datos) ───────────────────
  const proximosPasos = useMemo(() => {
    const pasos = [];
    if (calc.bolsasFaltantes > 0) {
      pasos.push({
        prioridad: 'ALTA',
        texto: 'Gestionar la compra de 56.314 bolsas y 24.314 unidades de sustrato (656.478 L de coco) antes de la Semana 33 — es la ruta crítica del Plan 1.',
        resp: 'Compras / Gerencia'
      });
    }
    pasos.push({
      prioridad: 'ALTA',
      texto: 'Coordinar el embolsado de las 32.000 unidades de sustrato que llegan SIN bolsa en la Semana 34 y gestionar la liberación del material retenido en Chocontá (MD).',
      resp: 'Logística'
    });
    if (calc.bloquesConAlerta.length > 0) {
      pasos.push({
        prioridad: 'ALTA',
        texto: `Completar la infraestructura de los ${calc.bloquesConAlerta.length} bloque(s) en adecuación (avance promedio ${calc.avancePromedioBloques}%); priorizar Estructuras, Riostras y Antiheladas.`,
        resp: 'Campo / Infraestructura'
      });
    }
    if (calc.costosCriticos.length > 0) {
      pasos.push({
        prioridad: 'MEDIA',
        texto: `Notificar a Tesorería los ${calc.costosCriticos.length} costo(s) críticos pendientes (${fmtCOP(calc.costosPendientes)} COP) para no descalzar el flujo de caja.`,
        resp: 'Financiera / Tesorería'
      });
    }
    if (calc.decisAbiertas.length > 0) {
      pasos.push({
        prioridad: 'MEDIA',
        texto: `Resolver la(s) ${calc.decisAbiertas.length} decisión(es) abierta(s) antes de su fecha de vencimiento.`,
        resp: 'Gerencia General'
      });
    }
    if ((calc.total27L + calc.total3L) === 0) {
      pasos.push({
        prioridad: 'MEDIA',
        texto: 'Cargar en el sistema la programación de lotes de siembra por bloque para habilitar el seguimiento de avance vs. meta.',
        resp: 'Planeación'
      });
    }
    return pasos;
  }, [calc]);

  // ── Generación de PDF vectorial (texto real, nítido y paginado) ───────────
  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const { generateReportePDF } = await import('../utils/pdfReport');
      await generateReportePDF({ data, calc, proximosPasos, alertasCriticas, fechaInforme, horaInforme });
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF. Intente de nuevo.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ── Generación de PDF antiguo (rasterizado del HTML) — solo para comparar ──
  const handleDownloadPDFLegacy = async () => {
    setGeneratingLegacy(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = reportRef.current;
      const filename = `Informe_Gerencia_FORMATO_ANTERIOR_${new Date().toISOString().slice(0, 10)}.pdf`;
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] }
      }).from(element).save();
    } catch (err) {
      console.error('Error generando PDF (formato anterior):', err);
      alert('Error al generar el PDF. Intente de nuevo.');
    } finally {
      setGeneratingLegacy(false);
    }
  };

  // ── Helpers de color ──────────────────────────────────────────────────────
  const semaforo = (pct) =>
    pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const semaforoText = (pct) =>
    pct === 100 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-red-700';
  const semaforoBg = (pct) =>
    pct === 100 ? 'bg-emerald-50 border-emerald-200' : pct >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  // ══════════════════════════════════════════════════════════════════════════
  //  SECCIONES DEL INFORME (definidas como consts para controlar el orden)
  // ══════════════════════════════════════════════════════════════════════════

  // ── 1. El Plan — Objetivo de Siembra Dual ─────────────────────────────────
  const secPlan = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-brand-verde">
        <div className="w-6 h-6 rounded-full bg-brand-verde flex items-center justify-center flex-shrink-0">
          <Target className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          1. El Plan — Objetivo de Siembra Dual
        </h2>
      </div>

      <p className="text-xs text-brand-carbon-muted mb-4 leading-relaxed">
        El proyecto busca sembrar <strong className="text-brand-carbon">{fmtNum(meta.totalPlantasObjetivo)} plantas de arándano</strong> bajo
        una estrategia de doble densidad: el <strong className="text-emerald-700">Plan 1 (definitivo, bolsa 27L con sustrato de coco)</strong> para
        {' '}{fmtNum(meta.plan1Objetivo)} plantas, y el <strong className="text-amber-700">Plan 2 (contingencia, bolsa 3L de vivero)</strong> para
        {' '}{fmtNum(meta.plan2Objetivo)} plantas. Ambos planes son independientes y comparten la infraestructura de los bloques.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Plan 1 */}
        <div className="border-2 border-emerald-400 rounded-xl overflow-hidden">
          <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-sm">Plan 1 — Bolsa 27L Coco (Definitivo)</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">{calc.pct27L}% prog.</span>
          </div>
          <div className="p-4 space-y-3 text-xs bg-emerald-50/30">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border border-emerald-200">
                <span className="text-gray-500 text-[10px] uppercase block">Meta</span>
                <strong className="text-emerald-800">{fmtNum(meta.plan1Objetivo)} plantas</strong>
              </div>
              <div className="p-2 bg-white rounded border border-emerald-200">
                <span className="text-gray-500 text-[10px] uppercase block">Programadas</span>
                <strong className="text-emerald-800">{fmtNum(calc.total27L)} plantas</strong>
              </div>
              <div className="p-2 bg-white rounded border border-amber-200">
                <span className="text-gray-500 text-[10px] uppercase block">Bolsas disponibles</span>
                <strong className="text-amber-800">{fmtNum(calc.bolsasDisp)} / {fmtNum(calc.bolsasReq)}</strong>
              </div>
              <div className="p-2 bg-white rounded border border-red-200">
                <span className="text-gray-500 text-[10px] uppercase block">Déficit bolsas</span>
                <strong className="text-red-700">{fmtNum(calc.bolsasFaltantes)}</strong>
              </div>
              <div className="p-2 bg-white rounded border border-emerald-200">
                <span className="text-gray-500 text-[10px] uppercase block">Cap. total bloques</span>
                <strong className="text-emerald-800">{fmtNum(calc.capP1Total)} pl.</strong>
              </div>
              <div className="p-2 bg-white rounded border border-emerald-200">
                <span className="text-gray-500 text-[10px] uppercase block">Precio siembra</span>
                <strong className="text-emerald-800">${fmtNum(meta.plan1PrecioPorPlanta)}/pl.</strong>
              </div>
            </div>
            {/* Progreso */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Avance programación</span><span>{calc.pct27L}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calc.pct27L}%` }}></div>
              </div>
            </div>
            {/* Riego */}
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Riego Primeras 4 Semanas</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-blue-900">
                <span>Riego: <strong>{p1.riegoM3Dia} m³/día</strong></span>
                <span>Lavado: <strong>{p1.lavadoM3Dia} m³/día (días 1-12)</strong></span>
                <span className="col-span-2">Pico máx: <strong>{(p1.lavadoM3Dia + p1.riegoM3Dia).toFixed(1)} m³/día</strong></span>
              </div>
            </div>
            {/* Nota sustrato */}
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-[10px] text-amber-900">
              <strong>⚠ Premisa sustrato:</strong> Solo 7.686 bolsas disponibles ({calc.pctBolsas}%). Ver ruta crítica de abastecimiento (sección 3).
            </div>
          </div>
        </div>

        {/* Plan 2 */}
        <div className="border-2 border-amber-400 rounded-xl overflow-hidden">
          <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-sm">Plan 2 — Bolsa 3L Vivero (Contingencia)</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">{calc.pct3L}% prog.</span>
          </div>
          <div className="p-4 space-y-3 text-xs bg-amber-50/20">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border border-amber-200">
                <span className="text-gray-500 text-[10px] uppercase block">Meta</span>
                <strong className="text-amber-800">{fmtNum(meta.plan2Objetivo)} plantas</strong>
              </div>
              <div className="p-2 bg-white rounded border border-amber-200">
                <span className="text-gray-500 text-[10px] uppercase block">Programadas</span>
                <strong className="text-amber-800">{fmtNum(calc.total3L)} plantas</strong>
              </div>
              <div className="p-2 bg-white rounded border border-amber-200">
                <span className="text-gray-500 text-[10px] uppercase block">Cap. total bloques</span>
                <strong className="text-amber-800">{fmtNum(calc.capP2Total)} pl.</strong>
              </div>
              <div className="p-2 bg-white rounded border border-amber-200">
                <span className="text-gray-500 text-[10px] uppercase block">Precio siembra</span>
                <strong className="text-amber-800">${fmtNum(meta.plan2PrecioPorPlanta)}/pl.</strong>
              </div>
              <div className="col-span-2 p-2 bg-white rounded border border-amber-200">
                <span className="text-gray-500 text-[10px] uppercase block">Faltante para meta</span>
                <strong className="text-red-700">{fmtNum(Math.max(0, meta.plan2Objetivo - calc.total3L))} plantas</strong>
              </div>
            </div>
            {/* Progreso */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Avance programación</span><span>{calc.pct3L}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${calc.pct3L}%` }}></div>
              </div>
            </div>
            {/* Riego */}
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Riego Primeras 4 Semanas</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-blue-900">
                <span>Riego: <strong>{p2.riegoM3Dia} m³/día</strong></span>
                <span>Sin lavado de sustrato</span>
                <span className="col-span-2">Total 4 semanas: <strong>{((p2.riegoM3Dia || 0) * 28).toFixed(0)} m³</strong></span>
              </div>
            </div>
            {/* Lotes */}
            {siembras.filter(s => s.planAsociado === 'PLAN2').length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Lotes programados:</span>
                {siembras.filter(s => s.planAsociado === 'PLAN2').map(l => {
                  const b = bloques.find(b => b.id === l.bloqueId);
                  return (
                    <div key={l.id} className="flex justify-between text-[10px] text-gray-700 py-0.5 border-b border-gray-100">
                      <span>{l.nombre} · {b?.codigo}</span>
                      <strong>{fmtNum(l.cantidad)} pl.</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // ── 2. Estado de Ejecución — Bloques e Infraestructura ────────────────────
  const secBloques = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-slate-700">
        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <Boxes className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          2. Estado de Ejecución — Bloques e Infraestructura
        </h2>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-gray-500 block text-[10px] uppercase">Registrados</span>
          <strong className="text-2xl font-display text-brand-carbon">{calc.totalBloques}</strong>
          <span className="text-gray-400 block">bloques</span>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <span className="text-gray-500 block text-[10px] uppercase">Avance prom.</span>
          <strong className="text-2xl font-display text-blue-700">{calc.avancePromedioBloques}%</strong>
          <span className="text-blue-600 block">ejecución</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <span className="text-gray-500 block text-[10px] uppercase">100% Listos</span>
          <strong className="text-2xl font-display text-emerald-700">{calc.bloquesListos}</strong>
          <span className="text-emerald-600 block">para siembra</span>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <span className="text-gray-500 block text-[10px] uppercase">Con Pendientes</span>
          <strong className="text-2xl font-display text-red-700">{calc.bloquesConAlerta.length}</strong>
          <span className="text-red-600 block">en adecuación</span>
        </div>
      </div>

      {/* Ficha por bloque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {calc.bloqueStats.map(b => (
          <div key={b.id} className={`rounded-xl border p-4 text-xs space-y-3 ${semaforoBg(b.pct)}`}>
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-brand-carbon">{b.codigo}</span>
              <span className={`font-extrabold text-sm ${semaforoText(b.pct)}`}>
                {b.isReady ? '✓ LISTO' : `${b.pct}% avance`}
              </span>
            </div>

            {/* Barra */}
            <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden border border-white">
              <div className={`h-full ${semaforo(b.pct)}`} style={{ width: `${b.pct}%` }}></div>
            </div>

            {/* Capacidad dual */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white/70 rounded p-1.5 border border-emerald-200/60">
                <span className="text-[9px] uppercase text-emerald-700 font-bold block">Cap. Plan 1</span>
                <strong className="text-emerald-900">{fmtNum(b.capacidadPlan1 || 0)} pl.</strong>
              </div>
              <div className="bg-white/70 rounded p-1.5 border border-amber-200/60">
                <span className="text-[9px] uppercase text-amber-700 font-bold block">Cap. Plan 2</span>
                <strong className="text-amber-900">{fmtNum(b.capacidadPlan2 || 0)} pl.</strong>
              </div>
            </div>

            {/* Grupos de checklist (trazabilidad) */}
            {b.grupos.map(grupo => {
              const pendientesGrupo = grupo.items.filter(i => (i.pct || 0) < 100);
              return (
                <div key={grupo.nombre} className="bg-white/70 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">{grupo.nombre}</span>
                    <span className={`text-[10px] font-bold ${semaforoText(grupo.pct)}`}>{grupo.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div className={`h-full ${semaforo(grupo.pct)}`} style={{ width: `${grupo.pct}%` }}></div>
                  </div>
                  {pendientesGrupo.length === 0 ? (
                    <p className="text-[10px] text-emerald-700 font-semibold">✓ Todos los ítems culminados</p>
                  ) : (
                    <div className="space-y-0.5">
                      {pendientesGrupo.map(item => (
                        <div key={item.nombre} className="flex items-start justify-between gap-2 text-[10px]">
                          <span className="text-gray-600 flex-1">
                            {item.nombre}
                            {item.nota && <span className="text-gray-400 italic"> — {item.nota}</span>}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${ESTADO_COLORS[item.estado]?.bg} ${ESTADO_COLORS[item.estado]?.text}`}>
                            {item.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {b.propietarioInfra && (
              <div className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200/60">
                <span>Infra: <strong className="text-gray-700">{b.propietarioInfra}</strong></span>
                <span>Riego est.: <strong className="text-blue-700">{b.consumoAguaEst} m³/día</strong></span>
              </div>
            )}
          </div>
        ))}
        {calc.totalBloques === 0 && (
          <div className="col-span-2 text-center text-xs text-gray-400 py-6 bg-gray-50 rounded-lg border">
            No hay bloques registrados.
          </div>
        )}
      </div>
    </section>
  );

  // ── 3. Ruta Crítica — Abastecimiento de Sustrato y Bolsas ─────────────────
  const secTimeline = data.cronologiaSustrato?.length > 0 ? (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          3. Ruta Crítica — Abastecimiento de Sustrato y Bolsas
        </h2>
      </div>
      <p className="text-xs text-brand-carbon-muted mb-4 leading-relaxed">
        El abastecimiento de sustrato es la <strong className="text-brand-carbon">principal restricción del Plan 1</strong>: hoy
        solo se cuenta con {fmtNum(calc.bolsasDisp)} de {fmtNum(calc.bolsasReq)} bolsas ({calc.pctBolsas}%). La siguiente línea de
        tiempo resume las llegadas y la compra pendiente.
      </p>
      <TimelineSustrato eventos={data.cronologiaSustrato} compact />
    </section>
  ) : null;

  // ── 4. Insumos & Sustrato ─────────────────────────────────────────────────
  const secInsumos = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-purple-500">
        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          4. Insumos & Sustrato
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-gray-500 text-[10px] uppercase block">Total insumos</span>
          <strong className="text-2xl font-display text-brand-carbon">{insumos.length}</strong>
          <span className="text-gray-400 block">registrados</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <span className="text-gray-500 text-[10px] uppercase block">Stock suficiente</span>
          <strong className="text-2xl font-display text-emerald-700">{calc.insumosOk.length}</strong>
          <span className="text-emerald-600 block">insumos</span>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <span className="text-gray-500 text-[10px] uppercase block">Con faltante</span>
          <strong className="text-2xl font-display text-red-700">{calc.insumosConFaltante.length}</strong>
          <span className="text-red-600 block">insumos</span>
        </div>
      </div>

      {insumos.length > 0 ? (
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="p-2">Insumo</th>
              <th className="p-2">Categoría</th>
              <th className="p-2 text-right">Disponible</th>
              <th className="p-2 text-right">Requerido</th>
              <th className="p-2 text-right">Faltante</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {insumos.map(i => {
              const disp = (i.bodega || 0) + (i.campo || 0);
              const falta = Math.max(0, (i.requerido || 0) - disp);
              const ok = falta === 0;
              return (
                <tr key={i.id} className={!ok ? 'bg-red-50/40' : ''}>
                  <td className="p-2 font-semibold text-brand-carbon">{i.nombre}</td>
                  <td className="p-2 text-gray-500">{i.categoria}</td>
                  <td className="p-2 text-right text-brand-carbon">{fmtNum(disp)} {i.unidad}</td>
                  <td className="p-2 text-right text-gray-500">{fmtNum(i.requerido)} {i.unidad}</td>
                  <td className={`p-2 text-right font-bold ${ok ? 'text-emerald-600' : 'text-red-600'}`}>{ok ? '–' : fmtNum(falta)}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {ok ? 'OK' : 'FALTANTE'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Sin insumos registrados.</p>
      )}
    </section>
  );

  // ── 5. Balance Hídrico ────────────────────────────────────────────────────
  const secHidrico = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          5. Balance Hídrico
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Tabla */}
        <div className="md:col-span-2">
          <table className="w-full text-left">
            <thead className="bg-blue-50 text-blue-900 text-[10px] uppercase font-bold border-b border-blue-200">
              <tr>
                <th className="p-2">Concepto</th>
                <th className="p-2 text-right">m³/día</th>
                <th className="p-2 text-right">% de cap.</th>
                <th className="p-2">Periodo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { label: 'Riego Plan 1 (600 cc × 32.000 pl.)', m3: p1.riegoM3Dia || 0, periodo: 'Semanas 1–4', color: 'text-emerald-700' },
                { label: 'Lavado sustrato Plan 1 (1.85 L × 32.000 pl.)', m3: p1.lavadoM3Dia || 0, periodo: 'Días 1–12', color: 'text-amber-700' },
                { label: 'Riego Plan 2 (600 cc × 110.000 pl.)', m3: p2.riegoM3Dia || 0, periodo: 'Semanas 1–4', color: 'text-orange-700' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/30">
                  <td className="p-2 text-gray-700">{r.label}</td>
                  <td className={`p-2 text-right font-bold ${r.color}`}>{r.m3.toFixed(1)}</td>
                  <td className="p-2 text-right text-gray-500">{Math.round(r.m3 / (meta.capacidadHidricaDiaria || 180) * 100)}%</td>
                  <td className="p-2 text-gray-400">{r.periodo}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td className="p-2">Pico máximo combinado (días 1–12)</td>
                <td className="p-2 text-right text-brand-carbon">{calc.peakCombinado.toFixed(1)}</td>
                <td className="p-2 text-right text-brand-carbon">{Math.round(calc.peakCombinado / (meta.capacidadHidricaDiaria || 180) * 100)}%</td>
                <td className="p-2 text-gray-400">Fase crítica</td>
              </tr>
              <tr className={`font-bold ${calc.margen >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                <td className="p-2">Margen disponible</td>
                <td className="p-2 text-right">{calc.margen.toFixed(1)}</td>
                <td className="p-2 text-right">{Math.round(calc.margen / (meta.capacidadHidricaDiaria || 180) * 100)}%</td>
                <td className="p-2">{calc.margen >= 0 ? 'OK' : '⚠ DÉFICIT'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Semáforo hídrico */}
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border-2 ${calc.margen >= 20 ? 'bg-emerald-50 border-emerald-400' : calc.margen >= 0 ? 'bg-amber-50 border-amber-400' : 'bg-red-50 border-red-500'}`}>
            {calc.margen >= 0
              ? <CheckCircle2 className={`w-5 h-5 mb-2 ${calc.margen >= 20 ? 'text-emerald-600' : 'text-amber-600'}`} />
              : <AlertTriangle className="w-5 h-5 mb-2 text-red-600" />
            }
            <p className={`font-bold text-sm ${calc.margen >= 20 ? 'text-emerald-800' : calc.margen >= 0 ? 'text-amber-800' : 'text-red-800'}`}>
              {calc.margen >= 20 ? 'Capacidad suficiente' : calc.margen >= 0 ? 'Margen ajustado' : '¡Déficit hídrico!'}
            </p>
            <div className="mt-2 text-[11px] space-y-1 text-gray-600">
              <p>Capacidad: <strong>{meta.capacidadHidricaDiaria} m³/día</strong></p>
              <p>Pico combinado: <strong>{calc.peakCombinado.toFixed(1)} m³/día</strong></p>
              <p>Margen: <strong className={calc.margen >= 0 ? 'text-emerald-700' : 'text-red-700'}>{calc.margen.toFixed(1)} m³/día</strong></p>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900">
            <strong className="block mb-1">Recomendación operativa:</strong>
            Ejecutar lavado de sustrato Plan 1 en <strong>turno nocturno (10 PM – 4 AM)</strong> durante los primeros 12 días para no saturar la red en riego diurno.
          </div>
        </div>
      </div>
    </section>
  );

  // ── 6. Costos & Flujo de Caja ─────────────────────────────────────────────
  const secCostos = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          6. Costos & Flujo de Caja
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-gray-500 text-[10px] uppercase block">Total registrado</span>
          <strong className="text-xl font-display text-brand-carbon">{fmtCOP(calc.totalCostos)}</strong>
          <span className="text-gray-400 block">COP</span>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <span className="text-gray-500 text-[10px] uppercase block">Pendiente avisar</span>
          <strong className="text-xl font-display text-red-700">{fmtCOP(calc.costosPendientes)}</strong>
          <span className="text-red-500 block">a tesorería</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <span className="text-gray-500 text-[10px] uppercase block">Avisado/en presupuesto</span>
          <strong className="text-xl font-display text-emerald-700">{fmtCOP(calc.costosAvisados)}</strong>
          <span className="text-emerald-600 block">en flujo</span>
        </div>
      </div>

      <table className="w-full text-xs text-left">
        <thead className="bg-amber-50 text-[10px] uppercase text-amber-900 font-bold border-b border-amber-200">
          <tr>
            <th className="p-2">Concepto</th>
            <th className="p-2">Propietario</th>
            <th className="p-2 text-right">Monto COP</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {costos.map(c => (
            <tr key={c.id} className={c.esCritico && c.estadoFlujoCaja === 'PENDIENTE' ? 'bg-red-50/50 font-semibold' : ''}>
              <td className="p-2 text-brand-carbon">
                {c.concepto}
                {c.esCritico && <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-red-600 text-white font-extrabold rounded">CRÍTICO</span>}
              </td>
              <td className="p-2 text-gray-500">{c.propietario}</td>
              <td className="p-2 text-right font-bold text-brand-carbon">{fmtCOPFull(c.montoCOP)}</td>
              <td className="p-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.estadoFlujoCaja === 'PENDIENTE' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {c.estadoFlujoCaja}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  // ── 7. Decisiones & Riesgos ───────────────────────────────────────────────
  const secDecisiones = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-red-500">
        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          7. Decisiones & Riesgos
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decisiones */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-brand-carbon uppercase">
              Decisiones Pendientes ({calc.decisAbiertas.length})
            </span>
          </div>
          {calc.decisAbiertas.length > 0 ? calc.decisAbiertas.map(d => (
            <div key={d.id} className="p-3 mb-2 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between gap-2">
                <p className="font-bold text-brand-carbon">{d.titulo}</p>
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded flex-shrink-0">
                  Vence: {d.vencimiento}
                </span>
              </div>
              <p className="text-gray-500">{d.descripcion}</p>
              <p className="text-gray-500">Resp: <strong>{d.responsable}</strong></p>
              {d.planContingencia && (
                <p className="text-emerald-700 italic">{d.planContingencia}</p>
              )}
            </div>
          )) : (
            <p className="text-xs text-emerald-700 p-3 bg-emerald-50 rounded-lg border border-emerald-200">✓ Sin decisiones abiertas.</p>
          )}
        </div>

        {/* Riesgos */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-brand-carbon uppercase">
              Riesgos Abiertos ({calc.riesgosAbiertos.length})
            </span>
          </div>
          {calc.riesgosAbiertos.length > 0 ? calc.riesgosAbiertos.map(r => (
            <div key={r.id} className={`p-3 mb-2 rounded-lg border text-xs space-y-1 ${r.impacto === 'ALTO' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex justify-between gap-2">
                <p className="font-bold text-brand-carbon">{r.titulo}</p>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded flex-shrink-0 text-white ${r.impacto === 'ALTO' ? 'bg-red-600' : 'bg-amber-500'}`}>
                  {r.impacto}
                </span>
              </div>
              <p className="text-gray-500">{r.descripcion}</p>
              <p className="text-gray-500">Resp: <strong>{r.responsable}</strong> · Prob: {r.probabilidad}</p>
              {r.mitigacion && <p className="text-emerald-700 italic">{r.mitigacion}</p>}
            </div>
          )) : (
            <p className="text-xs text-emerald-700 p-3 bg-emerald-50 rounded-lg border border-emerald-200">✓ Sin riesgos críticos abiertos.</p>
          )}
        </div>
      </div>
    </section>
  );

  // ── 8. Conclusiones y Próximos Pasos ──────────────────────────────────────
  const nivelSustrato = calc.pctBolsas >= 80 ? 'ok' : calc.pctBolsas >= 40 ? 'medio' : 'critico';
  const secConclusiones = (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-brand-verde">
        <div className="w-6 h-6 rounded-full bg-brand-verde flex items-center justify-center flex-shrink-0">
          <Flag className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
          8. Conclusiones y Próximos Pasos
        </h2>
      </div>

      {/* Diagnóstico / Síntesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Boxes className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-bold text-brand-carbon uppercase text-[10px]">Ejecución en campo</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Avance físico promedio de <strong className="text-brand-carbon">{calc.avancePromedioBloques}%</strong> en {calc.totalBloques} bloques.
            {calc.bloquesListos > 0 ? ` ${calc.bloquesListos} listo(s) para siembra` : ' Ningún bloque está 100% listo aún'} y {calc.bloquesConAlerta.length} en adecuación.
          </p>
        </div>

        <div className={`p-3 rounded-lg border text-xs ${nivelSustrato === 'ok' ? 'bg-emerald-50 border-emerald-200' : nivelSustrato === 'medio' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Package className={`w-3.5 h-3.5 ${nivelSustrato === 'critico' ? 'text-red-600' : 'text-amber-600'}`} />
            <span className="font-bold text-brand-carbon uppercase text-[10px]">Ruta crítica: sustrato</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Solo el <strong className={nivelSustrato === 'critico' ? 'text-red-700' : 'text-amber-700'}>{calc.pctBolsas}%</strong> del Plan 1 tiene bolsas
            ({fmtNum(calc.bolsasDisp)} de {fmtNum(calc.bolsasReq)}). Faltan comprar 56.314 bolsas y 24.314 unidades de sustrato (656.478 L).
          </p>
        </div>

        <div className="p-3 rounded-lg border bg-amber-50 border-amber-200 text-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold text-brand-carbon uppercase text-[10px]">Compromiso financiero</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Costos totales por <strong className="text-brand-carbon">{fmtCOP(calc.totalCostos)} COP</strong>, de los cuales
            {' '}<strong className="text-red-700">{fmtCOP(calc.costosPendientes)}</strong> están pendientes de avisar a tesorería.
          </p>
        </div>

        <div className={`p-3 rounded-lg border text-xs ${calc.margen >= 20 ? 'bg-emerald-50 border-emerald-200' : calc.margen >= 0 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-brand-carbon uppercase text-[10px]">Viabilidad hídrica</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {calc.margen >= 0
              ? `Capacidad suficiente: el pico combinado (${calc.peakCombinado.toFixed(1)} m³/día) deja ${calc.margen.toFixed(1)} m³/día de margen sobre los ${meta.capacidadHidricaDiaria} m³/día instalados.`
              : `Déficit: el pico combinado (${calc.peakCombinado.toFixed(1)} m³/día) supera la capacidad instalada en ${Math.abs(calc.margen).toFixed(1)} m³/día.`}
            {' '}{calc.decisAbiertas.length} decisión(es) y {calc.riesgosAlto.length} riesgo(s) de impacto alto abiertos.
          </p>
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="rounded-xl border-2 border-brand-verde/40 overflow-hidden">
        <div className="bg-brand-verde text-white px-4 py-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="font-bold text-sm uppercase tracking-wide">Próximos Pasos Priorizados</span>
        </div>
        <div className="divide-y divide-gray-100">
          {proximosPasos.map((paso, i) => (
            <div key={i} className="flex items-start gap-3 p-3 text-xs">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-verde/10 text-brand-verde font-extrabold flex items-center justify-center">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-brand-carbon leading-relaxed">{paso.texto}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Responsable sugerido: <strong className="text-gray-600">{paso.resp}</strong></p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${paso.prioridad === 'ALTA' ? 'bg-red-600 text-white' : 'bg-amber-400 text-white'}`}>
                {paso.prioridad}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="space-y-4">

      {/* ── Barra de control ─────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-brand-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-brand-verde" />
          <div>
            <h2 className="font-display text-xl font-bold text-brand-carbon">Informe de Gerencia General</h2>
            <div className="flex items-center gap-2 text-xs text-brand-carbon-muted">
              <RefreshCw className="w-3 h-3" />
              <span>Actualizado automáticamente · {fechaInforme} {horaInforme}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn-primary gap-2"
          >
            <Download className="w-4 h-4" />
            {generatingPDF ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
          <button
            onClick={handleDownloadPDFLegacy}
            disabled={generatingLegacy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-brand-border text-brand-carbon-muted hover:bg-brand-crema transition-colors"
            title="Genera el PDF con el método anterior (imagen del HTML) para comparar"
          >
            <Download className="w-3.5 h-3.5" />
            {generatingLegacy ? 'Generando...' : 'Formato anterior'}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CONTENIDO DEL INFORME (capturado por html2pdf)
      ══════════════════════════════════════════════════════════════════ */}
      <div ref={reportRef} className="bg-white rounded-xl border border-brand-border overflow-hidden" id="reporte-gerencia">

        {/* ── Portada ───────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-carbon text-white px-8 py-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <img src="/avc_logo.png" alt="Agroventure Capital" className="h-14 w-auto object-contain rounded-lg bg-white p-1" />
              <div>
                <h1 className="font-display text-2xl font-extrabold text-white leading-tight">
                  Informe de Gerencia General
                </h1>
                <p className="text-gray-300 text-sm">Plan de Siembra Arándano — {meta.finca}</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400 flex-shrink-0">
              <p className="font-bold text-white text-sm">{fechaInforme}</p>
              <p>{horaInforme} hrs</p>
              <span className="mt-2 inline-block px-2.5 py-1 bg-brand-verde/30 border border-brand-verde/50 rounded text-brand-verde font-bold text-[10px] uppercase">
                Confidencial
              </span>
            </div>
          </div>

          {/* KPI ejecutivos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Meta Total Plantas', icon: Sprout,
                value: fmtNum(meta.totalPlantasObjetivo),
                sub: `P1: ${fmtNum(meta.plan1Objetivo)} + P2: ${fmtNum(meta.plan2Objetivo)}`,
                color: 'text-emerald-300'
              },
              {
                label: 'Bloques Listos', icon: Boxes,
                value: `${calc.bloquesListos} / ${calc.totalBloques}`,
                sub: calc.totalBloques > 0 ? `Avance promedio ${calc.avancePromedioBloques}%` : 'Sin bloques registrados',
                color: calc.bloquesListos === calc.totalBloques && calc.totalBloques > 0 ? 'text-emerald-300' : 'text-amber-300'
              },
              {
                label: 'Costos Totales', icon: DollarSign,
                value: fmtCOP(calc.totalCostos),
                sub: `Pendientes: ${fmtCOP(calc.costosPendientes)}`,
                color: 'text-amber-300'
              },
              {
                label: 'Balance Hídrico', icon: Droplets,
                value: `${calc.peakCombinado.toFixed(0)} m³/día`,
                sub: `Cap: ${meta.capacidadHidricaDiaria} m³/día · Margen: ${calc.margen.toFixed(1)} m³`,
                color: calc.margen >= 0 ? 'text-blue-300' : 'text-red-300'
              },
            ].map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{k.label}</p>
                  </div>
                  <p className={`font-display text-xl font-extrabold ${k.color}`}>{k.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-8">

          {/* ── Alertas Críticas ──────────────────────────────────────────── */}
          {alertasCriticas.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-red-500">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
                  Alertas Críticas — Requieren Atención Inmediata
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alertasCriticas.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs font-medium ${
                    a.nivel === 'critico' ? 'bg-red-100 border-red-400 text-red-900' :
                    a.nivel === 'alto' ? 'bg-red-50 border-red-300 text-red-800' :
                    'bg-amber-50 border-amber-300 text-amber-800'
                  }`}>
                    <XCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.nivel !== 'medio' ? 'text-red-600' : 'text-amber-600'}`} />
                    <span>{a.msg}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Secuencia lógica ejecutiva: Plan → Ejecución → Ruta crítica →
              Insumos → Agua → Costos → Decisiones/Riesgos → Conclusiones */}
          {secPlan}
          {secBloques}
          {secTimeline}
          {secInsumos}
          {secHidrico}
          {secCostos}
          {secDecisiones}
          {secConclusiones}

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <footer className="pt-4 border-t-2 border-gray-200 mt-4 flex items-center justify-between text-[10px] text-gray-400">
            <div>
              <p className="font-bold text-gray-600">Agroventure Capital — {meta.finca}</p>
              <p>Generado automáticamente · {fechaInforme} {horaInforme} · Uso Interno / Confidencial</p>
            </div>
            <div className="text-right">
              <p>Meta total: <strong className="text-gray-600">{fmtNum(meta.totalPlantasObjetivo)} plantas</strong></p>
              <p>Capacidad hídrica: <strong className="text-gray-600">{meta.capacidadHidricaDiaria} m³/día</strong></p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
