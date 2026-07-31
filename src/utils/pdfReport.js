import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Paleta de marca (RGB) ───────────────────────────────────────────────────
const VERDE = [58, 84, 33];
const OCRE = [201, 107, 40];
const CARBON = [45, 46, 38];
const BORDER = [221, 214, 199];
const GRAYTEXT = [92, 94, 84];
const LIGHT = [248, 247, 243];
const RED = [184, 50, 50];
const AMBER = [217, 167, 38];
const BLUE = [37, 99, 235];
const PURPLE = [124, 58, 200];
const WHITE = [255, 255, 255];

const fmtNum = (n) => (n ?? 0).toLocaleString('es-CO');
const fmtCOP = (v) => `$${((v || 0) / 1e6).toFixed(1)} M`;
const fmtCOPFull = (v) => `$${(v || 0).toLocaleString('es-CO')}`;

async function loadLogo() {
  try {
    const blob = await fetch('/avc_logo.png').then((r) => r.blob());
    const dataUrl = await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => res(null);
      fr.readAsDataURL(blob);
    });
    if (!dataUrl) return null;
    // Reescala el logo a 200px para reducir el peso del PDF sin perder nitidez
    return await new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        res(canvas.toDataURL('image/png'));
      };
      img.onerror = () => res(dataUrl);
      img.src = dataUrl;
    });
  } catch {
    return null;
  }
}

export async function generateReportePDF({ data, calc, proximosPasos = [], alertasCriticas = [], fechaInforme, horaInforme }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const M = 14;
  const CW = PW - 2 * M;
  let y = 0;

  const { meta, planRiego, costos, decisiones, riesgos, siembras, insumos, bloques } = data;
  const p1 = planRiego?.plan1 || {};
  const p2 = planRiego?.plan2 || {};

  const logo = await loadLogo();

  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);

  const ensure = (h) => {
    if (y + h > PH - 16) { doc.addPage(); y = M; }
  };

  function sectionHeader(label, title, color = VERDE) {
    ensure(20);
    y += 2;
    setFill(color);
    doc.roundedRect(M, y, CW, 8, 1.2, 1.2, 'F');
    setFill(WHITE);
    doc.circle(M + 5, y + 4, 2.7, 'F');
    setText(color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(label), M + 5, y + 5.2, { align: 'center' });
    setText(WHITE);
    doc.setFontSize(10.5);
    doc.text(title, M + 11, y + 5.4);
    y += 12;
  }

  function subheading(txt, color = CARBON) {
    ensure(8);
    y += 1;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setText(color);
    doc.text(txt, M, y);
    y += 4.5;
  }

  function paragraph(text, opts = {}) {
    const size = opts.size || 8.5;
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    setText(opts.color || GRAYTEXT);
    const lines = doc.splitTextToSize(text, opts.width || CW);
    const lh = size * 0.46;
    lines.forEach((ln) => {
      ensure(lh + 1);
      doc.text(ln, M, y);
      y += lh;
    });
    y += opts.gap ?? 3;
  }

  function table(opts) {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 16 },
      styles: {
        font: 'helvetica', fontSize: 7.8, cellPadding: 1.6, overflow: 'linebreak',
        textColor: CARBON, lineColor: BORDER, lineWidth: 0.1, valign: 'middle',
      },
      headStyles: { fillColor: opts.headColor || VERDE, textColor: WHITE, fontStyle: 'bold', fontSize: 7.8 },
      alternateRowStyles: { fillColor: LIGHT },
      ...opts,
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ══ PORTADA ════════════════════════════════════════════════════════════════
  setFill(CARBON);
  doc.rect(0, 0, PW, 34, 'F');
  if (logo) {
    setFill(WHITE);
    doc.roundedRect(M, 7, 20, 20, 1.5, 1.5, 'F');
    doc.addImage(logo, 'PNG', M + 1.5, 8.5, 17, 17);
  }
  setText(WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Informe de Gerencia General', M + 24, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText([205, 205, 205]);
  doc.text(`Plan de Siembra Arándano — ${meta.finca}`, M + 24, 20);
  doc.setFontSize(8);
  doc.text(fechaInforme, PW - M, 12, { align: 'right' });
  doc.text(`${horaInforme} hrs`, PW - M, 16.5, { align: 'right' });
  setFill(VERDE);
  doc.roundedRect(PW - M - 30, 20.5, 30, 6, 1, 1, 'F');
  setText(WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('CONFIDENCIAL', PW - M - 15, 24.5, { align: 'center' });

  y = 40;

  // ══ KPIs EJECUTIVOS ══════════════════════════════════════════════════════════
  const kpis = [
    { label: 'Meta Total Plantas', value: fmtNum(meta.totalPlantasObjetivo), sub: `P1: ${fmtNum(meta.plan1Objetivo)} + P2: ${fmtNum(meta.plan2Objetivo)}`, color: VERDE },
    { label: 'Bloques Listos', value: `${calc.bloquesListos} / ${calc.totalBloques}`, sub: `Avance promedio ${calc.avancePromedioBloques}%`, color: CARBON },
    { label: 'Costos Totales', value: `${fmtCOP(calc.totalCostos)} COP`, sub: `Pendientes: ${fmtCOP(calc.costosPendientes)}`, color: OCRE },
    { label: 'Balance Hídrico', value: `${calc.peakCombinado.toFixed(0)} m³/día`, sub: `Margen: ${calc.margen.toFixed(1)} m³/día`, color: calc.margen >= 0 ? BLUE : RED },
  ];
  const gap = 3;
  const bw = (CW - gap * 3) / 4;
  const bh = 17;
  kpis.forEach((k, i) => {
    const x = M + i * (bw + gap);
    setFill(LIGHT);
    setDraw(BORDER);
    doc.roundedRect(x, y, bw, bh, 1.5, 1.5, 'FD');
    setText(GRAYTEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(k.label.toUpperCase(), x + 2.2, y + 4);
    setText(k.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(k.value, x + 2.2, y + 9.5);
    setText(GRAYTEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(doc.splitTextToSize(k.sub, bw - 4), x + 2.2, y + 13.5);
  });
  y += bh + 5;

  // ══ ALERTAS CRÍTICAS ════════════════════════════════════════════════════════
  if (alertasCriticas.length > 0) {
    table({
      head: [['Alertas críticas — Requieren atención inmediata']],
      body: alertasCriticas.map((a) => [`•  ${a.msg}`]),
      headColor: RED,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.8, overflow: 'linebreak', textColor: [140, 30, 30], lineColor: BORDER, lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [252, 242, 242] },
      bodyStyles: { fillColor: [253, 247, 247] },
    });
  }

  // ══ 1. EL PLAN ═══════════════════════════════════════════════════════════════
  sectionHeader(1, 'El Plan — Objetivo de Siembra Dual', VERDE);
  paragraph(`El proyecto busca sembrar ${fmtNum(meta.totalPlantasObjetivo)} plantas de arándano bajo una estrategia de doble densidad: el Plan 1 (definitivo, bolsa 27L con sustrato de coco) para ${fmtNum(meta.plan1Objetivo)} plantas, y el Plan 2 (contingencia, bolsa 3L de vivero) para ${fmtNum(meta.plan2Objetivo)} plantas. Ambos planes son independientes y comparten la infraestructura de los bloques.`);
  table({
    head: [['Métrica', 'Plan 1 — 27L Coco (Definitivo)', 'Plan 2 — 3L Vivero (Contingencia)']],
    body: [
      ['Meta', `${fmtNum(meta.plan1Objetivo)} plantas`, `${fmtNum(meta.plan2Objetivo)} plantas`],
      ['Programadas', `${fmtNum(calc.total27L)} (${calc.pct27L}%)`, `${fmtNum(calc.total3L)} (${calc.pct3L}%)`],
      ['Capacidad total en bloques', `${fmtNum(calc.capP1Total)} pl.`, `${fmtNum(calc.capP2Total)} pl.`],
      ['Precio de siembra', `$${fmtNum(meta.plan1PrecioPorPlanta)} / planta`, `$${fmtNum(meta.plan2PrecioPorPlanta)} / planta`],
      ['Riego (primeras 4 semanas)', `${p1.riegoM3Dia} m³/día`, `${p2.riegoM3Dia} m³/día`],
      ['Lavado de sustrato', `${p1.lavadoM3Dia} m³/día (días 1–12)`, 'No aplica'],
      ['Bolsas de sustrato disponibles', `${fmtNum(calc.bolsasDisp)} / ${fmtNum(calc.bolsasReq)}  (${calc.pctBolsas}%)`, '—'],
      ['Déficit de bolsas', `${fmtNum(calc.bolsasFaltantes)} bolsas`, '—'],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 52 } },
    headColor: VERDE,
  });

  // ══ 2. BLOQUES ═══════════════════════════════════════════════════════════════
  sectionHeader(2, 'Estado de Ejecución — Bloques e Infraestructura', CARBON);
  paragraph(`${calc.totalBloques} bloques con avance físico promedio de ${calc.avancePromedioBloques}%. ${calc.bloquesListos} listo(s) al 100% para siembra y ${calc.bloquesConAlerta.length} en adecuación.`);
  table({
    head: [['Bloque', 'Avance', 'Infra.', 'Riego', 'Cap. P1', 'Cap. P2', 'Ítems pendientes (con nota de campo)']],
    body: calc.bloqueStats.map((b) => {
      const infra = (b.grupos || []).find((g) => g.nombre === 'Infraestructura');
      const riego = (b.grupos || []).find((g) => g.nombre === 'Sistema de Riego');
      const pend = (b.grupos || [])
        .flatMap((g) => g.items.filter((i) => (i.pct || 0) < 100)
          .map((i) => (i.nota ? `${i.nombre} (${i.pct}%, ${i.nota})` : `${i.nombre} (${i.pct}%)`)))
        .join('; ') || 'Ninguno — bloque completo';
      return [
        b.codigo, `${b.pct}%`, infra ? `${infra.pct}%` : '—', riego ? `${riego.pct}%` : '—',
        fmtNum(b.capacidadPlan1 || 0), fmtNum(b.capacidadPlan2 || 0), pend,
      ];
    }),
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 16 },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 15, halign: 'right' },
      5: { cellWidth: 15, halign: 'right' },
      6: { cellWidth: 'auto' },
    },
    headColor: CARBON,
  });

  // ══ 3. RUTA CRÍTICA — SUSTRATO ═══════════════════════════════════════════════
  if ((data.cronologiaSustrato || []).length > 0) {
    sectionHeader(3, 'Ruta Crítica — Abastecimiento de Sustrato y Bolsas', BLUE);
    paragraph(`El abastecimiento de sustrato es la principal restricción del Plan 1: hoy solo se cuenta con ${fmtNum(calc.bolsasDisp)} de ${fmtNum(calc.bolsasReq)} bolsas (${calc.pctBolsas}%). La siguiente línea de tiempo resume las llegadas y la compra pendiente.`);
    table({
      head: [['Momento', 'Evento y detalle', 'Cifras clave']],
      body: data.cronologiaSustrato.map((ev) => [
        ev.semana != null ? `Semana ${ev.semana}${ev.fecha ? `\n${ev.fecha}` : ''}` : 'Compra\nrequerida',
        `${ev.titulo}\n${ev.descripcion}`,
        (ev.metricas || []).map((m) => `${m.label}: ${m.valor}`).join('\n'),
      ]),
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 46 },
      },
      headColor: BLUE,
    });
  }

  // ══ 4. INSUMOS ═══════════════════════════════════════════════════════════════
  sectionHeader(4, 'Insumos & Sustrato', PURPLE);
  if (insumos.length === 0) {
    paragraph('Sin insumos registrados a la fecha.');
  } else {
    paragraph(`${insumos.length} insumo(s) registrados · ${calc.insumosOk.length} con stock suficiente · ${calc.insumosConFaltante.length} con faltante.`);
    table({
      head: [['Insumo', 'Categoría', 'Disponible', 'Requerido', 'Faltante', 'Estado']],
      body: insumos.map((i) => {
        const disp = (i.bodega || 0) + (i.campo || 0);
        const falta = Math.max(0, (i.requerido || 0) - disp);
        const ok = falta === 0;
        return [i.nombre, i.categoria, `${fmtNum(disp)} ${i.unidad || ''}`, `${fmtNum(i.requerido)} ${i.unidad || ''}`, ok ? '—' : fmtNum(falta), ok ? 'OK' : 'FALTANTE'];
      }),
      columnStyles: {
        2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'center', cellWidth: 20 },
      },
      headColor: PURPLE,
    });
  }

  // ══ 5. BALANCE HÍDRICO ═══════════════════════════════════════════════════════
  sectionHeader(5, 'Balance Hídrico', BLUE);
  const cap = meta.capacidadHidricaDiaria || 180;
  table({
    head: [['Concepto', 'm³/día', '% de cap.', 'Periodo']],
    body: [
      ['Riego Plan 1 (600 cc × 32.000 pl.)', (p1.riegoM3Dia || 0).toFixed(1), `${Math.round((p1.riegoM3Dia || 0) / cap * 100)}%`, 'Semanas 1–4'],
      ['Lavado sustrato Plan 1 (1.85 L × 32.000 pl.)', (p1.lavadoM3Dia || 0).toFixed(1), `${Math.round((p1.lavadoM3Dia || 0) / cap * 100)}%`, 'Días 1–12'],
      ['Riego Plan 2 (600 cc × 110.000 pl.)', (p2.riegoM3Dia || 0).toFixed(1), `${Math.round((p2.riegoM3Dia || 0) / cap * 100)}%`, 'Semanas 1–4'],
      ['Pico máximo combinado (días 1–12)', calc.peakCombinado.toFixed(1), `${Math.round(calc.peakCombinado / cap * 100)}%`, 'Fase crítica'],
      ['Margen disponible', calc.margen.toFixed(1), `${Math.round(calc.margen / cap * 100)}%`, calc.margen >= 0 ? 'OK' : 'DÉFICIT'],
    ],
    columnStyles: { 1: { halign: 'right', cellWidth: 24 }, 2: { halign: 'right', cellWidth: 24 }, 3: { cellWidth: 34 } },
    headColor: BLUE,
    didParseCell: (d) => {
      if (d.section === 'body' && d.row.index >= 3) { d.cell.styles.fontStyle = 'bold'; }
    },
  });
  paragraph(
    calc.margen >= 0
      ? `Capacidad suficiente: el pico combinado (${calc.peakCombinado.toFixed(1)} m³/día) deja ${calc.margen.toFixed(1)} m³/día de margen sobre los ${cap} m³/día instalados. Recomendación: ejecutar el lavado de sustrato del Plan 1 en turno nocturno (10 PM – 4 AM) durante los primeros 12 días.`
      : `Déficit: el pico combinado (${calc.peakCombinado.toFixed(1)} m³/día) supera la capacidad instalada (${cap} m³/día) en ${Math.abs(calc.margen).toFixed(1)} m³/día. Se requiere escalonar riego y lavado.`,
    { color: calc.margen >= 0 ? VERDE : RED, bold: true }
  );

  // ══ 6. COSTOS ════════════════════════════════════════════════════════════════
  sectionHeader(6, 'Costos & Flujo de Caja', OCRE);
  paragraph(`Costos totales por ${fmtCOP(calc.totalCostos)} COP · Pendiente de avisar a tesorería: ${fmtCOP(calc.costosPendientes)} · Avisado / en presupuesto: ${fmtCOP(calc.costosAvisados)}.`);
  table({
    head: [['Concepto', 'Propietario', 'Monto COP', 'Estado']],
    body: costos.map((c) => [
      c.esCritico ? `${c.concepto}  [CRÍTICO]` : c.concepto,
      c.propietario,
      fmtCOPFull(c.montoCOP),
      c.estadoFlujoCaja,
    ]),
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 28 }, 2: { halign: 'right', cellWidth: 30 }, 3: { cellWidth: 26, halign: 'center' } },
    headColor: OCRE,
  });

  // ══ 7. DECISIONES & RIESGOS ══════════════════════════════════════════════════
  sectionHeader(7, 'Decisiones & Riesgos', RED);
  subheading(`Decisiones Pendientes (${calc.decisAbiertas.length})`, OCRE);
  if (calc.decisAbiertas.length === 0) {
    paragraph('Sin decisiones abiertas.');
  } else {
    table({
      head: [['Decisión', 'Vence', 'Responsable', 'Descripción y plan de contingencia']],
      body: calc.decisAbiertas.map((d) => [
        d.titulo, d.vencimiento || '—', d.responsable || '—',
        d.descripcion + (d.planContingencia ? `\nContingencia: ${d.planContingencia}` : ''),
      ]),
      columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 26 }, 3: { cellWidth: 'auto' } },
      headColor: AMBER,
    });
  }
  subheading(`Riesgos Abiertos (${calc.riesgosAbiertos.length})`, RED);
  if (calc.riesgosAbiertos.length === 0) {
    paragraph('Sin riesgos críticos abiertos.');
  } else {
    table({
      head: [['Riesgo', 'Impacto', 'Prob.', 'Responsable', 'Descripción y mitigación']],
      body: calc.riesgosAbiertos.map((r) => [
        r.titulo, r.impacto || '—', r.probabilidad || '—', r.responsable || '—',
        r.descripcion + (r.mitigacion ? `\nMitigación: ${r.mitigacion}` : ''),
      ]),
      columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold' }, 1: { cellWidth: 17, halign: 'center' }, 2: { cellWidth: 14, halign: 'center' }, 3: { cellWidth: 24 }, 4: { cellWidth: 'auto' } },
      headColor: RED,
    });
  }

  // ══ 8. CONCLUSIONES Y PRÓXIMOS PASOS ═════════════════════════════════════════
  sectionHeader(8, 'Conclusiones y Próximos Pasos', VERDE);
  table({
    head: [['Frente', 'Síntesis']],
    body: [
      ['Ejecución en campo', `Avance físico promedio de ${calc.avancePromedioBloques}% en ${calc.totalBloques} bloques. ${calc.bloquesListos > 0 ? `${calc.bloquesListos} listo(s) para siembra` : 'Ningún bloque está 100% listo aún'} y ${calc.bloquesConAlerta.length} en adecuación.`],
      ['Ruta crítica: sustrato', `Solo el ${calc.pctBolsas}% del Plan 1 tiene bolsas (${fmtNum(calc.bolsasDisp)} de ${fmtNum(calc.bolsasReq)}). Faltan comprar 56.314 bolsas y 24.314 unidades de sustrato (656.478 L de coco).`],
      ['Compromiso financiero', `Costos totales por ${fmtCOP(calc.totalCostos)} COP, de los cuales ${fmtCOP(calc.costosPendientes)} están pendientes de avisar a tesorería.`],
      ['Viabilidad hídrica', calc.margen >= 0 ? `Capacidad suficiente: pico ${calc.peakCombinado.toFixed(1)} m³/día con ${calc.margen.toFixed(1)} m³/día de margen. ${calc.decisAbiertas.length} decisión(es) y ${calc.riesgosAlto.length} riesgo(s) de impacto alto abiertos.` : `Déficit hídrico de ${Math.abs(calc.margen).toFixed(1)} m³/día en el pico. ${calc.decisAbiertas.length} decisión(es) y ${calc.riesgosAlto.length} riesgo(s) de impacto alto abiertos.`],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 'auto' } },
    headColor: CARBON,
  });
  subheading('Próximos Pasos Priorizados', VERDE);
  table({
    head: [['#', 'Acción', 'Responsable sugerido', 'Prioridad']],
    body: proximosPasos.map((p, i) => [String(i + 1), p.texto, p.resp, p.prioridad]),
    columnStyles: { 0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 34 }, 3: { cellWidth: 20, halign: 'center' } },
    headColor: VERDE,
    didParseCell: (d) => {
      if (d.section === 'body' && d.column.index === 3) {
        d.cell.styles.fontStyle = 'bold';
        d.cell.styles.textColor = d.cell.raw === 'ALTA' ? RED : OCRE;
      }
    },
  });

  // ══ PIE DE PÁGINA CON NUMERACIÓN ═════════════════════════════════════════════
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setDraw(BORDER);
    doc.setLineWidth(0.2);
    doc.line(M, PH - 11, PW - M, PH - 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setText(GRAYTEXT);
    doc.text(`Agroventure Capital — ${meta.finca} · Confidencial`, M, PH - 7);
    doc.text(fechaInforme, PW / 2, PH - 7, { align: 'center' });
    doc.text(`Página ${i} de ${total}`, PW - M, PH - 7, { align: 'right' });
  }

  doc.save(`Informe_Gerencia_Agroventure_${new Date().toISOString().slice(0, 10)}.pdf`);
}
