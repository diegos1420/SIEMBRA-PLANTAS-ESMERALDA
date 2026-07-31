import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Paleta de marca (RGB) ───────────────────────────────────────────────────
const VERDE = [58, 84, 33];
const OCRE = [201, 107, 40];
const CARBON = [45, 46, 38];
const BORDER = [223, 218, 205];
const GRAYTEXT = [107, 109, 99];
const LIGHT = [250, 249, 246];
const RED = [184, 50, 50];
const AMBER = [180, 130, 20];
const BLUE = [30, 90, 175];
const PURPLE = [108, 58, 170];
const WHITE = [255, 255, 255];

const fmtNum = (n) => (n ?? 0).toLocaleString('es-CO');
const fmtCOP = (v) => `$${((v || 0) / 1e6).toFixed(1)} M`;
const fmtCOPFull = (v) => `$${(v || 0).toLocaleString('es-CO')}`;

// Recorta una lista de ítems pendientes a los primeros N + resumen del resto
function resumenPendientes(pendientes, max = 3) {
  if (pendientes.length === 0) return 'Ninguno — bloque completo';
  const visibles = pendientes.slice(0, max).map((p) => `${p.nombre} (${p.pct}%)`);
  const resto = pendientes.length - visibles.length;
  return visibles.join('; ') + (resto > 0 ? `; +${resto} más` : '');
}

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
  const M = 16;
  const CW = PW - 2 * M;
  const BOTTOM_LIMIT = PH - 18;
  let y = 0;

  const { meta, planRiego, costos, insumos, bloques } = data;
  const siembras = data.siembras;
  const p1 = planRiego?.plan1 || {};
  const p2 = planRiego?.plan2 || {};

  const logo = await loadLogo();

  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);

  const ensure = (h) => {
    if (y + h > BOTTOM_LIMIT) { doc.addPage(); y = M; }
  };

  // ── Encabezado de sección: numeral + título + regla fina (estilo documento) ─
  function sectionHeader(label, title, color = VERDE) {
    ensure(18);
    y += 3;
    const badge = 6.4;
    setFill(color);
    doc.roundedRect(M, y, badge, badge, 1, 1, 'F');
    setText(WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(String(label), M + badge / 2, y + badge / 2 + 1.2, { align: 'center' });
    setText(color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, M + badge + 3.5, y + badge / 2 + 1.4);
    y += badge + 3;
    setDraw(color);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + CW, y);
    y += 6;
  }

  function subheading(txt, color = CARBON) {
    ensure(9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    setText(color);
    doc.text(txt, M, y);
    y += 5.5;
  }

  function paragraph(text, opts = {}) {
    const size = opts.size || 8.8;
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    setText(opts.color || GRAYTEXT);
    const lines = doc.splitTextToSize(text, opts.width || CW);
    const lh = size * 0.5;
    lines.forEach((ln) => {
      ensure(lh + 1);
      doc.text(ln, M, y);
      y += lh;
    });
    y += opts.gap ?? 4;
  }

  function table(opts) {
    // Evita encabezados de tabla "huérfanos" al final de una página:
    // reserva espacio para el header + al menos una fila antes de empezar.
    ensure(20);
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 18 },
      theme: 'striped',
      rowPageBreak: 'avoid',
      styles: {
        font: 'helvetica', fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 2.4, right: 2.4 },
        overflow: 'linebreak', textColor: CARBON, lineColor: BORDER, lineWidth: 0.1, valign: 'middle', minCellHeight: 6,
      },
      headStyles: { fillColor: opts.headColor || VERDE, textColor: WHITE, fontStyle: 'bold', fontSize: 8, cellPadding: { top: 2.6, bottom: 2.6, left: 2.4, right: 2.4 } },
      alternateRowStyles: { fillColor: LIGHT },
      ...opts,
    });
    y = doc.lastAutoTable.finalY + 7;
  }

  // ══ PORTADA ════════════════════════════════════════════════════════════════
  setFill(CARBON);
  doc.rect(0, 0, PW, 36, 'F');
  if (logo) {
    setFill(WHITE);
    doc.roundedRect(M, 8, 21, 21, 1.5, 1.5, 'F');
    doc.addImage(logo, 'PNG', M + 1.5, 9.5, 18, 18);
  }
  setText(WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Informe de Gerencia General', M + 26, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setText([200, 200, 195]);
  doc.text(`Plan de Siembra Arándano — ${meta.finca}`, M + 26, 22.5);

  doc.setFontSize(8.5);
  doc.text(fechaInforme, PW - M, 13, { align: 'right' });
  doc.text(`${horaInforme} hrs`, PW - M, 17.5, { align: 'right' });
  setFill(VERDE);
  doc.roundedRect(PW - M - 28, 21, 28, 6.5, 1, 1, 'F');
  setText(WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('CONFIDENCIAL', PW - M - 14, 25.3, { align: 'center' });

  y = 46;

  // ══ KPIs EJECUTIVOS ══════════════════════════════════════════════════════════
  const kpis = [
    { label: 'Meta Total Plantas', value: fmtNum(meta.totalPlantasObjetivo), sub: `P1: ${fmtNum(meta.plan1Objetivo)} + P2: ${fmtNum(meta.plan2Objetivo)}`, color: VERDE },
    { label: 'Bloques Listos', value: `${calc.bloquesListos} / ${calc.totalBloques}`, sub: `Avance promedio ${calc.avancePromedioBloques}%`, color: CARBON },
    { label: 'Costos Totales', value: `${fmtCOP(calc.totalCostos)} COP`, sub: `Pendientes: ${fmtCOP(calc.costosPendientes)}`, color: OCRE },
    { label: 'Balance Hídrico', value: `${calc.peakCombinado.toFixed(0)} m³/día`, sub: `Margen: ${calc.margen.toFixed(1)} m³/día`, color: calc.margen >= 0 ? BLUE : RED },
  ];
  const kgap = 4;
  const bw = (CW - kgap * 3) / 4;
  const bh = 20;
  kpis.forEach((k, i) => {
    const x = M + i * (bw + kgap);
    setFill(LIGHT);
    setDraw(BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, bw, bh, 1.5, 1.5, 'FD');
    setFill(k.color);
    doc.rect(x, y, 1.4, bh, 'F');
    setText(GRAYTEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.text(k.label.toUpperCase(), x + 4, y + 5.5);
    setText(k.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(k.value, x + 4, y + 12.5);
    setText(GRAYTEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    const subLines = doc.splitTextToSize(k.sub, bw - 7);
    doc.text(subLines.slice(0, 2), x + 4, y + 16.3);
  });
  y += bh + 8;

  // ══ ALERTAS CRÍTICAS ════════════════════════════════════════════════════════
  if (alertasCriticas.length > 0) {
    ensure(alertasCriticas.length * 8 + 12);
    setFill([253, 244, 244]);
    setDraw(RED);
    doc.setLineWidth(0.3);
    const boxH = 8 + alertasCriticas.length * 6.4;
    doc.roundedRect(M, y, CW, boxH, 1.5, 1.5, 'FD');

    setFill(RED);
    doc.roundedRect(M + 4, y + 3.2, 5, 5, 0.8, 0.8, 'F');
    setText(WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('!', M + 6.5, y + 6.9, { align: 'center' });

    setText(RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6);
    doc.text('ALERTAS CRÍTICAS — REQUIEREN ATENCIÓN INMEDIATA', M + 12, y + 6.7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText([120, 30, 30]);
    alertasCriticas.forEach((a, i) => {
      const lines = doc.splitTextToSize(`•  ${a.msg}`, CW - 8);
      doc.text(lines, M + 4, y + 12.5 + i * 6.4);
    });
    y += boxH + 8;
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
      ['Lavado de sustrato', `${p1.lavadoM3Dia} m³/día (días 1–${p1.lavadoDias})`, `${p2.lavadoM3Dia} m³/día (días 1–${p2.lavadoDias})`],
      ['Bolsas de sustrato disponibles', `${fmtNum(calc.bolsasDisp)} / ${fmtNum(calc.bolsasReq)}  (${calc.pctBolsas}%)`, '—'],
      ['Déficit de bolsas', `${fmtNum(calc.bolsasFaltantes)} bolsas`, '—'],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 54, textColor: CARBON }, 1: { cellWidth: (CW - 54) / 2 }, 2: { cellWidth: (CW - 54) / 2 } },
    headColor: VERDE,
  });

  // ══ 2. BLOQUES ═══════════════════════════════════════════════════════════════
  sectionHeader(2, 'Estado de Ejecución — Bloques e Infraestructura', CARBON);
  paragraph(`${calc.totalBloques} bloques con avance físico promedio de ${calc.avancePromedioBloques}%. ${calc.bloquesListos} listo(s) al 100% para siembra y ${calc.bloquesConAlerta.length} en adecuación.`);
  table({
    head: [['Bloque', 'Avance', 'Infra.', 'Riego', 'Cap. P1', 'Cap. P2', 'Principales ítems pendientes']],
    body: calc.bloqueStats.map((b) => {
      const infra = (b.grupos || []).find((g) => g.nombre === 'Infraestructura');
      const riego = (b.grupos || []).find((g) => g.nombre === 'Sistema de Riego');
      const pend = (b.pendientes || []).length
        ? resumenPendientes(b.pendientes, 3)
        : 'Ninguno — bloque completo';
      return [
        b.codigo, `${b.pct}%`, infra ? `${infra.pct}%` : '—', riego ? `${riego.pct}%` : '—',
        fmtNum(b.capacidadPlan1 || 0), fmtNum(b.capacidadPlan2 || 0), pend,
      ];
    }),
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 17 },
      1: { cellWidth: 19, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: CW - 102 },
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
        0: { cellWidth: 26, fontStyle: 'bold' },
        1: { cellWidth: CW - 26 - 48 },
        2: { cellWidth: 48 },
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
        2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'center', cellWidth: 22 },
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
      ['Riego Plan 1', (p1.riegoM3Dia || 0).toFixed(1), `${Math.round((p1.riegoM3Dia || 0) / cap * 100)}%`, 'Semanas 1–4'],
      ['Lavado sustrato Plan 1', (p1.lavadoM3Dia || 0).toFixed(1), `${Math.round((p1.lavadoM3Dia || 0) / cap * 100)}%`, `Días 1–${p1.lavadoDias}`],
      ['Riego Plan 2', (p2.riegoM3Dia || 0).toFixed(1), `${Math.round((p2.riegoM3Dia || 0) / cap * 100)}%`, 'Semanas 1–4'],
      ['Lavado sustrato Plan 2', (p2.lavadoM3Dia || 0).toFixed(1), `${Math.round((p2.lavadoM3Dia || 0) / cap * 100)}%`, `Días 1–${p2.lavadoDias}`],
      ['Pico máximo combinado', calc.peakCombinado.toFixed(1), `${Math.round(calc.peakCombinado / cap * 100)}%`, 'Fase crítica'],
      ['Margen disponible', calc.margen.toFixed(1), `${Math.round(calc.margen / cap * 100)}%`, calc.margen >= 0 ? 'OK' : 'DÉFICIT'],
    ],
    columnStyles: { 0: { cellWidth: CW - 26 - 26 - 36 }, 1: { halign: 'right', cellWidth: 26 }, 2: { halign: 'right', cellWidth: 26 }, 3: { cellWidth: 36 } },
    headColor: BLUE,
    didParseCell: (d) => {
      if (d.section === 'body' && d.row.index >= 4) { d.cell.styles.fontStyle = 'bold'; }
    },
  });
  paragraph(
    calc.margen >= 0
      ? `Capacidad suficiente: el pico combinado (${calc.peakCombinado.toFixed(1)} m³/día) deja ${calc.margen.toFixed(1)} m³/día de margen sobre los ${cap} m³/día instalados. Recomendación: ejecutar el lavado de sustrato de ambos planes en turno nocturno (10 PM – 4 AM) durante los primeros días.`
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
    columnStyles: { 0: { cellWidth: CW - 30 - 32 - 28 }, 1: { cellWidth: 30 }, 2: { halign: 'right', cellWidth: 32 }, 3: { cellWidth: 28, halign: 'center' } },
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
      columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 28 }, 3: { cellWidth: CW - 40 - 20 - 28 } },
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
      columnStyles: { 0: { cellWidth: 36, fontStyle: 'bold' }, 1: { cellWidth: 18, halign: 'center' }, 2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 26 }, 4: { cellWidth: CW - 36 - 18 - 16 - 26 } },
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
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42 }, 1: { cellWidth: CW - 42 } },
    headColor: CARBON,
  });
  subheading('Próximos Pasos Priorizados', VERDE);
  table({
    head: [['#', 'Acción', 'Responsable sugerido', 'Prioridad']],
    body: proximosPasos.map((p, i) => [String(i + 1), p.texto, p.resp, p.prioridad]),
    columnStyles: { 0: { cellWidth: 9, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: CW - 9 - 36 - 22 }, 2: { cellWidth: 36 }, 3: { cellWidth: 22, halign: 'center' } },
    headColor: VERDE,
    didParseCell: (d) => {
      if (d.section === 'body' && d.column.index === 3) {
        d.cell.styles.fontStyle = 'bold';
        d.cell.styles.textColor = d.cell.raw === 'ALTA' ? RED : AMBER;
      }
    },
  });

  // ══ PIE DE PÁGINA CON NUMERACIÓN ═════════════════════════════════════════════
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setDraw(BORDER);
    doc.setLineWidth(0.2);
    doc.line(M, PH - 12, PW - M, PH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setText(GRAYTEXT);
    doc.text(`Agroventure Capital — ${meta.finca} · Confidencial`, M, PH - 8);
    doc.text(fechaInforme, PW / 2, PH - 8, { align: 'center' });
    doc.text(`Página ${i} de ${total}`, PW - M, PH - 8, { align: 'right' });
  }

  doc.save(`Informe_Gerencia_Agroventure_${new Date().toISOString().slice(0, 10)}.pdf`);
}
