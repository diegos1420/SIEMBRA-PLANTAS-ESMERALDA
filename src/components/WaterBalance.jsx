import React, { useState } from 'react';
import { Droplets, Clock, Info } from 'lucide-react';

export default function WaterBalance({ data }) {
  const { sustrato, planRiego } = data;
  const [planActivo, setPlanActivo] = useState('PLAN1');
  const [incluirLavado, setIncluirLavado] = useState(true);

  const p1 = planRiego?.plan1 || {
    plantas: 32000, lavadoLtPorPlantaDia: 5.42, lavadoM3Dia: 173.3,
    lavadoDias: 12, riegoCcPorPlantaDia: 600, riegoM3Dia: 19.2, semanasRiego: 4
  };
  const p2 = planRiego?.plan2 || {
    plantas: 110000, riegoCcPorPlantaDia: 600, riegoM3Dia: 66, lavadoM3Dia: 64.2, semanasRiego: 4
  };

  // Week-by-week schedule for Plan 1 (4 semanas + lavado primeros días)
  const semanasPlan1 = [
    {
      semana: 1, dias: '1 – 7',
      lavado: p1.lavadoM3Dia,
      riego: p1.riegoM3Dia,
      nota: `Lavado activo (días 1–7 de ${p1.lavadoDias}). Riego ${p1.riegoCcPorPlantaDia} cc/planta/día.`
    },
    {
      semana: 2, dias: '8 – 14',
      lavado: p1.lavadoM3Dia,
      lavadoParcial: true,
      riego: p1.riegoM3Dia,
      nota: `Lavado activo días 8–${p1.lavadoDias} (finaliza). Sin lavado después.`
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

  // Week-by-week for Plan 2 (incluye lavado primeros días también)
  const semanasPlan2 = [
    {
      semana: 1, dias: '1 – 7',
      lavado: p2.lavadoM3Dia || 0,
      riego: p2.riegoM3Dia,
      nota: `Lavado activo (días 1–7 de ${p2.lavadoDias || 12}). Riego ${p2.riegoCcPorPlantaDia} cc/planta/día.`
    },
    {
      semana: 2, dias: '8 – 14',
      lavado: p2.lavadoM3Dia || 0,
      lavadoParcial: true,
      riego: p2.riegoM3Dia,
      nota: `Lavado activo días 8–${p2.lavadoDias || 12} (finaliza). Sin lavado después.`
    },
    {
      semana: 3, dias: '15 – 21',
      lavado: 0,
      riego: p2.riegoM3Dia,
      nota: `Sin lavado. Solo riego ${p2.riegoCcPorPlantaDia} cc/planta/día.`
    },
    {
      semana: 4, dias: '22 – 28',
      lavado: 0,
      riego: p2.riegoM3Dia,
      nota: `Sin lavado. Solo riego ${p2.riegoCcPorPlantaDia} cc/planta/día.`
    },
  ];

  const semanas = planActivo === 'PLAN1' ? semanasPlan1 : semanasPlan2;

  const peakPlan1 = p1.lavadoM3Dia + p1.riegoM3Dia;
  const peakPlan2 = (p2.lavadoM3Dia || 0) + p2.riegoM3Dia;
  const peakCombinado = peakPlan1 + peakPlan2;

  const consumoActual = planActivo === 'PLAN1'
    ? (incluirLavado ? p1.lavadoM3Dia : 0) + p1.riegoM3Dia
    : (incluirLavado ? (p2.lavadoM3Dia || 0) : 0) + p2.riegoM3Dia;

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
            Consumo proyectado diario para riego y lavado de sustrato.
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

      {/* Consumo Pico Combinado */}
      <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-300 flex items-start gap-3">
        <Droplets className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-blue-900">
            Consumo Pico Combinado (Plan 1 con lavado + Plan 2 con lavado) = {fmtM3(peakCombinado)} / día
          </strong>
          <p className="text-gray-600 mt-0.5">
            Plan 1 pico: {fmtM3(peakPlan1)} (lavado {fmtM3(p1.lavadoM3Dia)} + riego {fmtM3(p1.riegoM3Dia)}) &nbsp;·&nbsp;
            Plan 2 pico: {fmtM3(peakPlan2)} (lavado {fmtM3(p2.lavadoM3Dia || 0)} + riego {fmtM3(p2.riegoM3Dia)})
          </p>
        </div>
      </div>

      {/* Consumo diario + Plan summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Consumo diario */}
        <div className="brand-card md:col-span-2 space-y-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display text-lg font-bold text-brand-carbon">
              Consumo Diario — {planActivo === 'PLAN1' ? 'Plan 1' : 'Plan 2'}
            </h3>
            <button
              onClick={() => setIncluirLavado(!incluirLavado)}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all border ${
                incluirLavado ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {incluirLavado ? '+ Lavado de Sustrato' : 'Sin Lavado (solo riego)'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-brand-carbon">
            <span>Consumo total: <strong className="text-blue-700 text-sm">{fmtM3(consumoActual)}</strong></span>
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
                  <span className="text-gray-500 block">Total Diario:</span>
                  <strong className="text-emerald-900 text-sm">{fmtM3(consumoActual)}</strong>
                  <span className="text-[11px] text-gray-400 block">riego + lavado</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-gray-500 block">Riego Plan 2:</span>
                  <strong className="text-amber-900 text-sm">{fmtM3(p2.riegoM3Dia)}</strong>
                  <span className="text-[11px] text-gray-400 block">{p2.riegoCcPorPlantaDia} cc/planta/día × {fmtNum(p2.plantas)} pl.</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-gray-500 block">Lavado Sustrato:</span>
                  <strong className="text-amber-900 text-sm">{fmtM3(p2.lavadoM3Dia || 0)}</strong>
                  <span className="text-[11px] text-gray-400 block">{p2.lavadoLtPorPlantaDia || 0} L × {fmtNum(p2.plantas)} pl.</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Total Diario:</span>
                  <strong className="text-emerald-900 text-sm">{fmtM3(consumoActual)}</strong>
                  <span className="text-[11px] text-gray-400 block">riego + lavado</span>
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
                  <div className="flex justify-between"><span>Total por planta:</span><strong>{p1.lavadoLtTotalPorPlanta} L</strong></div>
                  <div className="flex justify-between"><span>Días de lavado:</span><strong>{p1.lavadoDias} días</strong></div>
                  <div className="flex justify-between"><span>L/planta/día:</span><strong>{p1.lavadoLtPorPlantaDia} L</strong></div>
                  <div className="flex justify-between"><span>Total m³/día:</span><strong className="text-amber-700">{fmtM3(p1.lavadoM3Dia)}</strong></div>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Pico (riego + lavado):</span>
                  <strong className="text-brand-verde">{fmtM3(peakPlan1)}</strong>
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
                <div className="p-2 bg-amber-50 rounded border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-800 block">Lavado de Sustrato:</span>
                  <div className="flex justify-between"><span>Total por planta:</span><strong>{p2.lavadoLtTotalPorPlanta || 0} L</strong></div>
                  <div className="flex justify-between"><span>Días de lavado:</span><strong>{p2.lavadoDias || 12} días</strong></div>
                  <div className="flex justify-between"><span>L/planta/día:</span><strong>{p2.lavadoLtPorPlantaDia || 0} L</strong></div>
                  <div className="flex justify-between"><span>Total m³/día:</span><strong className="text-amber-700">{fmtM3(p2.lavadoM3Dia || 0)}</strong></div>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Pico (riego + lavado):</span>
                  <strong className="text-brand-verde">{fmtM3(peakPlan2)}</strong>
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
                <th className="p-3">Lavado (m³/día)</th>
                <th className="p-3">Total Diario</th>
                <th className="p-3">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {semanas.map((s) => {
                const lavadoFila = s.lavado || 0;
                const totalFila = s.riego + lavadoFila;
                const hayLavado = lavadoFila > 0;
                return (
                  <tr key={s.semana} className={`transition-colors ${hayLavado ? 'bg-amber-50/40' : 'hover:bg-brand-crema-light/40'}`}>
                    <td className="p-3 font-extrabold text-brand-carbon">Semana {s.semana}</td>
                    <td className="p-3 text-brand-carbon-muted">Días {s.dias}</td>
                    <td className="p-3 font-bold text-blue-700">{fmtM3(s.riego)}</td>
                    <td className="p-3">
                      {lavadoFila > 0 ? (
                        <span className="font-bold text-amber-700">{fmtM3(lavadoFila)}{s.lavadoParcial ? '*' : ''}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 font-extrabold text-brand-carbon">{fmtM3(totalFila)}</td>
                    <td className="p-3 text-[11px] text-brand-carbon-muted max-w-xs">{s.nota}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-amber-700 italic px-1">
          * Semana 2: lavado finaliza el día {planActivo === 'PLAN1' ? p1.lavadoDias : (p2.lavadoDias || 12)} (de los {planActivo === 'PLAN1' ? p1.lavadoDias : (p2.lavadoDias || 12)} días totales). Días posteriores solo riego.
        </p>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Este cronograma aplica <strong>únicamente a las primeras 4 semanas</strong> post-siembra.
            {planActivo === 'PLAN1'
              ? ` El lavado de sustrato (${p1.lavadoLtTotalPorPlanta} L/planta, ${p1.lavadoLtPorPlantaDia} L/día) se realiza en los primeros ${p1.lavadoDias} días y se recomienda en turno nocturno (10PM–4AM) para no sobrecargar la red.`
              : ` El lavado de sustrato (${p2.lavadoLtTotalPorPlanta || 0} L/planta, ${p2.lavadoLtPorPlantaDia || 0} L/día) se realiza en los primeros ${p2.lavadoDias || 12} días. Riego estándar de ${p2.riegoCcPorPlantaDia} cc/planta/día.`
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
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {data.bloques.map((b) => (
                <tr key={b.id} className="hover:bg-brand-crema-light/50 transition-colors">
                  <td className="p-3 font-bold text-brand-carbon">{b.codigo}</td>
                  <td className="p-3 text-brand-carbon-muted">{b.propietarioInfra}</td>
                  <td className="p-3 font-semibold text-blue-700">{b.valvulas} válvulas</td>
                  <td className="p-3">{b.area} Ha</td>
                  <td className="p-3 font-bold text-blue-900">{b.consumoAguaEst} m³</td>
                </tr>
              ))}
              <tr className="bg-brand-crema font-bold border-t-2 border-brand-border">
                <td className="p-3 text-brand-carbon" colSpan={4}>TOTAL RIEGO INSTALADO</td>
                <td className="p-3 text-blue-900">{data.bloques.reduce((s, b) => s + b.consumoAguaEst, 0)} m³/día</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
