import { crearChecklistVacio } from '../utils/checklist';

function checklistBloque1y3() {
  return {
    grupos: [
      {
        nombre: 'Infraestructura',
        items: [
          { nombre: 'Adecuación del terreno', pct: 100, estado: 'CULMINADO', nota: '' },
          { nombre: 'Perforaciones', pct: 100, estado: 'CULMINADO', nota: '' },
          { nombre: 'Cimentación', pct: 100, estado: 'CULMINADO', nota: '' },
          { nombre: 'Estructuras (Canaletas, perfiles, cerchas, W, X, Guayas)', pct: 80, estado: 'EN_CURSO', nota: 'Falta hacer unas canaletas' },
          { nombre: 'Riostras', pct: 60, estado: 'EN_CURSO', nota: '' },
          { nombre: 'Antiheladas', pct: 80, estado: 'EN_CURSO', nota: 'Falta una zanja pequeña' },
          { nombre: 'Ground Cover invernadero (m²)', pct: 0, estado: 'PENDIENTE', nota: '' },
          { nombre: 'Ground Cover drenaje (m lineales)', pct: 0, estado: 'PENDIENTE', nota: '' },
          { nombre: 'Cubiertas plásticas', pct: 0, estado: 'PENDIENTE', nota: '' },
          { nombre: 'Bajantes', pct: 0, estado: 'PENDIENTE', nota: '' },
          { nombre: 'Tornillería', pct: 0, estado: 'PENDIENTE', nota: '' },
          { nombre: 'Malla perimetral', pct: 0, estado: 'PENDIENTE', nota: '' },
        ]
      },
      {
        nombre: 'Sistema de Riego',
        items: [
          { nombre: 'Zanjas de distribuidoras', pct: 100, estado: 'CULMINADO', nota: '' },
          { nombre: 'Distribución de válvulas y bigotes para la línea de riego', pct: 100, estado: 'CULMINADO', nota: '' },
          { nombre: 'Zanjas de antiheladas', pct: 100, estado: 'CULMINADO', nota: '' },
          { nombre: 'Estacas', pct: 50, estado: 'EN_CURSO', nota: 'No están al final de la línea' },
          { nombre: 'Líneas de goteo', pct: 0, estado: 'PENDIENTE', nota: '' },
        ]
      }
    ]
  };
}

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
      // Lavado de sustrato — 65 L por planta en total, primeros 12 días
      lavadoLtTotalPorPlanta: 65,       // 65 L por planta en total
      lavadoDias: 12,
      lavadoLtPorPlantaDia: 5.42,       // 65 / 12 L/planta/día
      lavadoM3Dia: 173.3,               // 5.42 × 32.000 / 1000
      // Riego primeras 4 semanas
      riegoCcPorPlantaDia: 600,
      riegoLtPorPlantaDia: 0.6,
      riegoM3Dia: 19.2,                 // 0.6 × 32.000 / 1000
      semanasRiego: 4,
    },
    plan2: {
      plantas: 110000,
      // Lavado de sustrato — 7 L por planta en total, primeros 12 días
      lavadoLtTotalPorPlanta: 7,        // 7 L por planta en total
      lavadoDias: 12,
      lavadoLtPorPlantaDia: 0.58,       // 7 / 12 L/planta/día
      lavadoM3Dia: 64.2,                // 0.58 × 110.000 / 1000
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
      infraestructura: crearChecklistVacio()
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
      infraestructura: crearChecklistVacio()
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
      infraestructura: crearChecklistVacio()
    },
    {
      id: "bloque_1",
      codigo: "Bloque 1",
      propietarioInfra: "Agroventure",
      propietarioPlantas: "Agroventure",
      area: 0,
      capacidadPlan1: 0,
      capacidadPlan2: 0,
      valvulas: 0,
      consumoAguaEst: 0,
      destinoNotas: "",
      fechaDisponibilidad: "",
      infraestructura: checklistBloque1y3()
    },
    {
      id: "bloque_3",
      codigo: "Bloque 3",
      propietarioInfra: "Agroventure",
      propietarioPlantas: "Agroventure",
      area: 0,
      capacidadPlan1: 0,
      capacidadPlan2: 0,
      valvulas: 0,
      consumoAguaEst: 0,
      destinoNotas: "",
      fechaDisponibilidad: "",
      infraestructura: checklistBloque1y3()
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

  // ─── Línea de Tiempo — Abastecimiento de Sustrato y Bolsas ────────────────
  cronologiaSustrato: [
    {
      id: "hito_s31",
      semana: 31,
      fecha: "2026-07-27",
      tipo: "ALERTA",
      estado: "PENDIENTE",
      titulo: "Llegada de 29.936 bolsas con sustrato de coco",
      descripcion: "Llegan 29.936 bolsas con sustrato de coco. De estas, 22.250 unidades se entregan a los sublicenciatarios en Chocontá. Para Agroventure Capital quedan únicamente 7.686 unidades, lo que genera un déficit inmediato para el Plan 1.",
      metricas: [
        { label: "Total llegada", valor: "29.936 bolsas" },
        { label: "Entregadas a sublicenciatarios (Chocontá)", valor: "22.250 bolsas" },
        { label: "Recibe Agroventure", valor: "7.686 bolsas" },
      ]
    },
    {
      id: "hito_s34",
      semana: 34,
      fecha: "2026-08-17",
      tipo: "HITO",
      estado: "PENDIENTE",
      titulo: "Llegada de 32.000 unidades de sustrato SIN bolsa",
      descripcion: "Llegan 32.000 unidades de sustrato de coco sin bolsa. Requiere gestionar la compra de las bolsas para poder utilizar este sustrato en la siembra.",
      metricas: [
        { label: "Sustrato sin bolsa", valor: "32.000 unidades" },
      ]
    },
    {
      id: "hito_compra",
      semana: null,
      fecha: "",
      tipo: "COMPRA",
      estado: "PENDIENTE",
      titulo: "Compra de bolsas y sustrato faltante para completar el proyecto",
      descripcion: "Se requiere generar la compra de 56.314 bolsas restantes para completar el proyecto de doble densidad de Agroventure Capital más el proyecto de Villapinzón. Además, se requieren 24.314 unidades de sustrato para completar todo, lo que corresponde a 656.478 litros de sustrato de coco.",
      metricas: [
        { label: "Bolsas por comprar", valor: "56.314 bolsas" },
        { label: "Sustrato por adquirir", valor: "24.314 unidades" },
        { label: "Volumen de coco", valor: "656.478 litros" },
      ]
    }
  ],

  decisiones: [
    {
      id: "dec_sustrato_s34",
      titulo: "Compra de 56.314 bolsas y 24.314 unidades de sustrato faltante",
      descripcion: "La llegada de la semana 31 (29.936 bolsas) dejó solo 7.686 unidades para Agroventure — 22.250 se entregaron a los sublicenciatarios en Chocontá. En la semana 34 llegan 32.000 unidades de sustrato SIN bolsa. Falta decidir y ejecutar la compra de 56.314 bolsas (doble densidad Agroventure + Villapinzón) y 24.314 unidades de sustrato (656.478 L de coco) para completar todo el proyecto.",
      vencimiento: "2026-08-15",
      responsable: "Gerencia / Compras / Logística",
      planContingencia: "Mientras se gestiona la compra, priorizar la siembra con las 7.686 bolsas disponibles (24% del Plan 1) y activar Plan 2 (bolsas 3L) para el resto de posiciones. Confirmar tiempos de entrega del proveedor de bolsas antes de la semana 34.",
      estado: "ABIERTA"
    }
  ],

  riesgos: [
    {
      id: "riesgo_deficit_sustrato",
      titulo: "Déficit de sustrato y bolsas para completar la siembra",
      descripcion: "De las 29.936 bolsas de la semana 31, 22.250 se entregaron a los sublicenciatarios en Chocontá, dejando solo 7.686 para Agroventure (24% del Plan 1). El sustrato de la semana 34 llega sin bolsa. Sin la compra oportuna de 56.314 bolsas y 24.314 unidades de sustrato, el proyecto de doble densidad y Villapinzón no se completa a tiempo.",
      impacto: "ALTO",
      probabilidad: "ALTA",
      responsable: "Compras / Logística / Gerencia",
      mitigacion: "Emitir la orden de compra de bolsas y sustrato antes de semana 33. Coordinar embolsado del sustrato que llega sin bolsa en semana 34. Coordinar con los sublicenciatarios de Chocontá la logística de las bolsas entregadas. Tener Plan 2 (bolsas 3L) listo como contingencia.",
      estado: "ABIERTO"
    }
  ],

  terceros: []
};
