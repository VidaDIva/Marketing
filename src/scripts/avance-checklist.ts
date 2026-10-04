/**
 * Checklist de avance por objetivo y participante.
 *
 * Cada objetivo vale 100 % y sus N actividades pesan lo mismo, así que marcar
 * una actividad como completada suma `100 / N` al avance del objetivo.
 *
 * No escribe un segundo registro: manipula los campos del formulario de la
 * página (`data-campo="avance"`, `data-campo="estado"`, `data-campo="fecha"`),
 * de modo que el JSON que se descarga al final ya sale completo y los dos
 * formularios nunca se contradicen.
 */

const $ = <T extends Element>(sel: string, raiz: ParentNode = document): T | null =>
  raiz.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string, raiz: ParentNode = document): T[] =>
  Array.from(raiz.querySelectorAll<T>(sel));

interface PesosObjetivo {
  objetivoId: number;
  /** 100 % ÷ nº de actividades del objetivo. */
  peso: number;
  /** id de actividad → participación por participante (id → %). */
  participacion: Map<number, Map<number, number>>;
  participantes: number[];
}

export function initChecklistAvance(): void {
  const root = $<HTMLElement>('[data-checklist]');
  if (!root) return;

  const pesos = new Map<number, PesosObjetivo>();
  for (const obj of $$<HTMLElement>('[data-checklist-obj]', root)) {
    const objetivoId = Number(obj.dataset.obj);
    const filas = $$<HTMLElement>('[data-checklist-act]', obj);
    const participacion = new Map<number, Map<number, number>>();
    const idsParticipantes = new Set<number>();
    for (const fila of filas) {
      const actId = Number(fila.dataset.id);
      const porParticipante = new Map<number, number>();
      for (const celda of $$<HTMLElement>('[data-par]', fila)) {
        const pid = Number(celda.dataset.par);
        porParticipante.set(pid, Number(celda.dataset.porcentaje));
        idsParticipantes.add(pid);
      }
      participacion.set(actId, porParticipante);
    }
    pesos.set(objetivoId, {
      objetivoId,
      peso: filas.length === 0 ? 0 : Math.round((100 / filas.length) * 100) / 100,
      participacion,
      participantes: [...idsParticipantes],
    });
  }

  const filaFormulario = (actividadId: number): HTMLElement | null =>
    $(`[data-avance-row][data-id="${actividadId}"]`);

  const leerAvance = (actividadId: number): number | null => {
    const input = $<HTMLInputElement>('[data-campo="avance"]', filaFormulario(actividadId) ?? root);
    const v = input?.value.trim() ?? '';
    if (v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  /** Dispara los listeners del formulario principal para que se repinten. */
  const avisar = (actividadId: number): void => {
    const fila = filaFormulario(actividadId);
    const input = $<HTMLInputElement>('[data-campo="avance"]', fila ?? root);
    input?.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const marcar = (actividadId: number, completada: boolean, usarCero: boolean): void => {
    const fila = filaFormulario(actividadId);
    if (!fila) return;
    const input = $<HTMLInputElement>('[data-campo="avance"]', fila);
    const select = $<HTMLSelectElement>('[data-campo="estado"]', fila);
    const fecha = $<HTMLInputElement>('[data-campo="fecha"]', fila);
    if (!input || !select) return;

    if (completada) {
      input.value = '100';
      select.value = 'Completada';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (fecha && !fecha.value) {
        fecha.value = new Date().toISOString().slice(0, 10);
        fecha.removeAttribute('disabled');
      }
    } else if (usarCero) {
      // Dentro de un objetivo tocado, "no marcada" significa 0 % conocido.
      input.value = '0';
      select.value = 'No iniciada';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (fecha && !fecha.value) {
        fecha.value = new Date().toISOString().slice(0, 10);
        fecha.removeAttribute('disabled');
      }
    } else {
      // Objetivo sin tocar: se deja sin dato para no inventar 0 %.
      input.value = '';
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    avisar(actividadId);
  };

  /** Un objetivo está "tocado" si alguna de sus actividades tiene % registrado. */
  const objetivoTocado = (objetivoId: number): boolean => {
    const p = pesos.get(objetivoId);
    if (!p) return false;
    return [...p.participacion.keys()].some((id) => leerAvance(id) !== null);
  };

  /**
   * Al tocar un objetivo con el checklist, el resto de sus actividades pasan a
   * 0 % (sabemos que no están hechas) para que el objetivo se lea como
   * "marcadas / total × 100". Los % parciales escritos a mano se respetan: solo
   * se tocan los valores vacíos, 0 o 100.
   */
  const normalizarObjetivo = (objetivoId: number): void => {
    const config = pesos.get(objetivoId);
    if (!config) return;
    for (const actId of config.participacion.keys()) {
      const actual = leerAvance(actId);
      if (actual === null || actual === 0 || actual === 100) marcar(actId, actual === 100, true);
    }
  };

  const pintar = (): void => {
    for (const obj of $$<HTMLElement>('[data-checklist-obj]', root)) {
      const objetivoId = Number(obj.dataset.obj);
      const config = pesos.get(objetivoId);
      if (!config) continue;

      const filas = $$<HTMLElement>('[data-checklist-act]', obj);
      let completas = 0;
      let reportadas = 0;
      let suma = 0;

      for (const fila of filas) {
        const actId = Number(fila.dataset.id);
        const box = $<HTMLInputElement>('[data-checklist-box]', fila);
        const avance = leerAvance(actId);
        const salida = $('[data-act-real]', fila);

        if (box) {
          // indeterminate = avance parcial (0 < avance < 100).
          box.checked = avance === 100;
          box.indeterminate = avance !== null && avance > 0 && avance < 100;
        }
        if (avance === null) {
          if (salida) salida.textContent = 'sin dato';
        } else {
          reportadas++;
          suma += avance;
          if (avance === 100) completas++;
          if (salida) salida.textContent = `${avance} %`;
        }
      }

      const real = reportadas === 0 ? null : Math.round((suma / reportadas) * 10) / 10;

      const salidaReal = $('[data-obj-real]', obj);
      if (salidaReal) salidaReal.textContent = real === null ? 'No calculado' : `${real} %`;

      const salidaCount = $('[data-obj-count]', obj);
      if (salidaCount) {
        salidaCount.textContent = reportadas === 0 ? '—' : `${completas} de ${filas.length}`;
      }

      // Avance por participante: parte de su participación oficial completada.
      for (const pid of config.participantes) {
        const celda = $(`[data-part-real="${pid}"]`, obj);
        if (!celda) continue;
        let participTotal = 0;
        let participHecho = 0;
        let asignado = 0;
        let conDato = 0;
        for (const actId of config.participacion.keys()) {
          const pct = config.participacion.get(actId)?.get(pid) ?? 0;
          if (pct <= 0) continue;
          asignado++;
          participTotal += pct;
          const avance = leerAvance(actId);
          if (avance === null) continue;
          conDato++;
          if (avance === 100) participHecho += pct;
        }
        const valor =
          participTotal === 0 || conDato === 0
            ? null
            : Math.round((participHecho / participTotal) * 1000) / 10;
        celda.textContent = valor === null ? 'No calculado' : `${valor} %`;
      }
    }
  };

  // --- eventos ---
  root.addEventListener('change', (ev) => {
    const box = (ev.target as HTMLElement).closest('[data-checklist-box]') as HTMLElement | null;
    if (!box) return;
    const fila = box.closest('[data-checklist-act]') as HTMLElement;
    const objetivoId = Number(fila.closest('[data-checklist-obj]')?.dataset.obj);
    const actividadId = Number(fila.dataset.id);
    const yaTocado = objetivoTocado(objetivoId);

    if (box.checked) {
      // Primera marca del objetivo: el resto pasa a 0 % para que el objetivo
      // se lea como marcadas / total × 100.
      if (!yaTocado) normalizarObjetivo(objetivoId);
      marcar(actividadId, true, true);
    } else {
      marcar(actividadId, false, yaTocado);
    }
    pintar();
  });

  $('[data-checklist-marcar-todo]')?.addEventListener('click', () => {
    for (const box of $$<HTMLInputElement>('[data-checklist-box]', root)) box.checked = true;
    for (const fila of $$<HTMLElement>('[data-checklist-act]', root)) {
      marcar(Number(fila.dataset.id), true, true);
    }
    pintar();
  });

  $('[data-checklist-limpiar]')?.addEventListener('click', () => {
    if (!confirm('¿Quitar el % de avance de las 36 actividades? (No toca el archivo del repo)')) return;
    for (const fila of $$<HTMLElement>('[data-checklist-act]', root)) {
      marcar(Number(fila.dataset.id), false, false);
    }
    pintar();
  });

  // El checklist también se repinta si se edita el % a mano en el formulario
  // de arriba: las dos vistas leen los mismos campos.
  const formulario = $<HTMLElement>('[data-avance-form]');
  formulario?.addEventListener('input', () => pintar());
  formulario?.addEventListener('change', () => pintar());

  pintar();
}
