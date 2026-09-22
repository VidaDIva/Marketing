import type { Riesgo } from './types';

export const riesgos: Riesgo[] = [
  {
    id: 1,
    objetivoId: 1,
    descripcion: 'Información del área desactualizada o poco confiable',
    detalle:
      'Las fuentes de información del área de Marketing pueden estar dispersas o desactualizadas, lo que afectaría la calidad del análisis de la situación actual.',
    nivel: 'Medio',
    estado: 'En seguimiento',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion:
      'Garantizar acceso a fuentes de información verificadas y programar reuniones con los responsables de cada proceso y canal.',
  },
  {
    id: 2,
    objetivoId: 2,
    descripcion: 'Identificación incompleta de stakeholders',
    detalle:
      'Es posible que no se identifiquen todos los actores involucrados o que sus expectativas cambien durante la ejecución del proyecto.',
    nivel: 'Medio',
    estado: 'En seguimiento',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion:
      'Construir y revisar periódicamente la matriz de stakeholders con apoyo de las áreas involucradas.',
  },
  {
    id: 3,
    objetivoId: 3,
    descripcion: 'Información de clientes y campañas dispersa o sin calidad',
    detalle:
      'Los datos de clientes, campañas, ventas y conversión pueden estar fragmentados en diferentes sistemas y con baja calidad para el análisis.',
    nivel: 'Alto',
    estado: 'Activo',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion:
      'Realizar un inventario de fuentes de datos, limpieza y estandarización antes del análisis; documentar el origen de cada indicador.',
  },
  {
    id: 4,
    objetivoId: 4,
    descripcion: 'Propuestas tecnológicas desalineadas con el ERP',
    detalle:
      'Las tecnologías propuestas (IA, analítica avanzada, recomendación) podrían no ser compatibles con la arquitectura tecnológica del ERP.',
    nivel: 'Medio',
    estado: 'Activo',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion:
      'Validar cada propuesta con los equipos de TI y Data Science / BI según la arquitectura de Almacenes Éxito.',
  },
  {
    id: 5,
    objetivoId: 5,
    descripcion: 'Propuestas de mejora sin aprobación de gerencia',
    detalle:
      'Las mejoras propuestas podrían no obtener la aprobación de gerencia para su implementación dentro del alcance del proyecto.',
    nivel: 'Medio',
    estado: 'En seguimiento',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion:
      'Presentar resultados y beneficios con plan de implementación y esquema de seguimiento a gerencia.',
  },
  {
    id: 6,
    objetivoId: 3,
    descripcion: 'Pérdida de información por fallas técnicas',
    detalle:
      'Riesgo de pérdida parcial de información documental durante el levantamiento de datos del área.',
    nivel: 'Bajo',
    estado: 'Mitigado',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion: 'Respaldos periódicos y control de versiones de todos los documentos y modelos de datos.',
  },
  {
    id: 7,
    objetivoId: 4,
    descripcion: 'Retraso en requerimientos de TI',
    detalle:
      'Los tiempos de respuesta del área de TI pueden retrasar la validación de las oportunidades tecnológicas.',
    nivel: 'Bajo',
    estado: 'Mitigado',
    responsable: 'Juan David Sarrazola Fernandez',
    mitigacion: 'Plan de entregas parciales con acuerdos de nivel de servicio y puntos de control semanales.',
  },
];