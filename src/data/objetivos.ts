import type { Objetivo } from './types';

/**
 * Objetivos del módulo de Marketing.
 *
 * No se define un porcentaje de avance por objetivo: el proyecto no tiene
 * datos de ejecución registrados, por lo que `avance` y `estado` quedan sin
 * valor. El estado real de cada objetivo se CALCULA a partir del estado de sus
 * actividades (ver getEstadoObjetivo en lib/participacion.ts) y el presupuesto
 * se calcula sumando el presupuesto de sus actividades.
 */
export const objetivos: Objetivo[] = [
  {
    id: 1,
    numero: 1,
    nombre: 'Analizar la situación actual del área de Marketing',
    descripcionCorta: 'Procesos, actividades, recursos, canales y estrategias vigentes del área.',
    descripcion:
      'Analizar la situación actual del área de Marketing de Almacenes Éxito, incluyendo procesos, actividades, recursos, canales y estrategias. El objetivo es establecer una línea base que permita identificar fortalezas, brechas y oportunidades de mejora para el módulo dentro del ERP.',
    responsable: 'Juan David Sarrazola Fernandez',
    riesgoNivel: 'Medio',
    fechaInicio: '2026-08-15',
    fechaFinal: '2026-08-22',
  },
  {
    id: 2,
    numero: 2,
    nombre: 'Identificar los stakeholders del área de Marketing',
    descripcionCorta: 'Necesidades, expectativas, responsabilidades e influencia de cada actor.',
    descripcion:
      'Identificar los stakeholders internos y externos del área de Marketing, así como sus necesidades, expectativas, responsabilidades e influencia. Se construirá una matriz de stakeholders que oriente la gestión de expectativas durante todo el proyecto.',
    responsable: 'Juan David Sarrazola Fernandez',
    riesgoNivel: 'Medio',
    fechaInicio: '2026-08-23',
    fechaFinal: '2026-08-27',
  },
  {
    id: 3,
    numero: 3,
    nombre: 'Evaluar el uso y gestión de la información del área',
    descripcionCorta: 'Clientes, campañas, ventas, conversión y comportamiento del consumidor.',
    descripcion:
      'Evaluar el uso y gestión de la información del área de Marketing, incluyendo clientes, campañas, ventas, conversión, comportamiento del consumidor, analítica y resultados. Este diagnóstico de datos alimenta las propuestas de integración central de información en el ERP.',
    responsable: 'Juan David Sarrazola Fernandez',
    riesgoNivel: 'Alto',
    fechaInicio: '2026-08-28',
    fechaFinal: '2026-09-02',
  },
  {
    id: 4,
    numero: 4,
    nombre: 'Analizar oportunidades de aplicación tecnológica',
    descripcionCorta: 'Personalización, fidelización, optimización de campañas y decisiones.',
    descripcion:
      'Analizar oportunidades tecnológicas aplicables al marketing: personalización, conocimiento del cliente, fidelización, optimización de campañas y toma de decisiones, incluyendo IA, análisis predictivo y sistemas de recomendación omnicanal.',
    responsable: 'Juan David Sarrazola Fernandez',
    riesgoNivel: 'Medio',
    fechaInicio: '2026-09-03',
    fechaFinal: '2026-09-06',
  },
  {
    id: 5,
    numero: 5,
    nombre: 'Proponer estrategias de mejora para el área de Marketing',
    descripcionCorta: 'Procesos, datos, tecnología, resultados de campañas y experiencia del cliente.',
    descripcion:
      'Proponer mejoras concretas relacionadas con procesos, stakeholders, datos, tecnología, resultados de campañas y experiencia del cliente, consolidadas en la propuesta del módulo de Marketing del ERP Almacenes Éxito.',
    responsable: 'Juan David Sarrazola Fernandez',
    riesgoNivel: 'Medio',
    fechaInicio: '2026-09-07',
    fechaFinal: '2026-09-12',
  },
];
