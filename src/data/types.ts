export type EstadoActividad = 'No iniciada' | 'En proceso' | 'Completada' | 'Retrasada';

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
  estado: string;
  avance: number;
  riesgoNivel: NivelRiesgo;
  fechaInicio: string;
  fechaFinal: string;
}

export interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  objetivoId: number;
  responsable: string;
  fechaInicio: string;
  fechaFinal: string;
  estado: EstadoActividad;
  avance: number;
  presupuesto: number;
  entregableId?: number;
  riesgosIds: number[];
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

export interface PresupuestoObjetivo {
  objetivoId: number;
  total: number;
  ejecutado: number;
  pendiente: number;
  porcentajeEjecucion: number;
}

export interface PresupuestoGeneral {
  total: number;
  ejecutado: number;
  pendiente: number;
  porcentajeEjecucion: number;
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