import { actividades } from './actividades';
import { objetivos } from './objetivos';
import type { PresupuestoGeneral, PresupuestoObjetivo } from './types';

/**
 * Presupuesto del módulo de Marketing.
 *
 * Fuente única de verdad: `Actividad.presupuesto`. Los totales NUNCA se
 * escriben a mano en un componente o en otro archivo:
 *
 *   objetivo  → suma del presupuesto de sus actividades
 *   proyecto  → suma de los cinco objetivos
 *
 * No existe información real de ejecución presupuestal, por lo que
 * `ejecutado`, `disponible` y `porcentajeEjecucion` quedan sin valor
 * (la interfaz no muestra un porcentaje de ejecución inventado).
 */

export const PRESUPUESTO_TOTAL_ESPERADO = 18300000;

export function getPresupuestoActividad(actividadId: number): number {
  return actividades.find((a) => a.id === actividadId)?.presupuesto ?? 0;
}

export function getPresupuestoObjetivo(objetivoId: number): PresupuestoObjetivo {
  const total = actividades
    .filter((a) => a.objetivoId === objetivoId)
    .reduce((s, a) => s + a.presupuesto, 0);
  return { objetivoId, total };
}

export function getPresupuestosPorObjetivo(): PresupuestoObjetivo[] {
  return objetivos.map((o) => getPresupuestoObjetivo(o.id));
}

export function getPresupuestoTotal(): number {
  return actividades.reduce((s, a) => s + a.presupuesto, 0);
}

export function getPresupuestoPromedioObjetivo(): number {
  if (objetivos.length === 0) return 0;
  return Math.round(getPresupuestoTotal() / objetivos.length);
}

/** Porcentaje que representa un objetivo dentro del total del módulo. */
export function getPorcentajeDelTotal(objetivoId: number): number {
  const total = getPresupuestoTotal();
  if (total === 0) return 0;
  return Math.round((getPresupuestoObjetivo(objetivoId).total / total) * 1000) / 10;
}

/**
 * Presupuesto ejecutado. QUEDA PREPARADO: devuelve `undefined` mientras el
 * proyecto no registre ejecución real. Cuando exista, se puede calcular a
 * partir de `Actividad.avance` sin tocar los componentes.
 */
export function getPresupuestoEjecutado(objetivoId?: number): number | undefined {
  return undefined;
}

export function getPresupuestoDisponible(objetivoId?: number): number | undefined {
  return undefined;
}

export function getResumenPresupuesto(): PresupuestoGeneral {
  return {
    total: getPresupuestoTotal(),
    objetivos: objetivos.length,
    actividades: actividades.length,
    ejecutado: getPresupuestoEjecutado(),
    disponible: getPresupuestoDisponible(),
  };
}

/** Desglose de presupuesto de un objetivo: actividad → monto + total. */
export function getDesglosePresupuesto(objetivoId: number) {
  const acts = actividades.filter((a) => a.objetivoId === objetivoId);
  return {
    lineas: acts.map((a) => ({ id: a.id, nombre: a.nombre, presupuesto: a.presupuesto })),
    total: acts.reduce((s, a) => s + a.presupuesto, 0),
  };
}
