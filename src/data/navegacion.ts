import type { NavItem } from './types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'pie' },
  { label: 'Objetivos', href: '/dashboard/objetivos', icon: 'target' },
  { label: 'Actividades', href: '/dashboard/actividades', icon: 'list' },
  { label: 'Equipo', href: '/dashboard/equipo', icon: 'team' },
  { label: 'Presupuesto', href: '/dashboard/presupuesto', icon: 'coins' },
  { label: 'Riesgos', href: '/dashboard/riesgos', icon: 'alert' },
  { label: 'Entregables', href: '/dashboard/entregables', icon: 'folder' },
  { label: 'Stakeholders', href: '/dashboard/stakeholders', icon: 'users' },
  { label: 'Marketing', href: '/dashboard/marketing', icon: 'chart' },
  { label: 'Cronograma', href: '/dashboard/cronograma', icon: 'calendar' },
  { label: 'Avance real', href: '/dashboard/avance', icon: 'gauge' },
];