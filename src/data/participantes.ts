import type { Participante } from './types';

/**
 * Participantes del proyecto.
 *
 * - Los 3 primeros (tipo "equipo") son los integrantes principales del módulo
 *   de Marketing y son los que se usan en la vista "Participación del equipo".
 * - Los demás (tipo "externo") son consultores y otros participantes externos
 *   que participan en algunas actividades. Se conservan porque son datos reales
 *   del documento de referencia, pero no cuentan como equipo principal.
 *
 * Los ids son fijos: se referencian desde `Actividad.participaciones`.
 */
export const participantes: Participante[] = [
  {
    id: 1,
    nombre: 'Juan David Sarrazola Fernandez',
    nombreCorto: 'Juan David Sarrazola',
    iniciales: 'JS',
    tipo: 'equipo',
  },
  {
    id: 2,
    nombre: 'Juan David Orrego Velez',
    nombreCorto: 'Juan David Orrego',
    iniciales: 'JO',
    tipo: 'equipo',
  },
  {
    id: 3,
    nombre: 'Jose Simon Atehortua Amaya',
    nombreCorto: 'Jose Simon Atehortua',
    iniciales: 'JA',
    tipo: 'equipo',
  },
  {
    id: 4,
    nombre: 'Laura Marcela Gómez',
    nombreCorto: 'Laura Marcela Gómez',
    iniciales: 'LG',
    tipo: 'externo',
  },
  {
    id: 5,
    nombre: 'Andrés Felipe Rojas',
    nombreCorto: 'Andrés Felipe Rojas',
    iniciales: 'AR',
    tipo: 'externo',
  },
  {
    id: 6,
    nombre: 'Daniel Alejandro Martínez',
    nombreCorto: 'Daniel Alejandro Martínez',
    iniciales: 'DM',
    tipo: 'externo',
  },
  {
    id: 7,
    nombre: 'Camila Torres',
    nombreCorto: 'Camila Torres',
    iniciales: 'CT',
    tipo: 'externo',
  },
];

/** Integrantes principales del equipo (los 3 del módulo de Marketing). */
export const equipoPrincipal: Participante[] = participantes.filter((p) => p.tipo === 'equipo');

/** Participantes externos (consultores y otros actores). */
export const participantesExternos: Participante[] = participantes.filter((p) => p.tipo === 'externo');

export function getParticipante(id: number): Participante | undefined {
  return participantes.find((p) => p.id === id);
}
