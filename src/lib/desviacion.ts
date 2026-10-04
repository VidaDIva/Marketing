/**
 * ============================================================
 *  DESVIACIÓN = AVANCE REAL − AVANCE PROGRAMADO
 * ============================================================
 *
 *  Compara lo ejecutado (registro manual, `lib/avance-real.ts`) con lo que el
 *  cronograma decía que debería estar ejecutado a la fecha de corte
 *  (`lib/progreso.ts`).
 *
 *      desviación = avanceReal − avanceProgramado      (en puntos porcentuales)
 *
 *  Reglas:
 *  - Si falta cualquiera de los dos lados, NO hay desviación (`null`): no se
 *    compara un dato real contra nada.
 *  - `avanceReal` es el promedio de las actividades REPORTADAS del conjunto, y
 *    `avanceProgramado` el promedio de TODAS. Para que la comparación sea justa,
 *    ambos se calculan sobre las mismas actividades: las reportadas. Por eso
 *    aquí el avance programado se recalcula sobre ese subconjunto en vez de
 *    usar el valor agregado de todo el objetivo.
 *  - El semáforo usa un umbral de ±5 puntos: dentro de esa banda la actividad
 *    se considera "en línea". Es un criterio de lectura, no un dato del
 *    proyecto, y por eso el umbral es una constante visible.
 */

import { actividades } from '../data/actividades';
import { objetivos } from '../data/objetivos';
import { getAvanceProgramado } from './progreso';

/** Puntos de tolerancia para considerar que la actividad va "en línea". */
export const UMBRAL_EN_LINEA = 5;

export type Semforo = 'adelantado' | 'en-linea' | 'atrasado' | 'sin-dato';

export interface ResumenDesviacion {
  total: number;
  /** Actividades con avance real reportado (las que se pueden comparar). */
  comparables: number;
  adelantado: number;
  enLinea: number;
  atrasado: number;
  sinDato: number;
  /** Desviación promedio en puntos, solo sobre las comparables. */
  promedio: number | null;
  /** peor = desviación más negativa (la que más se atrasó). */
  peor: number | null;
  mejor: number | null;
}

const redondear = (n: number, d = 1): number => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/** Semáforo de una desviación en puntos. */
export function semforoDe(desviacion: number | null): Semforo {
  if (desviacion === null) return 'sin-dato';
  if (desviacion >= UMBRAL_EN_LINEA) return 'adelantado';
  if (desviacion <= -UMBRAL_EN_LINEA) return 'atrasado';
  return 'en-linea';
}

/**
 * Desviación en texto para tablas: `+5 pp`, `-12.5 pp` o `—` si no hay dato.
 * Las tablas renderizan strings, así que el color lo aporta `DesviacionPill`.
 */
export function formatDesviacion(desviacion: number | null): string {
  if (desviacion === null) return '—';
  const signo = desviacion > 0 ? '+' : '';
  return `${signo}${redondear(desviacion, 1)} pp`;
}

/** Desviación de una actividad, o `null` si no hay avance real reportado. */
export function getDesviacion(actividadId: number): number | null {
  const act = actividades.find((a) => a.id === actividadId);
  if (!act || typeof act.avance !== 'number') return null;
  return redondear(act.avance - getAvanceProgramado(act), 1);
}

/** Semáforo de una actividad. */
export function getSemforo(actividadId: number): Semforo {
  return semforoDe(getDesviacion(actividadId));
}

/**
 * Avance real y avance programado de un conjunto de actividades, calculados
 * ambos sobre el MISMO subconjunto (las que tienen avance real reportado).
 * Si no hay ninguna reportada, ambosAvances devuelve `null`.
 */
export function ambosAvances(acts: { id: number; avance?: number }[]): {
  real: number | null;
  programado: number | null;
  desviacion: number | null;
} {
  const conDato = acts.filter((a) => typeof a.avance === 'number');
  if (conDato.length === 0) return { real: null, programado: null, desviacion: null };
  const completas = conDato.map((a) => actividades.find((x) => x.id === a.id)).filter((a) => a !== undefined);
  const real = redondear(conDato.reduce((s, a) => s + (a.avance ?? 0), 0) / conDato.length, 1);
  const programado = redondear(
    completas.reduce((s, a) => s + getAvanceProgramado(a), 0) / completas.length,
    1,
  );
  return { real, programado, desviacion: redondear(real - programado, 1) };
}

/** Desviación de un objetivo (sobre sus actividades reportadas). */
export function getDesviacionObjetivo(objetivoId: number): number | null {
  return ambosAvances(actividades.filter((a) => a.objetivoId === objetivoId)).desviacion;
}

/** Desviación de las actividades de un participante (participación > 0). */
export function getDesviacionParticipante(participanteId: number): number | null {
  return ambosAvances(
    actividades.filter((a) => a.participaciones.some((p) => p.participanteId === participanteId && p.porcentaje > 0)),
  ).desviacion;
}

/** Resumen de desviación de un conjunto de actividades. */
export function getResumenDesviacion(acts: { id: number; avance?: number }[] = actividades): ResumenDesviacion {
  const desviaciones = acts.map((a) => getDesviacion(a.id));
  const conDato = desviaciones.filter((d): d is number => d !== null);
  const conteo = (s: Semforo) => desviaciones.filter((d) => semforoDe(d) === s).length;

  return {
    total: acts.length,
    comparables: conDato.length,
    adelantado: conteo('adelantado'),
    enLinea: conteo('en-linea'),
    atrasado: conteo('atrasado'),
    sinDato: desviaciones.length - conDato.length,
    promedio: conDato.length === 0 ? null : redondear(conDato.reduce((s, d) => s + d, 0) / conDato.length, 1),
    peor: conDato.length === 0 ? null : Math.min(...conDato),
    mejor: conDato.length === 0 ? null : Math.max(...conDato),
  };
}

/** Desviación de todo el módulo, con el detalle por objetivo. */
export function getDesviacionGlobal(): ResumenDesviacion & { porObjetivo: { objetivoId: number; valor: number | null }[] } {
  return {
    ...getResumenDesviacion(),
    porObjetivo: objetivos.map((o) => ({ objetivoId: o.id, valor: getDesviacionObjetivo(o.id) })),
  };
}
