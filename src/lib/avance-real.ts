/**
 * ============================================================
 *  AVANCE REAL (EJECUCIÓN) · registro manual
 * ============================================================
 *
 *  A diferencia del avance PROGRAMADO (`lib/progreso.ts`), que se deriva solo de
 *  las fechas del cronograma, el avance REAL no se puede calcular: depende de
 *  qué se haya ejecutado. Por eso es un REGISTRO que alguien actualiza:
 *
 *    src/data/avance-real.json  →  { version, actualizado, registro: { "<id>": {...} } }
 *
 *  Se llena desde la página `/dashboard/avance` (formulario), que genera el
 *  archivo y hay que reemplazar en el repo. Con el build estático, cada
 *  actualización del registro vuelve a "tiempo real" al hacer `npm run build`.
 *
 *  REGLAS DE LA INTERFAZ (para no mentir con los datos):
 *  - "Avance real"     → este registro. `null` significa SIN DATO, y la
 *                        interfaz muestra "No calculado" más la cobertura
 *                        ("registrado en 12 de 36 actividades"), nunca un 0 %.
 *  - "Avance programado" → calendario, en `lib/progreso.ts`.
 *  - "Desviación"      → real − programado, en `lib/desviacion.ts`. Solo
 *                        existe si ambos lados tienen dato.
 *
 *  `null` ≠ 0: una actividad sin dato NO es una actividad sin avance. Por eso
 *  los promedios de avance real se calculan solo sobre las actividades
 *  reportadas, y siempre se muestra cuántas hay.
 *
 *  Este módulo NO importa `data/actividades.ts` a propósito: `actividades.ts`
 *  lo usa para aplicar el registro, y así no hay ciclo de imports. La
 *  validación de ids se recibe por parámetro.
 */

import { ESTADOS_ACTIVIDAD, type EstadoActividad } from '../data/types';
import registroBruto from '../data/avance-real.json';

export interface RegistroReal {
  /** Estado de ejecución reportado. `null` = sin dato. */
  estado: EstadoActividad | null;
  /** Avance real de la actividad, 0-100. `null` = sin dato. */
  avance: number | null;
  /** Fecha en la que se registró o se actualizó el dato (YYYY-MM-DD). */
  fecha: string | null;
  /** Observación libre del equipo. */
  nota: string | null;
}

export const REGISTRO_VACIO: RegistroReal = { estado: null, avance: null, fecha: null, nota: null };

const esFechaIso = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const normalizar = (bruto: unknown, id: number): RegistroReal => {
  if (bruto === null || bruto === undefined) return { ...REGISTRO_VACIO };
  if (typeof bruto !== 'object') {
    throw new Error(`avance-real.json: la entrada "${id}" debe ser un objeto o null.`);
  }
  const r = bruto as Record<string, unknown>;

  const estado = (r.estado ?? null) as EstadoActividad | null;
  if (estado !== null && !ESTADOS_ACTIVIDAD.includes(estado)) {
    throw new Error(
      `avance-real.json: estado inválido "${String(estado)}" en la actividad ${id}. ` +
        `Valores permitidos: ${ESTADOS_ACTIVIDAD.join(', ')} o null.`,
    );
  }

  let avance: number | null = null;
  if (r.avance !== null && r.avance !== undefined) {
    if (typeof r.avance !== 'number' || Number.isNaN(r.avance)) {
      throw new Error(`avance-real.json: "avance" de la actividad ${id} debe ser un número 0-100 o null.`);
    }
    if (r.avance < 0 || r.avance > 100) {
      throw new Error(`avance-real.json: "avance" de la actividad ${id} está fuera de rango (${r.avance}).`);
    }
    avance = r.avance;
  }

  const fecha = (r.fecha ?? null) as string | null;
  if (fecha !== null && !esFechaIso(fecha)) {
    throw new Error(`avance-real.json: "fecha" de la actividad ${id} debe ser YYYY-MM-DD o null (recibido "${fecha}").`);
  }

  const nota = (r.nota ?? null) as string | null;
  if (nota !== null && typeof nota !== 'string') {
    throw new Error(`avance-real.json: "nota" de la actividad ${id} debe ser texto o null.`);
  }

  return { estado, avance, fecha, nota };
};

const registros = new Map<number, RegistroReal>();
for (const [clave, valor] of Object.entries(registroBruto.registro ?? {})) {
  const id = Number(clave);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`avance-real.json: clave inválida "${clave}" (debe ser el id numérico de la actividad).`);
  }
  registros.set(id, normalizar(valor, id));
}

/** Fecha en la que se actualizó el registro por última vez (`null` si nunca). */
export const FECHA_ACTUALIZACION: string | null = (registroBruto.actualizado as string | null) ?? null;

/**
 * Valida que el registro no mencione actividades inexistentes ni deje huecos.
 * Se llama desde `data/actividades.ts`, que es quien conoce los ids reales.
 * @throws Error con un mensaje claro si el archivo quedó desactualizado.
 */
export function validarRegistro(idsValidos: number[]): void {
  const validos = new Set(idsValidos);
  const desconocidos = [...registros.keys()].filter((id) => !validos.has(id));
  if (desconocidos.length > 0) {
    throw new Error(
      `avance-real.json menciona actividades que ya no existen: ${desconocidos.join(', ')}. ` +
        'Regenera el archivo con la página /dashboard/avance.',
    );
  }
  const faltantes = idsValidos.filter((id) => !registros.has(id));
  if (faltantes.length > 0) {
    throw new Error(
      `avance-real.json no tiene entrada para ${faltantes.length} actividad(es): ` +
        `${faltantes.slice(0, 8).join(', ')}${faltantes.length > 8 ? '…' : ''}.`,
    );
  }
}

/** Registro de una actividad. Si no hay entrada, devuelve el vacío (sin dato). */
export function getRegistroReal(actividadId: number): RegistroReal {
  return registros.get(actividadId) ?? { ...REGISTRO_VACIO };
}

/** true si la actividad tiene avance real reportado (no solo estado). */
export function tieneAvanceReal(actividadId: number): boolean {
  return typeof getRegistroReal(actividadId).avance === 'number';
}

/** Fecha de la última actualización del archivo, o `null` si nunca se actualizó. */
export function getFechaActualizacion(): string | null {
  return FECHA_ACTUALIZACION;
}
