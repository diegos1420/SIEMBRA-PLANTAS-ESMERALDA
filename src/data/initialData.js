export const INITIAL_DATA = {
  meta: {
    finca: "Finca La Esmeralda",
    empresa: "Agroventure Capital",
    cultivo: "Arándano",

    // PLAN 1: Siembra Definitiva en Bolsa de 27L con Sustrato de Coco
    plan1Objetivo: 32000,
    bolsas27LDisponibles: 7686,
    bolsas27LFaltantesFase1: 24314,
    volumenDefinitivoL: 27,
    plan1PrecioPorPlanta: 752,          // COP por planta

    // PLAN 2 (Contingencia): Siembra Provisional en Bolsa de 3L con Sustrato Alternativo
    plan2Objetivo: 110000,
    volumenContingenciaL: 3,
    plan2PrecioPorPlanta: 700,          // COP por planta

    // Sustrato
    sustractoPrecioPorPlanta: 890,      // COP por planta — ambos planes

    // Totales
    totalPlantasObjetivo: 142000,       // Plan 1 (32.000) + Plan 2 (110.000)
    capacidadHidricaDiaria: 180,        // m³/día
  },

  planVersion: 'PLAN1',

  // ─── Plan de Riego — Primeras 4 Semanas ──────────────────────────────────
  planRiego: {
    plan1: {
      plantas: 32000,
      // Lavado de sustrato (solo Plan 1, primeros 12 días)
      lavadoLtTotalPorPlanta: 22,       // 22 L por planta en total
      lavadoDias: 12,
      lavadoLtPorPlantaDia: 1.85,       // 1.85 L/planta/día
      lavadoM3Dia: 59.2,                // 1.85 × 32.000 / 1000
      // Riego primeras 4 semanas
      riegoCcPorPlantaDia: 600,
      riegoLtPorPlantaDia: 0.6,
      riegoM3Dia: 19.2,                 // 0.6 × 32.000 / 1000
      semanasRiego: 4,
    },
    plan2: {
      plantas: 110000,
      // Riego primeras 4 semanas
      riegoCcPorPlantaDia: 600,
      riegoLtPorPlantaDia: 0.6,
      riegoM3Dia: 66,                   // 0.6 × 110.000 / 1000
      semanasRiego: 4,
    }
  },

  sustrato: {
    proveedorDefinitivo: "",
    bolsas27LDisponibles: 7686,
    bolsas27LRequeridasFase1: 32000,
    bolsas27LFaltantesFase1: 24314,
    sustratoContingencia: "Sustrato Alternativo de Vivero (Bolsa 3L)",
    entregadoM3: 0,
    totalM3: 0,
    puntoConexion: "",
    estado: "",
    requiereLavado: true,
    volumenAguaLavadoM3: 60,
  },

  // ─── Bloques reales Finca La Esmeralda ───────────────────────────────────
  bloques: [
    {
      id: "bloque_7",
      codigo: "Bloque 7",
      propietarioInfra: "Agroventure",
      propietarioPlantas: "Agroventure",
      area: 0,
      capacidadPlan1: 15500,
      capacidadPlan2: 196000,
      valvulas: 0,
      consumoAguaEst: 9,
      destinoNotas: "",
      fechaDisponibilidad: "",
      infraestructura: { techo: false, cubierta: false, tuberia: false, bigotes: false, goteros: false, lineas: false, antiheladas: false }
    },
    {
      id: "bloque_4",
      codigo: "Bloque 4",
      propietarioInfra: "Agroventure",
      propietarioPlantas: "Agroventure",
      area: 0,
      capacidadPlan1: 10048,
      capacidadPlan2: 125000,
      valvulas: 0,
      consumoAguaEst: 6,
      destinoNotas: "",
      fechaDisponibilidad: "",
      infraestructura: { techo: false, cubierta: false, tuberia: false, bigotes: false, goteros: false, lineas: false, antiheladas: false }
    },
    {
      id: "bloque_2",
      codigo: "Bloque 2",
      propietarioInfra: "Agroventure",
      propietarioPlantas: "Agroventure",
      area: 0,
      capacidadPlan1: 6452,
      capacidadPlan2: 64350,
      valvulas: 0,
      consumoAguaEst: 4,
      destinoNotas: "",
      fechaDisponibilidad: "",
      infraestructura: { techo: false, cubierta: false, tuberia: false, bigotes: false, goteros: false, lineas: false, antiheladas: false }
    }
  ],

  siembras: [],

  insumos: [],

  costos: [
    {
      id: "c1",
      concepto: "Servicio de Siembra Plan 1 — 32.000 plantas × $752/planta (Bolsa 27L Coco)",
      centroCosto: "Plan 1 Definitivo",
      bloqueId: "",
      propietario: "Agroventure",
      montoCOP: 24064000,               // 32.000 × $752
      estadoFlujoCaja: "PENDIENTE",
      esCritico: true,
      notas: "Costo de siembra (instalación) por planta: $752 COP × 32.000 plantas = $24.064.000 COP."
    },
    {
      id: "c2",
      concepto: "Servicio de Siembra Plan 2 — 110.000 plantas × $700/planta (Bolsa 3L Contingencia)",
      centroCosto: "Plan 2 Contingencia",
      bloqueId: "",
      propietario: "Agroventure",
      montoCOP: 77000000,               // 110.000 × $700
      estadoFlujoCaja: "PENDIENTE",
      esCritico: true,
      notas: "Costo de siembra (instalación) por planta: $700 COP × 110.000 plantas = $77.000.000 COP."
    },
    {
      id: "c3",
      concepto: "Adquisición de Sustrato Plan 1 — 32.000 posiciones × $890/planta",
      centroCosto: "Plan 1 Definitivo",
      bloqueId: "",
      propietario: "Agroventure",
      montoCOP: 28480000,               // 32.000 × $890
      estadoFlujoCaja: "PENDIENTE",
      esCritico: true,
      notas: "Costo de adquisición del sustrato por posición de planta: $890 COP × 32.000 plantas = $28.480.000 COP."
    },
    {
      id: "c4",
      concepto: "Adquisición de Sustrato Plan 2 — 110.000 posiciones × $890/planta",
      centroCosto: "Plan 2 Contingencia",
      bloqueId: "",
      propietario: "Agroventure",
      montoCOP: 97900000,               // 110.000 × $890
      estadoFlujoCaja: "PENDIENTE",
      esCritico: false,
      notas: "Costo de adquisición del sustrato por posición de planta: $890 COP × 110.000 plantas = $97.900.000 COP."
    }
  ],

  tareas: [],

  decisiones: [
    {
      id: "dec_sustrato_s34",
      titulo: "Destino de las 32.000 bolsas con sustrato — Semana 34",
      descripcion: "En la semana 34 llegarían 32.000 bolsas adicionales con sustrato de coco (complemento para completar las 32.000 del Plan 1). A la fecha no se ha tomado la decisión sobre si el lote llega directamente a Finca La Esmeralda o se desvía a Villapinzón. Actualmente solo hay 7.686 bolsas disponibles en finca.",
      vencimiento: "2026-08-22",
      responsable: "Gerencia / Logística",
      planContingencia: "Si las bolsas van a Villapinzón, activar Plan 2 (bolsas 3L) para las 24.314 posiciones restantes del Plan 1 hasta que lleguen a finca. Coordinar transporte adicional si es necesario.",
      estado: "ABIERTA"
    }
  ],

  riesgos: [
    {
      id: "riesgo_sustrato_s34",
      titulo: "Retraso o desvío de las 32.000 bolsas de sustrato — Semana 34",
      descripcion: "Si las 32.000 bolsas con sustrato que llegan en la semana 34 se destinan a Villapinzón en lugar de Finca La Esmeralda, el Plan 1 queda incompleto con solo 7.686 posiciones (24%) y se debe activar contingencia.",
      impacto: "ALTO",
      probabilidad: "MEDIA",
      responsable: "Logística / Gerencia",
      mitigacion: "Confirmar destino con proveedor antes de semana 33. Tener Plan 2 (bolsas 3L) listo para activar en los tres bloques. Gestionar transporte desde Villapinzón si aplica.",
      estado: "ABIERTO"
    }
  ],

  terceros: []
};
