import type { Actividad, Participacion } from './types';
import { objetivos } from './objetivos';
import { distribuirVentana } from '../lib/fechas';
import { getRegistroReal, validarRegistro } from '../lib/avance-real';

/**
 * Actividades del módulo de Marketing (datos oficiales del proyecto).
 *
 * Cada actividad tiene: objetivo, participantes con su porcentaje de
 * participación y presupuesto. La suma de los porcentajes de una actividad
 * es 100 %.
 *
 * Lo que NO existe en el documento y por eso NO se inventa:
 * - Estado de ejecución  → el campo `estado` queda sin valor.
 * - Avance / porcentaje de ejecución → el campo `avance` queda sin valor.
 *   Ambos se toman del REGISTRO de avance real (`data/avance-real.json`), que
 *   se actualiza a mano desde `/dashboard/avance`. Con el registro vacío, ambas
 *   propiedades quedan en `undefined` y la interfaz dice "No calculado".
 * - Fechas por actividad → se DERIVAN de la ventana de cada objetivo con
 *   `distribuirVentana` (secuencial, determinista) para que el cronograma
 *   siga siendo funcional.
 * - Entregable y riesgos por actividad → se consultan por objetivo.
 */

interface ActividadSpec {
  nombre: string;
  participaciones: Participacion[];
  presupuesto: number;
}

const porObjetivo: Record<number, ActividadSpec[]> = {
  1: [
    { nombre: 'Identificar los principales procesos del área de Marketing', participaciones: [{ participanteId: 2, porcentaje: 100 }], presupuesto: 400000 },
    { nombre: 'Identificar las actividades asociadas a cada proceso', participaciones: [{ participanteId: 1, porcentaje: 100 }], presupuesto: 350000 },
    { nombre: 'Identificar recursos utilizados por el área', participaciones: [{ participanteId: 3, porcentaje: 100 }], presupuesto: 400000 },
    { nombre: 'Identificar canales de comunicación y promoción', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 4, porcentaje: 50 }], presupuesto: 500000 },
    { nombre: 'Analizar estrategias actuales de Marketing', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 4, porcentaje: 50 }], presupuesto: 650000 },
    { nombre: 'Consolidar la información y elaborar el diagnóstico', participaciones: [{ participanteId: 2, porcentaje: 33.33 }, { participanteId: 1, porcentaje: 33.33 }, { participanteId: 3, porcentaje: 33.33 }], presupuesto: 550000 },
  ],
  2: [
    { nombre: 'Identificar las áreas internas relacionadas con Marketing', participaciones: [{ participanteId: 2, porcentaje: 100 }], presupuesto: 300000 },
    { nombre: 'Identificar los actores externos relacionados con Marketing', participaciones: [{ participanteId: 1, porcentaje: 100 }], presupuesto: 350000 },
    { nombre: 'Definir necesidades y expectativas de cada stakeholder', participaciones: [{ participanteId: 3, porcentaje: 50 }, { participanteId: 4, porcentaje: 50 }], presupuesto: 500000 },
    { nombre: 'Identificar responsabilidades y participación', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 450000 },
    { nombre: 'Analizar nivel de influencia e interés', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 4, porcentaje: 50 }], presupuesto: 500000 },
    { nombre: 'Establecer relaciones entre stakeholders y procesos de Marketing', participaciones: [{ participanteId: 3, porcentaje: 50 }, { participanteId: 6, porcentaje: 50 }], presupuesto: 550000 },
    { nombre: 'Consolidar la información', participaciones: [{ participanteId: 2, porcentaje: 33.33 }, { participanteId: 1, porcentaje: 33.33 }, { participanteId: 3, porcentaje: 33.33 }], presupuesto: 400000 },
  ],
  3: [
    { nombre: 'Identificar las fuentes de información utilizadas por Marketing', participaciones: [{ participanteId: 2, porcentaje: 100 }], presupuesto: 350000 },
    { nombre: 'Identificar los datos generados sobre clientes y consumidores', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 500000 },
    { nombre: 'Identificar información relacionada con campañas y promociones', participaciones: [{ participanteId: 3, porcentaje: 100 }], presupuesto: 400000 },
    { nombre: 'Identificar indicadores utilizados para medir resultados', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 4, porcentaje: 50 }], presupuesto: 450000 },
    { nombre: 'Analizar cómo se recopila y administra la información', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 6, porcentaje: 50 }], presupuesto: 550000 },
    { nombre: 'Analizar disponibilidad, calidad e integración de los datos', participaciones: [{ participanteId: 3, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 650000 },
    { nombre: 'Identificar oportunidades para mejorar el uso de los datos', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 600000 },
    { nombre: 'Consolidar los resultados del análisis', participaciones: [{ participanteId: 2, porcentaje: 33.33 }, { participanteId: 1, porcentaje: 33.33 }, { participanteId: 3, porcentaje: 33.33 }], presupuesto: 450000 },
  ],
  4: [
    { nombre: 'Identificar las tecnologías actualmente utilizadas en el área de Marketing', participaciones: [{ participanteId: 2, porcentaje: 100 }], presupuesto: 350000 },
    { nombre: 'Identificar necesidades y oportunidades de aplicación de nuevas tecnologías', participaciones: [{ participanteId: 1, porcentaje: 100 }], presupuesto: 450000 },
    { nombre: 'Analizar herramientas tecnológicas para la personalización de promociones', participaciones: [{ participanteId: 4, porcentaje: 100 }], presupuesto: 600000 },
    { nombre: 'Analizar tecnologías para el conocimiento y segmentación de clientes', participaciones: [{ participanteId: 3, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 650000 },
    { nombre: 'Analizar tecnologías aplicables a la fidelización y optimización de campañas', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 7, porcentaje: 50 }], presupuesto: 750000 },
    { nombre: 'Evaluar el aporte de las tecnologías a la toma de decisiones de Marketing', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 500000 },
    { nombre: 'Consolidar las oportunidades tecnológicas identificadas', participaciones: [{ participanteId: 2, porcentaje: 33.33 }, { participanteId: 1, porcentaje: 33.33 }, { participanteId: 3, porcentaje: 33.33 }], presupuesto: 400000 },
  ],
  5: [
    { nombre: 'Identificar las principales oportunidades de mejora en los procesos de Marketing', participaciones: [{ participanteId: 2, porcentaje: 100 }], presupuesto: 400000 },
    { nombre: 'Analizar oportunidades para fortalecer la relación con las partes interesadas', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 4, porcentaje: 50 }], presupuesto: 550000 },
    { nombre: 'Identificar estrategias para mejorar el aprovechamiento de los datos disponibles', participaciones: [{ participanteId: 3, porcentaje: 50 }, { participanteId: 5, porcentaje: 50 }], presupuesto: 650000 },
    { nombre: 'Proponer estrategias para aprovechar las tecnologías disponibles', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 6, porcentaje: 50 }], presupuesto: 700000 },
    { nombre: 'Diseñar estrategias para mejorar los resultados de las campañas de Marketing', participaciones: [{ participanteId: 1, porcentaje: 50 }, { participanteId: 7, porcentaje: 50 }], presupuesto: 800000 },
    { nombre: 'Proponer acciones para mejorar la experiencia y fidelización del cliente', participaciones: [{ participanteId: 4, porcentaje: 100 }], presupuesto: 600000 },
    { nombre: 'Priorizar las estrategias de mejora según impacto y viabilidad', participaciones: [{ participanteId: 2, porcentaje: 33.33 }, { participanteId: 1, porcentaje: 33.33 }, { participanteId: 3, porcentaje: 33.33 }], presupuesto: 450000 },
    { nombre: 'Consolidar las propuestas y elaborar el plan de mejora', participaciones: [{ participanteId: 2, porcentaje: 50 }, { participanteId: 1, porcentaje: 50 }], presupuesto: 600000 },
  ],
};

let siguienteId = 1;

export const actividades: Actividad[] = objetivos.flatMap((objetivo) => {
  const specs = porObjetivo[objetivo.id] ?? [];
  const ventanas = distribuirVentana(objetivo.fechaInicio, objetivo.fechaFinal, specs.length);
  return specs.map((spec, i) => {
    const id = siguienteId++;
    const real = getRegistroReal(id);
    return {
      id,
      nombre: spec.nombre,
      objetivoId: objetivo.id,
      participaciones: spec.participaciones,
      presupuesto: spec.presupuesto,
      fechaInicio: ventanas[i].fechaInicio,
      fechaFinal: ventanas[i].fechaFinal,
      // Ejecución reportada. `undefined` = sin dato, NO 0 %.
      estado: real.estado ?? undefined,
      avance: real.avance ?? undefined,
    };
  });
});

// Falla el build con un mensaje claro si `avance-real.json` quedó desactualizado
// (actividad nueva sin entrada, o entrada de una actividad que ya no existe).
validarRegistro(actividades.map((a) => a.id));
