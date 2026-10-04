/**
 * AVANCE PROGRAMADO (CRONOGRAMA) ≠ AVANCE REAL
 * =============================================
 *
 * El proyecto NO tiene datos de ejecución: las actividades no tienen `estado`
 * ni `avance`. Lo que sí existe son las fechas planificadas.
 *
 * Por eso aquí se calcula el "avance programado": una medida de CALENDARIO que
 * indica cuánto del tiempo planificado de una actividad se ha consumido hasta
 * la fecha de corte. No dice que el trabajo se haya hecho, solo que su ventana
 * de tiempo ya transcurrió.
 *
 * Reglas de la interfaz (importantes para no mentir con los datos):
 * - "Avance programado" → este módulo, siempre rotulado como cronograma.
 * - "Avance real"       → `getAvanceCalculado()` de `lib/participacion.ts`,
 *                         que devuelve `null` mientras no haya dato real y la
 *                         interfaz muestra "No calculado".
 *
 * La fecha de corte vive en `data/proyecto.ts` (`fechaCorte`). Con la fecha de
 * cierre del módulo (2026-09-12) el resultado es 100 % en todas las
 * actividades: el cronograma quedó completamente consumido. Para ver una foto
 * intermedia basta cambiar ese valor (p. ej. '2026-09-05' → 72.22 % promedio).
 */

import { actividades } from '../data/actividades';
import { objetivos } from '../data/objetivos';
import { participantes } from '../data/participantes';
import { proyecto } from '../data/proyecto';
import type { Actividad } from '../data/types';
import { diffDays } from './fechas';

/** Fecha de corte usada para el cálculo (cierre del módulo de Marketing). */
export const FECHA_CORTE: string = proyecto.fechaCorte;

const redondear = (n: number, decimales = 2): number => {
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
};

/**
 * Avance programado de una actividad: porcentaje de su ventana temporal ya
 * consumida a la fecha de corte.
 *   span         = duración planificada en días (mínimo 1)
 *   transcurrido = días entre el inicio y la fecha de corte, acotados al span
 */
export function getAvanceProgramado(actividad: Actividad, corte: string = FECHA_CORTE): number {
  const span = Math.max(1, diffDays(actividad.fechaInicio, actividad.fechaFinal));
  const transcurrido = Math.min(span, Math.max(0, diffDays(actividad.fechaInicio, corte)));
  return redondear((transcurrido / span) * 100);
}

/**
 * Texto corto para la leyenda de la interfaz. Deja explícito que la cifra es
 * de calendario y no de ejecución.
 */
export function getLeyendaProgreso(corte: string = FECHA_CORTE): string {
  return `Avance programado: porcentaje del tiempo planificado consumido hasta la fecha de corte (${corte}). Es una medida de calendario, no avance real de ejecución.`;
}

/** Avance programado del objetivo: promedio simple de sus actividades. */
export function getAvanceProgramadoObjetivo(
  objetivoId: number,
  corte: string = FECHA_CORTE,
): number {
  const acts = actividades.filter((a) => a.objetivoId === objetivoId);
  if (acts.length === 0) return 0;
  return redondear(acts.reduce((s, a) => s + getAvanceProgramado(a, corte), 0) / acts.length);
}

/** Avance programado del módulo: promedio simple de las 36 actividades. */
export function getAvanceProgramadoGlobal(corte: string = FECHA_CORTE): number {
  if (actividades.length === 0) return 0;
  return redondear(
    actividades.reduce((s, a) => s + getAvanceProgramado(a, corte), 0) / actividades.length,
  );
}

/**
 * Avance programado de un integrante.
 *
 * OJO con el denominador: a diferencia de la participación general (que divide
 * entre TODAS las actividades del módulo, contando 0 % cuando no participa),
 * aquí el promedio es solo sobre las actividades en las que el integrante
 * tiene participación mayor a 0. Es decir: qué parte del tiempo planificado de
 * SU trabajo ya transcurrió.
 */
export function getAvanceProgramadoParticipante(
  participanteId: number,
  corte: string = FECHA_CORTE,
): number {
  const propias = actividades.filter((a) =>
    a.participaciones.some((p) => p.participanteId === participanteId && p.porcentaje > 0),
  );
  if (propias.length === 0) return 0;
  return redondear(propias.reduce((s, a) => s + getAvanceProgramado(a, corte), 0) / propias.length);
}

/** Avance programado por objetivo, listo para tablas ({ objetivoId, valor }). */
export function getAvanceProgramadoPorObjetivo(
  corte: string = FECHA_CORTE,
): { objetivoId: number; valor: number }[] {
  return objetivos.map((o) => ({ objetivoId: o.id, valor: getAvanceProgramadoObjetivo(o.id, corte) }));
}

/** Avance programado de cada participante (incluye externos). */
export function getAvanceProgramadoPorParticipante(
  corte: string = FECHA_CORTE,
): { participanteId: number; valor: number }[] {
  return participantes.map((p) => ({
    participanteId: p.id,
    valor: getAvanceProgramadoParticipante(p.id, corte),
  }));
}
