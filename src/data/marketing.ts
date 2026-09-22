import type { IndicadorMarketing, KpiMarketing, MarketingSerie, OportunidadTecnologica } from './types';

export const kpisMarketing: KpiMarketing[] = [
  { titulo: 'Clientes registrados', valor: '85.400', variacion: '+4,2% este trimestre', esDemo: true },
  { titulo: 'CampaÃ±as activas', valor: '12', variacion: '+2 este mes', esDemo: true },
  { titulo: 'Tasa de conversiÃ³n', valor: '8,6%', variacion: '+0,8 pts', esDemo: true },
  { titulo: 'Promociones activas', valor: '18', variacion: '5 vencen esta semana', esDemo: true },
  { titulo: 'Canales digitales', valor: '6', variacion: 'activos', esDemo: true },
];

export const evolucionCampanas: MarketingSerie[] = [
  { etiqueta: 'Ene', valor: 3 },
  { etiqueta: 'Feb', valor: 4 },
  { etiqueta: 'Mar', valor: 5 },
  { etiqueta: 'Abr', valor: 5 },
  { etiqueta: 'May', valor: 6 },
  { etiqueta: 'Jun', valor: 7 },
  { etiqueta: 'Jul', valor: 8 },
  { etiqueta: 'Ago', valor: 10 },
  { etiqueta: 'Sep', valor: 12 },
];

export const conversionMensual: MarketingSerie[] = [
  { etiqueta: 'Ene', valor: 4.5 },
  { etiqueta: 'Feb', valor: 4.8 },
  { etiqueta: 'Mar', valor: 5.1 },
  { etiqueta: 'Abr', valor: 5.4 },
  { etiqueta: 'May', valor: 5.9 },
  { etiqueta: 'Jun', valor: 6.3 },
  { etiqueta: 'Jul', valor: 7.0 },
  { etiqueta: 'Ago', valor: 7.8 },
  { etiqueta: 'Sep', valor: 8.6 },
];

export const rendimientoPorCanal: MarketingSerie[] = [
  { etiqueta: 'Web', valor: 34 },
  { etiqueta: 'Redes', valor: 26 },
  { etiqueta: 'E-com', valor: 14 },
  { etiqueta: 'Email', valor: 9 },
  { etiqueta: 'App', valor: 9 },
  { etiqueta: 'Tienda', valor: 8 },
];

export const promocionesPorTipo: MarketingSerie[] = [
  { etiqueta: 'Descuentos', valor: 24 },
  { etiqueta: 'Lealtad', valor: 18 },
  { etiqueta: 'Combos', valor: 12 },
  { etiqueta: 'Cupones', valor: 9 },
  { etiqueta: 'Cashback', valor: 7 },
];

export const comportamientoClientes: MarketingSerie[] = [
  { etiqueta: 'Nuevos', valor: 32 },
  { etiqueta: 'Recurrentes', valor: 48 },
  { etiqueta: 'Inactivos', valor: 20 },
];

export const indicadoresMarketing: IndicadorMarketing[] = [
  { indicador: 'CTR promedio', valor: '3,4%', meta: '4,0%', tendencia: 'up', esDemo: true },
  { indicador: 'Costo de adquisiciÃ³n (CAC)', valor: '$12.500', meta: '$10.000', tendencia: 'down', esDemo: true },
  { indicador: 'Retorno publicitario (ROAS)', valor: '3,1x', meta: '3,5x', tendencia: 'up', esDemo: true },
  { indicador: 'Net Promoter Score (NPS)', valor: '58', meta: '65', tendencia: 'up', esDemo: true },
  { indicador: 'RetenciÃ³n de clientes', valor: '71%', meta: '75%', tendencia: 'up', esDemo: true },
  { indicador: 'Tasa de rebote web', valor: '42%', meta: '35%', tendencia: 'down', esDemo: true },
];

export const oportunidadesTecnologicas: OportunidadTecnologica[] = [
  {
    nombre: 'Inteligencia artificial',
    descripcion:
      'Automatizar la clasificaciÃ³n de clientes, generar contenidos y predecir comportamiento con modelos de IA.',
    impacto: 'Alto',
    dificultad: 'Medio',
  },
  {
    nombre: 'PersonalizaciÃ³n',
    descripcion:
      'Entregar experiencias y ofertas adaptadas al perfil e historial de cada cliente en todos los canales.',
    impacto: 'Alto',
    dificultad: 'Medio',
  },
  {
    nombre: 'AnÃ¡lisis predictivo',
    descripcion:
      'Anticipar ventas, demanda y riesgo de abandono para tomar decisiones con anticipaciÃ³n.',
    impacto: 'Alto',
    dificultad: 'Medio',
  },
  {
    nombre: 'Sistemas de recomendaciÃ³n',
    descripcion:
      'Sugerir productos complementarios dentro del ERP para incrementar el ticket promedio.',
    impacto: 'Medio',
    dificultad: 'Bajo',
  },
  {
    nombre: 'Omnicanalidad',
    descripcion:
      'Unificar la experiencia en tienda, web, app y redes con el mismo carrito, precio y promociÃ³n.',
    impacto: 'Alto',
    dificultad: 'Alto',
  },
  {
    nombre: 'AnalÃ­tica avanzada',
    descripcion:
      'Cuadros de mando y segmentaciÃ³n avanzada integrados al ERP para la toma de decisiones del Ã¡rea.',
    impacto: 'Medio',
    dificultad: 'Medio',
  },
];