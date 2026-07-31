export const ITEMS_INFRAESTRUCTURA = [
  'Adecuación del terreno',
  'Perforaciones',
  'Cimentación',
  'Estructuras (Canaletas, perfiles, cerchas, W, X, Guayas)',
  'Riostras',
  'Antiheladas',
  'Ground Cover invernadero (m²)',
  'Ground Cover drenaje (m lineales)',
  'Cubiertas plásticas',
  'Bajantes',
  'Tornillería',
  'Malla perimetral',
];

export const ITEMS_SISTEMA_RIEGO = [
  'Zanjas de distribuidoras',
  'Distribución de válvulas y bigotes para la línea de riego',
  'Zanjas de antiheladas',
  'Estacas',
  'Líneas de goteo',
];

export function crearChecklistVacio() {
  return {
    grupos: [
      { nombre: 'Infraestructura', items: ITEMS_INFRAESTRUCTURA.map(nombre => ({ nombre, pct: 0, estado: 'PENDIENTE', nota: '' })) },
      { nombre: 'Sistema de Riego', items: ITEMS_SISTEMA_RIEGO.map(nombre => ({ nombre, pct: 0, estado: 'PENDIENTE', nota: '' })) },
    ]
  };
}

export function getGruposChecklist(bloque) {
  return bloque?.infraestructura?.grupos || [];
}

export function getGroupPct(grupo) {
  if (!grupo?.items?.length) return 0;
  const sum = grupo.items.reduce((s, i) => s + (i.pct || 0), 0);
  return Math.round(sum / grupo.items.length);
}

export function getBlockPct(bloque) {
  const grupos = getGruposChecklist(bloque);
  const allItems = grupos.flatMap(g => g.items || []);
  if (!allItems.length) return 0;
  const sum = allItems.reduce((s, i) => s + (i.pct || 0), 0);
  return Math.round(sum / allItems.length);
}

export function isBlockReady(bloque) {
  const grupos = getGruposChecklist(bloque);
  const allItems = grupos.flatMap(g => g.items || []);
  return allItems.length > 0 && allItems.every(i => (i.pct || 0) === 100);
}

export function getPendientes(bloque) {
  const grupos = getGruposChecklist(bloque);
  const pendientes = [];
  grupos.forEach(g => {
    (g.items || []).forEach(i => {
      if ((i.pct || 0) < 100) {
        pendientes.push({ grupo: g.nombre, ...i });
      }
    });
  });
  return pendientes;
}

export const ESTADO_COLORS = {
  CULMINADO: { text: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  EN_CURSO: { text: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  PENDIENTE: { text: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

export const ESTADO_LABELS = {
  CULMINADO: 'Culminado',
  EN_CURSO: 'En Curso',
  PENDIENTE: 'Pendiente',
};
