import { actividades } from '../data/actividades';
import { entregables } from '../data/entregables';
import { objetivos } from '../data/objetivos';
import { riesgos } from '../data/riesgos';
import type { Actividad, Entregable, Objetivo, Riesgo } from '../data/types';

export interface Crumb {
  label: string;
  href?: string;
}

const DAY_MS = 86400000;

export function formatMoney(n: number): string {
  return '$' + n.toLocaleString('es-CO');
}

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function dayOffset(a: string, b: string): number {
  const diff = Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / DAY_MS);
  return Math.max(0, diff);
}

export function daysBetween(a: string, b: string): number {
  return dayOffset(a, b) + 1;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export type Tone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

const TONE_MAP: Record<string, Tone> = {
  completado: 'success',
  completada: 'success',
  completados: 'success',
  mitigado: 'success',
  cerrado: 'success',
  'en ejecucion': 'success',
  publicada: 'success',
  activas: 'info',
  'en proceso': 'info',
  activo: 'danger',
  activos: 'danger',
  retrasada: 'danger',
  alto: 'danger',
  alta: 'danger',
  pendiente: 'warning',
  pendientes: 'warning',
  'en preparacion': 'warning',
  'en seguimiento': 'warning',
  medio: 'warning',
  media: 'warning',
  'no iniciada': 'neutral',
  'no iniciado': 'neutral',
  bajo: 'neutral',
  baja: 'neutral',
};

export function toneFor(status: string): Tone {
  return TONE_MAP[norm(status)] ?? 'neutral';
}

export function getObjetivo(id: number): Objetivo | undefined {
  return objetivos.find((o) => o.id === id);
}

export function getActividad(id: number): Actividad | undefined {
  return actividades.find((a) => a.id === id);
}

export function getRiesgo(id: number): Riesgo | undefined {
  return riesgos.find((r) => r.id === id);
}

export function getEntregable(id: number): Entregable | undefined {
  return entregables.find((e) => e.id === id);
}

export function getActividadesPorObjetivo(id: number): Actividad[] {
  return actividades.filter((a) => a.objetivoId === id);
}

export function getRiesgosPorObjetivo(id: number): Riesgo[] {
  return riesgos.filter((r) => r.objetivoId === id);
}

export function getEntregablesPorObjetivo(id: number): Entregable[] {
  return entregables.filter((e) => e.objetivoId === id);
}

export function getRiesgosPorActividad(id: number): Riesgo[] {
  const act = getActividad(id);
  if (!act) return [];
  return act.riesgosIds
    .map((rid) => getRiesgo(rid))
    .filter((r): r is Riesgo => r !== undefined);
}

export function getEntregableDeActividad(id: number): Entregable | undefined {
  const act = getActividad(id);
  if (!act?.entregableId) return undefined;
  return getEntregable(act.entregableId);
}

const SECTION_LABELS: Record<string, string> = {
  '/dashboard/objetivos': 'Objetivos',
  '/dashboard/actividades': 'Actividades',
  '/dashboard/presupuesto': 'Presupuesto',
  '/dashboard/riesgos': 'Riesgos',
  '/dashboard/entregables': 'Entregables',
  '/dashboard/stakeholders': 'Stakeholders',
  '/dashboard/marketing': 'Marketing',
  '/dashboard/cronograma': 'Cronograma',
};

export function getActiveSection(path: string): string {
  const clean = path.split('?')[0];
  for (const [route, href] of Object.entries({
    '/objetivos': '/dashboard/objetivos',
    '/actividades': '/dashboard/actividades',
    '/dashboard/objetivos': '/dashboard/objetivos',
    '/dashboard/actividades': '/dashboard/actividades',
    '/dashboard/presupuesto': '/dashboard/presupuesto',
    '/dashboard/riesgos': '/dashboard/riesgos',
    '/dashboard/entregables': '/dashboard/entregables',
    '/dashboard/stakeholders': '/dashboard/stakeholders',
    '/dashboard/marketing': '/dashboard/marketing',
    '/dashboard/cronograma': '/dashboard/cronograma',
  })) {
    if (clean === route || clean.startsWith(route + '/')) return href;
  }
  return '/dashboard';
}

export function getBreadcrumbs(path: string): Crumb[] {
  const clean = path.split('?')[0];
  if (clean === '/' || clean === '/dashboard') return [{ label: 'Dashboard', href: '/dashboard' }];

  const mObj = clean.match(/^\/objetivos\/(\d+)$/);
  if (mObj) {
    const objetivo = getObjetivo(Number(mObj[1]));
    return [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Objetivos', href: '/dashboard/objetivos' },
      { label: objetivo ? `Objetivo ${objetivo.numero}` : `Objetivo ${mObj[1]}` },
    ];
  }

  const mAct = clean.match(/^\/actividades\/(\d+)$/);
  if (mAct) {
    const act = getActividad(Number(mAct[1]));
    return [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Actividades', href: '/dashboard/actividades' },
      { label: act ? act.nombre : `Actividad ${mAct[1]}` },
    ];
  }

  const label = SECTION_LABELS[clean];
  if (label) return [{ label: 'Dashboard', href: '/dashboard' }, { label }];

  return [{ label: 'Dashboard', href: '/dashboard' }];
}