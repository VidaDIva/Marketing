export type EstadoActividad = 'No iniciada' | 'En proceso' | 'Completada' | 'Retrasada';

/** Estados válidos de una actividad, en el orden en que se muestran los filtros. */
export const ESTADOS_ACTIVIDAD: EstadoActividad[] = ['No iniciada', 'En proceso', 'Completada', 'Retrasada'];

/**
 * Estados de una actividad. Son OPCIONALES: el documento de referencia define
 * qué se hace y quién participa, pero no registra el estado real de ejecución.
 * El estado real se reporta en `data/avance-real.json` (ver `lib/avance-real.ts`);
 * mientras no se registre, la interfaz muestra "Sin estado registrado".
 */
export const ESTADO_SIN_DATOS = 'Sin estado registrado';

/** Los tres integrantes principales del equipo del módulo de Marketing. */
export type TipoParticipante = 'equipo' | 'externo';

export type NivelRiesgo = 'Bajo' | 'Medio' | 'Alto';

export type EstadoRiesgo = 'Activo' | 'En seguimiento' | 'Mitigado';

export type EstadoEntregable = 'Pendiente' | 'En proceso' | 'Completado';

export type TipoStakeholder = 'Interno' | 'Externo';

export type Nivel = 'Alto' | 'Medio' | 'Bajo';

export interface Objetivo {
  id: number;
  numero: number;
  nombre: string;
  descripcionCorta: string;
  descripcion: string;
  responsable: string;
  /**
   * Estado del objetivo. Es OPCIONAL y se calcula a partir del estado real de
   * sus actividades (ver getEstadoObjetivo en lib/participacion.ts). No existe
   * un porcentaje de avance real, por lo que `avance` queda sin valor.
   */
  estado?: string;
  /** Avance real del objetivo. Opcional: solo existe si el proyecto lo reporta. */
  avance?: number;
  riesgoNivel: NivelRiesgo;
  fechaInicio: string;
  fechaFinal: string;
}

/** Participante del proyecto: equipo principal o participante externo. */
export interface Participante {
  id: number;
  nombre: string;
  tipo: TipoParticipante;
  /** Nombre corto para tablas compactas. */
  nombreCorto: string;
  iniciales: string;
}

/** Porcentaje de participación de un participante en una actividad. */
export interface Participacion {
  participanteId: number;
  porcentaje: number;
}

export interface Actividad {
  id: number;
  nombre: string;
  descripcion?: string;
  objetivoId: number;
  /**
   * Porcentaje de participación de cada participante en la actividad.
   * La suma de los porcentajes de una actividad es 100 %.
   */
  participaciones: Participacion[];
  /** Presupuesto de la actividad (dato oficial). La suma por objetivo da el total del objetivo. */
  presupuesto: number;
  /** Estado de ejecución. Opcional: no hay dato real de avance registrado. */
  estado?: EstadoActividad;
  /**
   * Avance real de la actividad (0-100). Opcional y preparado para cuando el
   * proyecto reporte ejecución. Mientras no exista, la interfaz muestra
   * "Avance no calculado" en lugar de inventar un porcentaje.
   */
  avance?: number;
  fechaInicio: string;
  fechaFinal: string;
  entregableId?: number;
  riesgosIds?: number[];
}

export interface Riesgo {
  id: number;
  objetivoId: number;
  descripcion: string;
  detalle: string;
  nivel: NivelRiesgo;
  estado: EstadoRiesgo;
  responsable: string;
  mitigacion: string;
}

export interface Entregable {
  id: number;
  nombre: string;
  descripcion: string;
  responsable: string;
  fecha: string;
  estado: EstadoEntregable;
  objetivoId?: number;
}

export interface Stakeholder {
  id: number;
  nombre: string;
  tipo: TipoStakeholder;
  rol: string;
  area: string;
  influencia: Nivel;
  interes: Nivel;
  responsabilidad: string;
}

/**
 * Presupuesto de un objetivo. Se CALCULA sumando el presupuesto de sus
 * actividades (fuente única de verdad). No hay ejecución presupuestal real,
 * por eso `ejecutado` / `disponible` / `porcentajeEjecucion` son opcionales.
 */
export interface PresupuestoObjetivo {
  objetivoId: number;
  total: number;
  ejecutado?: number;
  disponible?: number;
  porcentajeEjecucion?: number;
}

export interface PresupuestoGeneral {
  total: number;
  objetivos: number;
  actividades: number;
  ejecutado?: number;
  disponible?: number;
  porcentajeEjecucion?: number;
}

export interface KpiMarketing {
  titulo: string;
  valor: string;
  variacion?: string;
  esDemo: boolean;
}

export interface MarketingSerie {
  etiqueta: string;
  valor: number;
  color?: string;
}

export interface IndicadorMarketing {
  indicador: string;
  valor: string;
  meta: string;
  tendencia: 'up' | 'down' | 'flat';
  esDemo: boolean;
}

export interface OportunidadTecnologica {
  nombre: string;
  descripcion: string;
  impacto: Nivel;
  dificultad: Nivel;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}