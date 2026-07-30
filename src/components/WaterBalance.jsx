import React, { useState } from 'react';
import { Droplets, AlertTriangle, CheckCircle2, Layers, Clock, Info } from 'lucide-react';

export default function WaterBalance({ data }) {
  const { capacidadHidricaDiaria } = data.meta;
  const { sustrato, planRiego } = data;
  const [planActivo, setPlanActivo] = useState('PLAN1');
  const [incluirLavado, setIncluirLavado] = useState(true);

  const p1 = planRiego?.plan1 || {
    plantas: 32000, lavadoLtPorPlantaDia: 1.85, lavadoM3Dia: 59.2,
    lavadoDias: 12, riegoCcPorPlantaDia: 600, riegoM3Dia: 19.2, semanasRiego: 4
  };
  const p2 = planRiego?.plan2 || {
    plantas: 110000, riegoCcPorPlantaDia: 600, riegoM3Dia: 66, semanasRiego: 4
  };

  // Week-by-week schedule for Plan 1 (4 semanas + lavado primeros 12 días)
  const semanasPlan1 = [
    {
      semana: 1, dias: '1 – 7',
      lavado: p1.lavadoM3Dia,    // días 1-7 → lavado activo
      riego: p1.riegoM3Dia,
      nota: `Lavado activo (días 1–7 de 12). Riego ${p1.riegoCcPorPlantaDia} cc/planta/día.`
    },
    {
      semana: 2, dias: '8 – 14',
      lavado: p1.lavadoM3Dia,    // días 8-12 lavado, días 13-14 sin lavado → promedio
      lavadoParcial: true,       // lavado finaliza el día 12
      riego: p1.riegoM3Dia,
      nota: `Lavado activo días 8–12 (finaliza). Sin lavado días 13–14.`
    },
    {
      semana: 3, dias: '15 – 21',
      lavado: 0,
      riego: p1.riegoM3Dia,
      nota: `Sin lavado. Solo riego ${p1.riegoCcPorPlantaDia} cc/planta/día.`
    },
    {
      semana: 4, dias: '22 – 28',
      lavado: 0,
      riego: p1.riegoM3Dia,
      nota: `Sin lavado. Solo riego ${p1.riegoCcPorPlantaDia} cc/planta/día.`
    },
  ];

  // Week-by-week for Plan 2
  const semanasPlan2 = [1, 2, 3, 4].map((s) => ({
    semana: s,
    dias: `${(s - 1) * 7 + 1} – ${s * 7}`,
    riego: p2.riegoM3Dia,
    nota: `Riego ${p2.riegoCcPorPlantaDia} cc/planta/día × ${p2.plantas.toLocaleString('es-CO')} plantas.`
  }));

  const semanas = planActivo === 'PLAN1' ? semanasPlan1 : semanasPlan2;

  // Current day demand for gauge
  const demandaRiego = planActivo === 'PLAN1' ? p1.riegoM3Dia : p2.riegoM3Dia;
  const demandaLavado = planActivo === 'PLAN1' && incluirLavado ? p1.lavadoM3Dia : 0;
  const consumoRiegoBase = data.bloques.reduce((sum, b) => sum + (b.consumoAguaEst || 0), 0);

  // Peak consumption during first 12 days (Plan 1 with lavado)
  const peakPlan1 = p1.lavadoM3Dia + p1.riegoM3Dia; // 59.2 + 19.2 = 78.4
  const peakPlan2 = p2.riegoM3Dia; // 66
  const peakCombinado = peakPlan1 + peakPlan2; // 78.4 + 66 = 144.4

  const consumoActual = planActivo === 'PLAN1'
    ? (incluirLavado ? p1.lavadoM3Dia : 0) + p1.riegoM3Dia
    : p2.riegoM3Dia;

  const pct = Math.round((consumoActual / capacidadHidricaDiaria) * 100);

  const fmtM3 = (v) => `${v.toFixed(1)} m³`;
  const fmtNum = (n) => n.toLocaleString('es-CO');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <h2 className="font-display text-xl font-bold text-brand-carbon">
              Balance Hídrico — Plan de Riego (Primeras 4 Semanas)
            </h2>
          </div>
          <p className="text-xs text-brand-carbon-muted mt-1">
            Consumo proyectado diario para riego y lavado de sustrato. Capacidad hídrica: <strong>{capacidadHidricaDiaria} m³/día</strong>.
          </p>
        </div>
        {/* Plan selector */}
        <div className="flex items-center gap-2 bg-brand-crema p-1.5 rounded-xl border border-brand-border">
          <button
            onClick={() => setPlanActivo('PLAN1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${planActivo === 'PLAN1' ? 'bg-brand-verde text-white shadow-sm' : 'bg-white text-gray-700'}`}
          >
            Plan 1 (27L Coco)
          </button>
          <button
            onClick={() => setPlanActivo('PLAN2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${planActivo === 'PLAN2' ? 'bg-brand-ocre text-white shadow-sm' : 'bg-white text-gray-700'}`}
          >
            Plan 2 (3L Vivero)
          </button>
        </div>
      </div>

      {/* Peak Combined Alert */}
      <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${peakCombinado > capacidadHidricaDiaria ? 'bg-red-50 border-red-400' : 'bg-emerald-50 border-emerald-400'}`}>
        {peakCombinado > capacidadHidricaDiaria
          ? <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          : <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        }
        <div className="text-xs">
          <strong className={peakCombinado > capacidadHidricaDiaria ? 'text-red-800' : 'text-emerald-800'}>
            Pico Máximo Combinado (Plan 1 con lavado + Plan 2 riego) = {fmtM3(peakCombinado)} / día
          </strong>
          <p className="text-gray-600 mt-0.5">
            Plan 1 pico: {fmtM3(peakPlan1)} (lavado {fmtM3(p1.lavadoM3Dia)} + riego {fmtM3(p1.riegoM3Dia)}) &nbsp;·&nbsp;
            Plan 2: {fmtM3(peakPlan2)} &nbsp;·&nbsp;
            Capacidad disponible: <strong>{capacidadHidricaDiaria} m³/día</strong> &nbsp;·&nbsp;
            Margen: <strong className="text-emerald-700">{fmtM3(capacidadHidricaDiaria - peakCombinado)}</strong>
          </p>
        </div>
      </div>

      {/* Gauge + Plan summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Gauge */}
        <div className="brand-card md:col-span-2 space-y-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display text-lg font-bold text-brand-carbon">
              Consumo Diario — {planActivo === 'PLAN1' ? 'Plan 1' : 'Plan 2'}
            </h3>
            {planActivo === 'PLAN1' && (
              <button
                onClick={() => setIncluirLavado(!incluirLavado)}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all border ${
                  incluirLavado ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {incluirLavado ? '+ Lavado de Sustrato' : 'Sin Lavado (solo riego)'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-brand-carbon">
              <span>Demanda: <strong>{fmtM3(consumoActual)}</strong></span>
              <span>Capacidad Máxima: <strong>{capacidadHidricaDiaria} m³/día</strong></span>
            </div>
            <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden p-0.5 border border-gray-300">
              <div
                className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-red-600' : pct > 75 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              ></div>
            </div>
            <div className="text-right text-xs font-bold text-brand-carbon-muted">{pct}% de capacidad</div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
            {planActivo === 'PLAN1' ? (
              <>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-500 block">Riego Plan 1:</span>
                  <strong className="text-blue-900 text-sm">{fmtM3(p1.riegoM3Dia)}</strong>
                  <span className="text-[11px] text-gray-400 block">{p1.riegoCcPorPlantaDia} cc × {fmtNum(p1.plantas)} pl.</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-gray-500 block">Lavado Sustrato:</span>
                  <strong className="text-amber-900 text-sm">{fmtM3(p1.lavadoM3Dia)}</strong>
                  <span className="text-[11px] text-gray-400 block">{p1.lavadoLtPorPlantaDia} L × {fmtNum(p1.plantas)} pl.</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Margen Libre:</span>
                  <strong className="text-emerald-900 text-sm">{fmtM3(Math.max(0, capacidadHidricaDiaria - consumoActual))}</strong>
                  <span className="text-[11px] text-gray-400 block">de {capacidadHidricaDiaria} m³/día</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 col-span-2">
                  <span className="text-gray-500 block">Riego Plan 2:</span>
                  <strong className="text-amber-900 text-sm">{fmtM3(p2.riegoM3Dia)}</strong>
                  <span className="text-[11px] text-gray-400 block">{p2.riegoCcPorPlantaDia} cc/planta/día × {fmtNum(p2.plantas)} plantas</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Margen Libre:</span>
                  <strong className="text-emerald-900 text-sm">{fmtM3(Math.max(0, capacidadHidricaDiaria - consumoActual))}</strong>
                  <span className="text-[11px] text-gray-400 block">de {capacidadHidricaDiaria} m³/día</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Plan specs card */}
        <div className={`brand-card space-y-3 ${planActivo === 'PLAN1' ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-200' : 'bg-gradient-to-b from-amber-50/50 to-white border-amber-200'}`}>
          <div className={`flex items-center gap-2 font-bold text-sm ${planActivo === 'PLAN1' ? 'text-emerald-800' : 'text-amber-800'}`}>
            <Droplets className="w-5 h-5" />
            <span>{planActivo === 'PLAN1' ? 'Plan 1 — Siembra Definitiva' : 'Plan 2 — Contingencia Vivero'}</span>
          </div>
          <div className="text-xs space-y-2 text-brand-carbon">
            {planActivo === 'PLAN1' ? (
              <>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Plantas:</span>
                  <strong>{fmtNum(p1.plantas)}</strong>
                </div>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Riego:</span>
                  <strong>{p1.riegoCcPorPlantaDia} cc/planta/día</strong>
                </div>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Total riego diario:</span>
                  <strong className="text-blue-700">{fmtM3(p1.riegoM3Dia)}</strong>
                </div>
                <div className="p-2 bg-amber-50 rounded border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-800 block">Lavado de Sustrato:</span>
                  <div className="flex justify-between"><span>Total por planta:</span><strong>22 L</strong></div>
                  <div className="flex justify-between"><span>Días de lavado:</span><strong>12 días</strong></div>
                  <div className="flex justify-between"><span>L/planta/día:</span><strong>{p1.lavadoLtPorPlantaDia} L</strong></div>
                  <div className="flex justify-between"><span>Total m³/día:</span><strong className="text-amber-700">{fmtM3(p1.lavadoM3Dia)}</strong></div>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Pico (riego + lavado):</span>
                  <strong className={peakPlan1 > capacidadHidricaDiaria ? 'text-red-600' : 'text-brand-verde'}>{fmtM3(peakPlan1)}</strong>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Plantas:</span>
                  <strong>{fmtNum(p2.plantas)}</strong>
                </div>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Riego:</span>
                  <strong>{p2.riegoCcPorPlantaDia} cc/planta/día</strong>
                </div>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Total riego diario:</span>
                  <strong className="text-amber-700">{fmtM3(p2.riegoM3Dia)}</strong>
                </div>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Semanas de riego:</span>
                  <strong>4 semanas</strong>
                </div>
                <div className="flex justify-between border-b border-brand-border pb-1">
                  <span>Total agua (28 días):</span>
                  <strong>{fmtM3(p2.riegoM3Dia * 28)}</strong>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-200 text-[11px] text-blue-800">
                  Sin lavado de sustrato. Plan 2 aplica sustrato alternativo de vivero.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Week-by-week table */}
      <div className="brand-card space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <Clock className="w-5 h-5 text-brand-ocre" />
          <h3 className="font-display text-lg font-bold text-brand-carbon">
            Cronograma Hídrico — Semana a Semana (Primeras 4 Semanas)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
            {planActivo === 'PLAN1' ? 'Plan 1: 27L Coco' : 'Plan 2: 3L Vivero'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-crema text-brand-carbon uppercase font-bold text-[11px] border-b border-brand-border">
              <tr>
                <th className="p-3">Semana</th>
                <th className="p-3">Días</th>
                <th className="p-3">Riego (m³/día)</th>
                {planActivo === 'PLAN1' && <th className="p-3">Lavado (m³/día)</th>}
                <th className="p-3">Total Diario</th>
                <th className="p-3">% Capacidad</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {semanas.map((s) => {
                const lavadoFila = planActivo === 'PLAN1' ? (s.lavado || 0) : 0;
                const totalFila = s.riego + lavadoFila;
                const pctFila = Math.round((totalFila / capacidadHidricaDiaria) * 100);
                const hayLavado = lavadoFila > 0;
                return (
                  <tr key={s.semana} className={`transition-colors ${hayLavado ? 'bg-amber-50/40' : 'hover:bg-brand-crema-light/40'}`}>
                    <td className="p-3 font-extrabold text-brand-carbon">Semana {s.semana}</td>
                    <td className="p-3 text-brand-carbon-muted">Días {s.dias}</td>
                    <td className="p-3 font-bold text-blue-700">{fmtM3(s.riego)}</td>
                    {planActivo === 'PLAN1' && (
                      <td className="p-3">
                        {lavadoFila > 0 ? (
                          <span className="font-bold text-amber-700">{fmtM3(lavadoFila)}{s.lavadoParcial ? '*' : ''}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="p-3 font-extrabold text-brand-carbon">{fmtM3(totalFila)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pctFila > 90 ? 'bg-red-600' : pctFila > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, pctFila)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-brand-carbon">{pctFila}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`status-badge ${
                        pctFila > 90 ? 'status-critico' : pctFila > 70 ? 'status-atencion' : 'status-excelente'
                      }`}>
                        {pctFila > 90 ? '⚠️ CRÍTICO' : pctFila > 70 ? 'MODERADO' : '✓ OK'}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-brand-carbon-muted max-w-xs">{s.nota}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {planActivo === 'PLAN1' && (
          <p className="text-[11px] text-amber-700 italic px-1">
            * Semana 2: lavado finaliza el día 12 (de los 12 días totales). Días 13–14 solo riego.
          </p>
        )}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Este cronograma aplica <strong>únicamente a las primeras 4 semanas</strong> post-siembra.
            {planActivo === 'PLAN1'
              ? ` El lavado de sustrato (22 L/planta, 1.85 L/día) se realiza en los primeros 12 días y se recomienda en turno nocturno (10PM–4AM) para no sobrecargar la red.`
              : ` Plan 2 no requiere lavado de sustrato. Riego estándar de ${p2.riegoCcPorPlantaDia} cc/planta/día.`
            }
          </span>
        </div>
      </div>

      {/* Consumption per block table */}
      <div className="brand-card space-y-4">
        <h3 className="font-display text-lg font-bold text-brand-carbon border-b border-brand-border pb-3">
          Consumo Estimado por Bloque (Riego Instalado)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-crema text-brand-carbon uppercase font-bold text-[11px] border-b border-brand-border">
              <tr>
                <th className="p-3">Bloque</th>
                <th className="p-3">Propietario Infra</th>
                <th className="p-3">Válvulas</th>
                <th className="p-3">Área (Ha)</th>
                <th className="p-3">Consumo Riego Est. (m³/día)</th>
                <th className="p-3">% de Capacidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {data.bloques.map((b) => {
                const pctB = Math.round((b.consumoAguaEst / capacidadHidricaDiaria) * 100);
                return (
                  <tr key={b.id} className="hover:bg-brand-crema-light/50 transition-colors">
                    <td className="p-3 font-bold text-brand-carbon">{b.codigo}</td>
                    <td className="p-3 text-brand-carbon-muted">{b.propietarioInfra}</td>
                    <td className="p-3 font-semibold text-blue-700">{b.valvulas} válvulas</td>
                    <td className="p-3">{b.area} Ha</td>
                    <td className="p-3 font-bold text-blue-900">{b.consumoAguaEst} m³</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${Math.min(100, pctB)}%` }}></div>
                        </div>
                        <span className="text-[11px] text-brand-carbon-muted">{pctB}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-brand-crema font-bold border-t-2 border-brand-border">
                <td className="p-3 text-brand-carbon" colSpan={4}>TOTAL RIEGO INSTALADO</td>
                <td className="p-3 text-blue-900">{data.bloques.reduce((s, b) => s + b.consumoAguaEst, 0)} m³/día</td>
                <td className="p-3 text-brand-carbon-muted">{Math.round(data.bloques.reduce((s, b) => s + b.consumoAguaEst, 0) / capacidadHidricaDiaria * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
