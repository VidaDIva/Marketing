export function setupTableFilters(root: HTMLElement): void {
  const rows = Array.from(root.querySelectorAll<HTMLTableRowElement>('[data-table-row]'));
  const selects = Array.from(root.querySelectorAll<HTMLSelectElement>('select[data-filter-col]'));
  const search = root.querySelector<HTMLInputElement>('[data-table-search]');
  const count = root.querySelector<HTMLElement>('[data-table-count]');
  const emptyRow = root.querySelector<HTMLElement>('[data-table-empty]');
  if (rows.length === 0) return;

  const apply = (): void => {
    const term = search?.value.trim().toLowerCase() ?? '';
    let visible = 0;
    for (const row of rows) {
      let ok = true;
      for (const sel of selects) {
        const col = sel.dataset.filterCol ?? '';
        const want = sel.value;
        if (!want) continue;
        // El valor de la fila puede ser una lista separada por "|" (p. ej. varios
        // participantes por actividad). Si lo es, basta con que coincida uno.
        // Se lee con getAttribute porque el nombre se construye igual que en
        // `DataTable.astro`; `dataset` no sirve para claves con guion variable.
        const value = row.getAttribute(`data-f-${col}`) ?? '';
        const candidates = value.includes('|') ? value.split('|') : [value];
        if (!candidates.includes(want)) {
          ok = false;
          break;
        }
      }
      if (ok && term) {
        ok = row.textContent?.toLowerCase().includes(term) ?? false;
      }
      if (ok) visible++;
      row.hidden = !ok;
    }
    if (count) count.textContent = `Mostrando ${visible} de ${rows.length}`;
    if (emptyRow) emptyRow.hidden = visible > 0;
  };

  selects.forEach((s) => s.addEventListener('change', apply));
  search?.addEventListener('input', apply);
  apply();
}