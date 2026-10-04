/**
 * Utilidades de fechas puras (sin dependencias de Astro).
 *
 * El documento de referencia define las actividades, sus participantes y su
 * presupuesto, pero NO define fechas por actividad. Para que el cronograma
 * (Gantt) siga funcionando, las fechas se DERIVAN de la ventana de cada
 * objetivo: se reparte la ventana de forma secuencial entre sus actividades,
 * en el orden en que aparecen en el documento.
 *
 * Esto es un dato derivado y determinista, no un dato inventado de ejecución.
 * Si más adelante el proyecto registra fechas reales por actividad, basta con
 * escribirlas en `data/actividades.ts` y este helper deja de usarse.
 */

const DAY_MS = 86400000;

export function parseIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  return toIso(new Date(parseIso(iso).getTime() + days * DAY_MS));
}

export function diffDays(fromIso: string, toIso_: string): number {
  return Math.round((parseIso(toIso_).getTime() - parseIso(fromIso).getTime()) / DAY_MS);
}

export interface Ventana {
  fechaInicio: string;
  fechaFinal: string;
}

/**
 * Reparte la ventana [inicio, fin] en `n` tramos consecutivos.
 * El tramo i empieza en `inicio + floor(i*d/n)` y termina en
 * `inicio + floor((i+1)*d/n) - 1`, garantizando `final >= inicio`.
 */
export function distribuirVentana(inicio: string, fin: string, n: number): Ventana[] {
  const dias = Math.max(0, diffDays(inicio, fin));
  if (n <= 0) return [];
  if (dias === 0) return Array.from({ length: n }, () => ({ fechaInicio: inicio, fechaFinal: fin }));

  return Array.from({ length: n }, (_, i) => {
    const offsetInicio = Math.floor((i * dias) / n);
    const offsetFin = Math.max(offsetInicio, Math.floor(((i + 1) * dias) / n) - 1);
    return {
      fechaInicio: addDays(inicio, offsetInicio),
      fechaFinal: addDays(inicio, Math.min(dias, offsetFin)),
    };
  });
}
