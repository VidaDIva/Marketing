/**
 * Formulario de registro del avance real (`/dashboard/avance`).
 *
 * El sitio es estático: no hay servidor que guarde nada. El formulario arma el
 * contenido de `src/data/avance-real.json` en el navegador y lo descarga, para
 * reemplazar ese archivo y volver a compilar (`npm run build`). Así el avance
 * real queda versionado junto al resto de los datos del proyecto.
 *
 * Reglas que aplica el formulario (para que el archivo nunca quede incoherente):
 *  - Vaciar el % de avance limpia estado y fecha: sin % no hay dato de ejecución.
 *  - El estado se sugiere a partir del % (0 → No iniciada, 1-99 → En proceso,
 *    100 → Completada) hasta que la persona lo cambie a mano.
 *  - "Completada" con un % distinto de 100 se avisa (no se bloquea), porque puede
 *    ser un cierre administrativo de la actividad.
 */

import { ESTADOS_ACTIVIDAD } from '../data/types';
import type { EstadoActividad } from '../data/types';

interface Fila {
  id: number;
  estado: EstadoActividad | null;
  avance: number | null;
  fecha: string | null;
  nota: string | null;
}

const RUTA_REGISTRO = 'src/data/avance-real.json';

const $ = <T extends HTMLElement>(sel: string, raiz: ParentNode = document): T | null =>
  raiz.querySelector<T>(sel);
const $$ = <T extends HTMLElement>(sel: string, raiz: ParentNode = document): T[] =>
  Array.from(raiz.querySelectorAll<T>(sel));

export function initFormularioAvance(): void {
  const root = $('[data-avance-form]');
  if (!root) return;

  const inicial = JSON.parse($('[data-avance-inicial]', root)?.textContent ?? '{}') as {
    version?: number;
    actualizado?: string | null;
    filas?: Fila[];
  };

  let filas: Fila[] = inicial.filas ?? [];
  const editadoEstado = new Set<number>();
  const hoy = new Date().toISOString().slice(0, 10);

  const estadoSugerido = (avance: number | null): EstadoActividad | null => {
    if (avance === null) return null;
    if (avance >= 100) return 'Completada';
    if (avance > 0) return 'En proceso';
    return 'No iniciada';
  };

  // --- lectura del formulario ---
  const leerFila = (row: HTMLElement): Fila => {
    const id = Number(row.dataset.id);
    const select = $<HTMLSelectElement>('[data-campo="estado"]', row);
    const input = $<HTMLInputElement>('[data-campo="avance"]', row);
    const fecha = $<HTMLInputElement>('[data-campo="fecha"]', row);
    const nota = $<HTMLInputElement>('[data-campo="nota"]', row);

    const avanceCrudo = input?.value.trim() ?? '';
    let avance: number | null = null;
    if (avanceCrudo !== '') {
      const n = Number(avanceCrudo);
      if (!Number.isNaN(n)) avance = Math.min(100, Math.max(0, n));
    }
    const estadoValor = select?.value ?? '';
    const estado: EstadoActividad | null = (ESTADOS_ACTIVIDAD as string[]).includes(estadoValor)
      ? (estadoValor as EstadoActividad)
      : null;

    return {
      id,
      // Sin avance no hay estado: limpiar el % limpia todo el registro.
      estado: avance === null ? null : estado,
      avance,
      fecha: avance === null ? null : fecha?.value.trim() || hoy,
      nota: nota?.value.trim() ? nota.value.trim() : null,
    };
  };

  const leerTodas = (): Fila[] => $$('[data-avance-row]', root).map(leerFila);

  // --- avisos de consistencia ---
  const validar = (lista: Fila[]): string[] => {
    const avisos: string[] = [];
    for (const f of lista) {
      if (f.estado === 'Completada' && f.avance !== null && f.avance < 100) {
        avisos.push(`A${String(f.id).padStart(2, '0')}: marcada como Completada con ${f.avance} % de avance.`);
      }
      if (f.estado === 'No iniciada' && f.avance !== null && f.avance > 0) {
        avisos.push(`A${String(f.id).padStart(2, '0')}: "No iniciada" con ${f.avance} % de avance.`);
      }
      if (f.avance !== null && f.estado === null) {
        avisos.push(`A${String(f.id).padStart(2, '0')}: tiene % de avance pero no hay estado.`);
      }
    }
    return avisos;
  };

  // --- resumen en vivo (mismas fórmulas que la app: promedio simple) ---
  const pintarResumen = (lista: Fila[]): void => {
    const conDato = lista.filter((f) => f.avance !== null);
    const real = conDato.length
      ? conDato.reduce((s, f) => s + (f.avance ?? 0), 0) / conDato.length
      : null;
    const estados = new Set(conDato.map((f) => f.estado));
    const completas = conDato.filter((f) => f.estado === 'Completada').length;

    const set = (id: string, valor: string): void => {
      const el = $(`[data-live="${id}"]`);
      if (el) el.textContent = valor;
    };
    set('real', real === null ? 'No calculado' : `${real.toFixed(1)} %`);
    set('cobertura', `${conDato.length} de ${lista.length}`);
    set('completadas', String(completas));
    set('estados', estados.size === 0 ? '—' : String(estados.size));

    const avisos = validar(lista);
    const caja = $('[data-avance-avisos]');
    if (caja) {
      caja.textContent = avisos.length
        ? `${avisos.length} aviso(s): ${avisos.slice(0, 3).join(' · ')}${avisos.length > 3 ? '…' : ''}`
        : 'Sin inconsistencias entre estado y % de avance.';
    }
    const btn = $<HTMLButtonElement>('[data-avance-descargar]');
    if (btn) btn.disabled = avisos.length > 0;
  };

  // --- sincronización estado ↔ % ---
  /**
   * `sugerir` autocompleta el estado a partir del % SOLO si la persona no ha
   * elegido el estado a mano (`editadoEstado`), para no pisar decisiones suyas.
   */
  const sincronizarFila = (row: HTMLElement, sugerir = false): void => {
    const id = Number(row.dataset.id);
    const input = $<HTMLInputElement>('[data-campo="avance"]', row);
    const select = $<HTMLSelectElement>('[data-campo="estado"]', row);
    if (!input || !select) return;

    const v = input.value.trim();
    if (v !== '') input.value = String(Math.min(100, Math.max(0, Number(v) || 0)));
    const avance = v === '' ? null : Number(input.value);
    const fecha = $<HTMLInputElement>('[data-campo="fecha"]', row);

    if (avance === null) {
      // Sin % no hay registro: se limpian estado y fecha, y vuelve a autosugerir.
      select.value = '';
      editadoEstado.delete(id);
      fecha?.setAttribute('disabled', 'true');
    } else {
      fecha?.removeAttribute('disabled');
      const sugerido = estadoSugerido(avance);
      if (sugerir && !editadoEstado.has(id) && sugerido) select.value = sugerido;
      if (select.value === '' && sugerido) select.value = sugerido;
    }
    row.dataset.conDato = avance === null ? 'false' : 'true';
  };

  // --- generación del JSON ---
  const construirJson = (lista: Fila[]): string => {
    const registro: Record<string, Fila> = {};
    for (const f of [...lista].sort((a, b) => a.id - b.id)) {
      registro[String(f.id)] = { estado: f.estado, avance: f.avance, fecha: f.fecha, nota: f.nota };
    }
    return `${JSON.stringify({ version: inicial.version ?? 1, actualizado: hoy, registro }, null, 2)}\n`;
  };

  const descargar = (): void => {
    const lista = leerTodas();
    const avisos = validar(lista);
    if (avisos.length) {
      alert('Corrige antes de descargar:\n\n' + avisos.join('\n'));
      return;
    }
    const json = construirJson(lista);
    const codigo = $('[data-avance-json]');
    if (codigo) codigo.textContent = json;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avance-real.json';
    a.click();
    URL.revokeObjectURL(url);
    pintarResumen(lista);
  };

  // --- eventos ---
  root.addEventListener('input', (ev) => {
    const target = ev.target as HTMLElement;
    const row = target.closest('[data-avance-row]');
    if (!row) return;
    if (target.dataset.campo === 'avance') {
      sincronizarFila(row as HTMLElement, true);
    }
    pintarResumen(leerTodas());
  });

  root.addEventListener('change', (ev) => {
    const target = ev.target as HTMLSelectElement;
    const row = target.closest('[data-avance-row]');
    if (!row) return;
    if (target.dataset.campo === 'estado') {
      // A partir de aquí la persona manda: no se vuelve a autosugerir.
      editadoEstado.add(Number((row as HTMLElement).dataset.id));
    }
    pintarResumen(leerTodas());
  });

  $('[data-avance-descargar]', root)?.addEventListener('click', descargar);

  $('[data-avance-copiar]', root)?.addEventListener('click', async () => {
    const lista = leerTodas();
    const avisos = validar(lista);
    if (avisos.length) {
      alert('Corrige antes de copiar:\n\n' + avisos.join('\n'));
      return;
    }
    const json = construirJson(lista);
    const codigo = $('[data-avance-json]');
    if (codigo) codigo.textContent = json;
    try {
      await navigator.clipboard.writeText(json);
      const btn = $<HTMLButtonElement>('[data-avance-copiar]');
      if (btn) {
        const previo = btn.textContent;
        btn.textContent = 'JSON copiado';
        setTimeout(() => (btn.textContent = previo), 1500);
      }
    } catch {
      const codigoEl = $('[data-avance-json]');
      codigoEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  $('[data-avance-resetear]', root)?.addEventListener('click', () => {
    if (!confirm('¿Borrar todos los datos capturados en el formulario? (No toca el archivo del repo)')) return;
    for (const row of $$('[data-avance-row]', root)) {
      const input = $<HTMLInputElement>('[data-campo="avance"]', row);
      const select = $<HTMLSelectElement>('[data-campo="estado"]', row);
      const fecha = $<HTMLInputElement>('[data-campo="fecha"]', row);
      const nota = $<HTMLInputElement>('[data-campo="nota"]', row);
      if (input) input.value = '';
      if (select) select.value = '';
      if (fecha) fecha.value = '';
      if (nota) nota.value = '';
      sincronizarFila(row as HTMLElement, true);
    }
    editadoEstado.clear();
    filas = leerTodas();
    pintarResumen(filas);
  });

  // estado inicial: el estado ya guardado en el repo manda, no se sobrescribe.
  for (const row of $$('[data-avance-row]', root)) {
    const select = $<HTMLSelectElement>('[data-campo="estado"]', row as HTMLElement);
    if (select && select.value !== '') editadoEstado.add(Number((row as HTMLElement).dataset.id));
    sincronizarFila(row as HTMLElement, true);
  }
  filas = leerTodas();
  pintarResumen(filas);
}
