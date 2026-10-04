import { actividades } from '../data/actividades';
import { objetivos } from '../data/objetivos';
import { equipoPrincipal, participantes } from '../data/participantes';
import type { Actividad, Participacion, Participante } from '../data/types';
import { getAvanceProgramadoObjetivo, getAvanceProgramadoParticipante } from './progreso';

/**
 * ============================================================
 *  LÓGICA DE PARTICIPACIÓN  ·  ERP Almacenes Éxito · Marketing
 * ============================================================
 *
 *  PARTICIPACIÓN ≠ AVANCE
 *
 *  - Participación: qué porcentaje de una actividad corresponde a cada
 *    participante. Está definida en los datos del proyecto
 *    (Actividad.participaciones) y la suma por actividad es 100 %.
 *    Un integrante puede tener 50 % de una actividad y esa actividad
 *    seguir "Pendiente" o "No iniciada": son hechos distintos.
 *
 *  - Avance: cuánto se ha ejecutado realmente. Se reporta a mano en
 *    `data/avance-real.json` (ver `lib/avance-real.ts`). Mientras no se registre,
 *    estas funciones devuelven `null` y la interfaz muestra
 *    "Avance no calculado" junto con la cobertura, en lugar de un porcentaje
 *    ficticio. `null` significa SIN DATO, nunca 0 %.
 *
 *  FÓRMULAS
 *
 *  1) Participación promedio por objetivo (promedio simple sobre TODAS las
 *     actividades del objetivo, contando 0 % cuando el integrante no participa):
 *
 *        participacion = Σ porcentajes del integrante / nº de actividades del objetivo
 *
 *     Ejemplo (Objetivo 1, 6 actividades, Juan David Sarrazola en 3):
 *        (100 + 50 + 33.33) / 6 = 30.55 %
 *
 *     No se suman los porcentajes entre sí (varias actividades habría que
 *     aplicar la fórmula sobre el conjunto completo y con el denominador
 *     correcto, por eso se usa el promedio).
 *
 *  2) Participación general del integrante (misma fórmula sobre todas las
 *     actividades del módulo):
 *
 *        participacion = Σ porcentajes del integrante / total de actividades
 *
 *  3) Porcentaje de participación en una actividad: dato directo
 *     (Actividad.participaciones). Si el participante no aparece, es 0 %.
 *
 *  Redondeo: 2 decimales.
 */

export interface ParticipacionDetalle {
  participante: Participante;
  porcentaje: number;
  /** 'equipo' | 'externo' */
  tipo: Participante['tipo'];
}

export interface EstadoContador {
  completadas: number;
  enProceso: number;
  pendientes: number;
  retrasadas: number;
  /** Actividades sin estado registrado (no hay dato de ejecución). */
  sinEstado: number;
  total: number;
}

export interface ResumenObjetivo {
  objetivoId: number;
  totalActividades: number;
  estados: EstadoContador;
  estado: string;
  presupuesto: number;
  /** Participación promedio por integrante del equipo principal dentro del objetivo. */
  participacionEquipo: ParticipacionDetalle[];
  /** Participación promedio de los participantes externos dentro del objetivo. */
  participacionExternos: ParticipacionDetalle[];
  /**
   * Avance real del objetivo: promedio de las actividades CON ejecución
   * reportada. `null` = ninguna tiene dato (no es 0 %).
   */
  avanceReal: number | null;
  /** Cuántas actividades del objetivo tienen avance real reportado. */
  coberturaAvance: { reportadas: number; total: number };
  /**
   * Avance PROGRAMADO (cronograma) del objetivo a la fecha de corte.
   * Es calendario, NO ejecución: ver `lib/progreso.ts`.
   */
  avanceProgramado: number;
}

export interface ResumenParticipante {
  participante: Participante;
  /** Participación promedio sobre todas las actividades del módulo. */
  participacionGeneral: number;
  /** Actividades en las que el participante tiene algún porcentaje (> 0). */
  actividadesAsignadas: number;
  /** De las anteriores, cuántas son compartidas con otro(s) participante(s). */
  actividadesCompartidas: number;
  /** IDs de objetivos en los que participa. */
  objetivos: number[];
  /** Participación promedio por objetivo (solo los objetivos donde participa tiene sentido mostrarlo). */
  participacionPorObjetivo: { objetivoId: number; porcentaje: number }[];
  /**
   * Avance PROGRAMADO (cronograma) de las actividades del participante.
   * OJO: el promedio es solo sobre sus actividades (participación > 0), a
   * diferencia de `participacionGeneral` que divide entre todas. Calendario,
   * NO ejecución.
   */
  avanceProgramado: number;
  /**
   * Avance real de las actividades del participante: promedio de las que
   * tienen ejecución reportada. `null` = sin dato (no 0 %).
   */
  avanceReal: number | null;
  /** Cuántas de sus actividades tienen avance real reportado. */
  coberturaAvance: { reportadas: number; total: number };
}

const redondear = (n: number, decimales = 2): number => {
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
};

/** Índice de lookup "actividadId:participanteId" → porcentaje. */
let cacheParticipacion: Map<string, number> | null = null;

function porcentajeEn(actividad: Actividad, participanteId: number): number {
  if (!cacheParticipacion) {
    cacheParticipacion = new Map();
    for (const act of actividades) {
      for (const p of act.participaciones) {
        cacheParticipacion.set(`${act.id}:${p.participanteId}`, p.porcentaje);
      }
    }
  }
  return cacheParticipacion.get(`${actividad.id}:${participanteId}`) ?? 0;
}

/**
 * Porcentaje de participación de un participante en una actividad (0 % si no participa).
 */
export function getPorcentajeParticipacion(actividadId: number, participanteId: number): number {
  const act = actividades.find((a) => a.id === actividadId);
  if (!act) return 0;
  return porcentajeEn(act, participanteId);
}

/**
 * Participación promedio de un integrante dentro de un objetivo.
 * Fórmula: Σ % del integrante / nº de actividades del objetivo.
 */
export function getParticipacionPorObjetivo(objetivoId: number, participanteId: number): number {
  const acts = getActividadesPorObjetivo(objetivoId);
  if (acts.length === 0) return 0;
  const suma = acts.reduce((s, a) => s + porcentajeEn(a, participanteId), 0);
  return redondear(suma / acts.length);
}

/**
 * Participación general de un integrante en todo el módulo.
 * Fórmula: Σ % del integrante / total de actividades del módulo.
 */
export function getParticipacionGeneral(participanteId: number): number {
  if (actividades.length === 0) return 0;
  const suma = actividades.reduce((s, a) => s + porcentajeEn(a, participanteId), 0);
  return redondear(suma / actividades.length);
}

/** Actividades en las que el participante tiene participación (> 0 %). */
export function getActividadesPorParticipante(participanteId: number): Actividad[] {
  return actividades.filter((a) => porcentajeEn(a, participanteId) > 0);
}

/** Actividades de un objetivo. */
export function getActividadesPorObjetivo(objetivoId: number): Actividad[] {
  return actividades.filter((a) => a.objetivoId === objetivoId);
}

/** Actividades con más de un participante (trabajo compartido). */
export function getActividadesCompartidas(): Actividad[] {
  return actividades.filter((a) => a.participaciones.length > 1);
}

/** Actividades que tienen al menos un integrante del equipo principal. */
export function getActividadesConEquipo(): Actividad[] {
  const ids = new Set(equipoPrincipal.map((p) => p.id));
  return actividades.filter((a) => a.participaciones.some((p) => ids.has(p.participanteId)));
}

/** Participantes de una actividad, resueltos y ordenados por % descendente. */
export function getParticipantesActividad(actividadId: number): ParticipacionDetalle[] {
  const act = actividades.find((a) => a.id === actividadId);
  if (!act) return [];
  return act.participaciones
    .map((p: Participacion) => {
      const participante = participantes.find((x) => x.id === p.participanteId);
      if (!participante) return null;
      return { participante, porcentaje: p.porcentaje, tipo: participante.tipo };
    })
    .filter((x): x is ParticipacionDetalle => x !== null)
    .sort((a, b) => b.porcentaje - a.porcentaje);
}

/** Participantes del objetivo, en el orden del equipo principal y luego los externos. */
function participantesOrdenados(): Participante[] {
  return [...equipoPrincipal, ...participantes.filter((p) => p.tipo === 'externo')];
}

function detalle(participante: Participante, porcentaje: number): ParticipacionDetalle {
  return { participante, porcentaje: redondear(porcentaje), tipo: participante.tipo };
}

/** Resumen de participación (equipo + externos) de un objetivo. */
export function getResumenObjetivo(objetivoId: number): ResumenObjetivo {
  const acts = getActividadesPorObjetivo(objetivoId);
  const estados = getContadorEstados(acts);
  const todos = participantesOrdenados().map((p) =>
    detalle(p, getParticipacionPorObjetivo(objetivoId, p.id)),
  );
  return {
    objetivoId,
    totalActividades: acts.length,
    estados,
    estado: getEstadoDesdeContador(estados),
    presupuesto: acts.reduce((s, a) => s + a.presupuesto, 0),
    participacionEquipo: todos.filter((d) => d.tipo === 'equipo'),
    participacionExternos: todos.filter((d) => d.tipo === 'externo'),
    avanceReal: getAvanceCalculado(acts),
    coberturaAvance: getCoberturaAvanceReal(acts),
    avanceProgramado: getAvanceProgramadoObjetivo(objetivoId),
  };
}

export function getContadorEstados(acts: Actividad[]): EstadoContador {
  const c: EstadoContador = {
    completadas: 0,
    enProceso: 0,
    pendientes: 0,
    retrasadas: 0,
    sinEstado: 0,
    total: acts.length,
  };
  for (const a of acts) {
    switch (a.estado) {
      case 'Completada':
        c.completadas++;
        break;
      case 'En proceso':
        c.enProceso++;
        break;
      case 'No iniciada':
        c.pendientes++;
        break;
      case 'Retrasada':
        c.retrasadas++;
        break;
      default:
        c.sinEstado++;
    }
  }
  return c;
}

/**
 * Estado del objetivo CALCULADO a partir del estado real de sus actividades.
 * - Sin estados registrados → "Sin estado registrado" (no se inventa estado).
 * - Todas completadas → "Completada".
 * - Alguna en proceso o retrasada → "En proceso".
 * - Todas las que tienen estado están "No iniciada" → "Pendiente".
 */
export function getEstadoObjetivo(objetivoId: number): string {
  const conEstado = getActividadesPorObjetivo(objetivoId).filter((a) => a.estado);
  if (conEstado.length === 0) return 'Sin estado registrado';
  return getEstadoDesdeContador(getContadorEstados(getActividadesPorObjetivo(objetivoId)));
}

function getEstadoDesdeContador(c: EstadoContador): string {
  if (c.total > 0 && c.sinEstado === c.total) return 'Sin estado registrado';
  if (c.completadas === c.total) return 'Completada';
  if (c.enProceso > 0 || c.retrasadas > 0) return 'En proceso';
  if (c.completadas > 0) return 'En proceso';
  return 'Pendiente';
}

/**
 * Avance real, o `null` si no hay ningún dato de ejecución.
 *
 * Se calcula sobre las actividades que TIENEN avance reportado en
 * `data/avance-real.json`, nunca sobre todas: sin dato no es 0 %. Por eso la
 * interfaz acompaña siempre el valor con la cobertura
 * (`getCoberturaAvanceReal`), que dice cuántas actividades se reportaron.
 */
export function getAvanceCalculado(acts: Actividad[] = actividades): number | null {
  const conDato = acts.filter((a) => typeof a.avance === 'number');
  if (conDato.length === 0) return null;
  const suma = conDato.reduce((s, a) => s + (a.avance ?? 0), 0);
  return redondear(suma / conDato.length, 1);
}

/** Cuántas actividades tienen avance real reportado (y cuántas no). */
export function getCoberturaAvanceReal(acts: Actividad[] = actividades): {
  reportadas: number;
  total: number;
} {
  return { reportadas: acts.filter((a) => typeof a.avance === 'number').length, total: acts.length };
}

/** true si ninguna actividad del conjunto tiene avance real reportado. */
export function sinAvanceReal(acts: Actividad[] = actividades): boolean {
  return !acts.some((a) => typeof a.avance === 'number');
}

export interface AvanceParticipanteEnObjetivo {
  objetivoId: number;
  /** Avance del participante dentro del objetivo, 0–100. `null` = sin dato. */
  avance: number | null;
  /** Peso de cada actividad del objetivo: 100 % ÷ nº de actividades. */
  pesoPorActividad: number;
  /** Actividades del objetivo donde el participante tiene participación > 0. */
  actividadesAsignadas: number;
  /** De esas, cuántas ya están completas (avance real = 100 %). */
  actividadesCompletadas: number;
  /** Suma de su participación oficial en el objetivo. */
  participacionTotal: number;
  /** Parte de esa participación que ya está completada. */
  participacionCompletada: number;
  /** cuántas de sus actividades tienen avance real reportado (cobertura). */
  reportadas: number;
}

/**
 * Cuánto ha hecho UN participante dentro de UN objetivo.
 *
 * Cada objetivo vale 100 % y sus N actividades pesan lo mismo
 * (`pesoPorActividad = 100 / N`). El avance del participante es la parte de
 * su participación oficial que ya está completada:
 *
 *   avance = Σ participación(completadas) / Σ participación(asignadas) × 100
 *
 * `null` cuando ninguna de sus actividades tiene avance real reportado: sin
 * dato no es 0 %.
 */
export function getAvanceParticipanteEnObjetivo(
  participanteId: number,
  objetivoId: number,
): AvanceParticipanteEnObjetivo {
  const acts = getActividadesPorObjetivo(objetivoId);
  const pesoPorActividad = acts.length === 0 ? 0 : redondear(100 / acts.length, 2);
  const asignadas = acts.filter((a) => porcentajeEn(a, participanteId) > 0);
  const participacionTotal = redondear(
    asignadas.reduce((s, a) => s + porcentajeEn(a, participanteId), 0),
  );
  const completadas = asignadas.filter((a) => a.avance === 100);
  const participacionCompletada = redondear(
    completadas.reduce((s, a) => s + porcentajeEn(a, participanteId), 0),
  );
  const reportadas = asignadas.filter((a) => typeof a.avance === 'number').length;

  return {
    objetivoId,
    avance:
      participacionTotal === 0 || reportadas === 0
        ? null
        : redondear((participacionCompletada / participacionTotal) * 100, 1),
    pesoPorActividad,
    actividadesAsignadas: asignadas.length,
    actividadesCompletadas: completadas.length,
    participacionTotal,
    participacionCompletada,
    reportadas,
  };
}

/** Avance real de un participante en todos los objetivos donde participa. */
export function getAvanceParticipantePorObjetivo(
  participanteId: number,
): AvanceParticipanteEnObjetivo[] {
  return objetivos
    .filter((o) => getActividadesPorObjetivo(o.id).length > 0)
    .map((o) => o.id)
    .map((objetivoId) => getAvanceParticipanteEnObjetivo(participanteId, objetivoId))
    .filter((r) => r.actividadesAsignadas > 0);
}

/** Estado + contadores de todas las actividades del módulo. */
export function getContadorEstadosGlobal(): EstadoContador {
  return getContadorEstados(actividades);
}

/** Resumen de cada integrante del equipo principal. */
export function getResumenEquipo(): ResumenParticipante[] {
  return equipoPrincipal.map((p) => getResumenParticipante(p.id));
}

export function getResumenParticipante(participanteId: number): ResumenParticipante | undefined {
  const participante = participantes.find((p) => p.id === participanteId);
  if (!participante) return undefined;

  const asignadas = getActividadesPorParticipante(participanteId);
  const objetivoIds = objetivos
    .filter((o) => asignadas.some((a) => a.objetivoId === o.id))
    .map((o) => o.id);

  return {
    participante,
    participacionGeneral: getParticipacionGeneral(participanteId),
    actividadesAsignadas: asignadas.length,
    actividadesCompartidas: asignadas.filter((a) => a.participaciones.length > 1).length,
    objetivos: objetivoIds,
    participacionPorObjetivo: objetivoIds.map((objetivoId) => ({
      objetivoId,
      porcentaje: getParticipacionPorObjetivo(objetivoId, participanteId),
    })),
    avanceProgramado: getAvanceProgramadoParticipante(participanteId),
    avanceReal: getAvanceCalculado(asignadas),
    coberturaAvance: getCoberturaAvanceReal(asignadas),
  };
}

/** Participación promedio del equipo principal (promedio de los integrantes). */
export function getParticipacionPromedioEquipo(): number {
  if (equipoPrincipal.length === 0) return 0;
  const suma = equipoPrincipal.reduce((s, p) => s + getParticipacionGeneral(p.id), 0);
  return redondear(suma / equipoPrincipal.length);
}

/** Formatea un porcentaje de participación: 30.55 % */
export function formatPorcentaje(n: number): string {
  return `${redondear(n).toFixed(2)} %`;
}
