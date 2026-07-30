import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  FileText, Download, Sprout, Droplets, DollarSign,
  AlertTriangle, CheckCircle2, Clock, Package,
  ShieldAlert, Lightbulb, Boxes, TrendingUp, XCircle,
  RefreshCw
} from 'lucide-react';

const infraLabels = {
  techo: 'Techo',
  cubierta: 'Cubierta',
  tuberia: 'Tubería Matriz',
  bigotes: 'Bigotes',
  goteros: 'Goteros',
  lineas: 'Líneas Riego',
  antiheladas: 'Antiheladas'
};

export default function ReporteGerencia({ data, planVersion, helperCalculations }) {
  const reportRef = useRef(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
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
      const keys = b.infraestructura ? Object.keys(b.infraestructura) : [];
      const done = b.infraestructura ? Object.values(b.infraestructura).filter(Boolean).length : 0;
      const pct = keys.length > 0 ? Math.round((done / keys.length) * 100) : 0;
      const faltantes = b.infraestructura
        ? Object.entries(b.infraestructura).filter(([, v]) => !v).map(([k]) => infraLabels[k] || k)
        : [];
      return { ...b, done, total: keys.length, pct, isReady: done === keys.length, faltantes };
    });
    const bloquesListos = bloqueStats.filter(b => b.isReady).length;
    const bloquesConAlerta = bloqueStats.filter(b => !b.isReady);

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
      totalBloques, bloquesListos, bloquesConAlerta, bloqueStats,
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
    if (calc.tareasAlta.length > 0)
      alerts.push({ tipo: 'tareas', msg: `${calc.tareasAlta.length} tarea(s) de prioridad ALTA sin completar`, nivel: 'medio' });
    if (calc.riesgosAlto.length > 0)
      alerts.push({ tipo: 'riesgos', msg: `${calc.riesgosAlto.length} riesgo(s) de impacto ALTO abiertos`, nivel: 'alto' });
    return alerts;
  }, [calc]);

  // ── Generación de PDF ─────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = reportRef.current;
      const filename = `Informe_Gerencia_Agroventure_${new Date().toISOString().slice(0, 10)}.pdf`;
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] }
      }).from(element).save();
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF. Intente de nuevo.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ── Helpers de color ──────────────────────────────────────────────────────
  const semaforo = (pct) =>
    pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const semaforoText = (pct) =>
    pct === 100 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-red-700';
  const semaforoBg = (pct) =>
    pct === 100 ? 'bg-emerald-50 border-emerald-200' : pct >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

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
        <button
          onClick={handleDownloadPDF}
          disabled={generatingPDF}
          className="btn-primary gap-2 self-start sm:self-center"
        >
          <Download className="w-4 h-4" />
          {generatingPDF ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
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
                sub: calc.totalBloques > 0 ? `${Math.round((calc.bloquesListos / calc.totalBloques) * 100)}% infraestructura completa` : 'Sin bloques registrados',
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

          {/* ── SECCIÓN 1: Bloques e Infraestructura ─────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-slate-700">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <Boxes className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
                1. Bloques e Infraestructura
              </h2>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-gray-500 block text-[10px] uppercase">Registrados</span>
                <strong className="text-2xl font-display text-brand-carbon">{calc.totalBloques}</strong>
                <span className="text-gray-400 block">bloques</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {calc.bloqueStats.map(b => (
                <div key={b.id} className={`rounded-xl border p-4 text-xs space-y-3 ${semaforoBg(b.pct)}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-brand-carbon">{b.codigo}</span>
                    <span className={`font-extrabold text-sm ${semaforoText(b.pct)}`}>
                      {b.isReady ? '✓ LISTO' : `${b.pct}%`}
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

                  {/* Infraestructura */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Infraestructura ({b.done}/{b.total}):</span>
                    <div className="grid grid-cols-2 gap-0.5">
                      {b.infraestructura && Object.entries(b.infraestructura).map(([k, v]) => (
                        <div key={k} className={`flex items-center gap-1 text-[10px] ${v ? 'text-emerald-700' : 'text-red-600 font-semibold'}`}>
                          {v ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> : <XCircle className="w-3 h-3 flex-shrink-0" />}
                          <span>{infraLabels[k] || k}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alertas faltantes */}
                  {b.faltantes.length > 0 && (
                    <div className="p-2 bg-red-100/80 border border-red-300 rounded text-[10px] text-red-800">
                      <strong className="block">⚠ Falta para siembra:</strong>
                      {b.faltantes.join(', ')}
                    </div>
                  )}

                  {b.propietarioInfra && (
                    <div className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200/60">
                      <span>Infra: <strong className="text-gray-700">{b.propietarioInfra}</strong></span>
                      <span>Riego est.: <strong className="text-blue-700">{b.consumoAguaEst} m³/día</strong></span>
                    </div>
                  )}
                </div>
              ))}
              {calc.totalBloques === 0 && (
                <div className="col-span-3 text-center text-xs text-gray-400 py-6 bg-gray-50 rounded-lg border">
                  No hay bloques registrados.
                </div>
              )}
            </div>
          </section>

          {/* ── SECCIÓN 2: Plan de Siembra ───────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-brand-verde">
              <div className="w-6 h-6 rounded-full bg-brand-verde flex items-center justify-center flex-shrink-0">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
                2. Plan de Siembra — Dual
              </h2>
            </div>

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
                    <strong>⚠ Premisa sustrato:</strong> Solo 7.686 bolsas disponibles ({calc.pctBolsas}%). Decisión pendiente sobre 32.000 bolsas adicionales en Semana 34 (¿Finca o Villapinzón?).
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

          {/* ── SECCIÓN 3: Balance Hídrico ────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
                3. Balance Hídrico
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

          {/* ── SECCIÓN 4: Insumos & Sustrato ────────────────────────────── */}
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

          {/* ── SECCIÓN 5: Costos & Caja ──────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
                5. Costos & Flujo de Caja
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

          {/* ── SECCIÓN 6: Tareas & Plan de Acción ───────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-slate-500">
              <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-display text-base font-bold text-brand-carbon uppercase tracking-wide">
                6. Plan de Acción — Tareas
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-gray-500 text-[10px] uppercase block">Total tareas</span>
                <strong className="text-2xl font-display text-brand-carbon">{tareas.length}</strong>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-gray-500 text-[10px] uppercase block">Prioridad Alta</span>
                <strong className="text-2xl font-display text-red-700">{calc.tareasAlta.length}</strong>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="text-gray-500 text-[10px] uppercase block">Pendientes</span>
                <strong className="text-2xl font-display text-amber-700">{calc.tareasPendientes.length}</strong>
              </div>
            </div>

            {calc.tareasPendientes.length > 0 ? (
              <div className="space-y-2">
                {calc.tareasPendientes.slice(0, 10).map(t => (
                  <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                    t.prioridad === 'alta' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${t.prioridad === 'alta' ? 'bg-red-500' : t.prioridad === 'media' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-brand-carbon">{t.descripcion}</p>
                      <p className="text-gray-400 mt-0.5">
                        Resp: <strong className="text-gray-600">{t.responsable}</strong>
                        &nbsp;·&nbsp;Vence: <strong className="text-red-600">{t.fechaLimite}</strong>
                        &nbsp;·&nbsp;<span className="capitalize">{t.categoria}</span>
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${
                      t.prioridad === 'alta' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {t.prioridad?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 text-center py-4 bg-emerald-50 rounded-lg border border-emerald-200">
                ✓ Sin tareas pendientes.
              </p>
            )}
          </section>

          {/* ── SECCIÓN 7: Decisiones & Riesgos ──────────────────────────── */}
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
