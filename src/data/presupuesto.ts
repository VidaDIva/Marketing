import type { PresupuestoGeneral, PresupuestoObjetivo } from './types';

interface CifraObjetivo {
  total: number;
  avance: number;
}

const cifras: CifraObjetivo[] = [
  { total: 2850000, avance: 25 },
  { total: 3050000, avance: 15 },
  { total: 3950000, avance: 5 },
  { total: 3700000, avance: 3 },
  { total: 4750000, avance: 2 },
];

export const presupuestoPorObjetivo: PresupuestoObjetivo[] = cifras.map((c, i) => {
  const ejecutado = Math.round((c.total * c.avance) / 100);
  const pendiente = c.total - ejecutado;
  return {
    objetivoId: i + 1,
    total: c.total,
    ejecutado,
    pendiente,
    porcentajeEjecucion: Math.round((ejecutado / c.total) * 1000) / 10,
  };
});

const totalGeneral = cifras.reduce((s, c) => s + c.total, 0);
const ejecutadoGeneral = presupuestoPorObjetivo.reduce((s, p) => s + p.ejecutado, 0);

export const presupuestoGeneral: PresupuestoGeneral = {
  total: totalGeneral,
  ejecutado: ejecutadoGeneral,
  pendiente: totalGeneral - ejecutadoGeneral,
  porcentajeEjecucion: Math.round((ejecutadoGeneral / totalGeneral) * 1000) / 10,
};

export function getPresupuestoObjetivo(objetivoId: number): PresupuestoObjetivo | undefined {
  return presupuestoPorObjetivo.find((p) => p.objetivoId === objetivoId);
}