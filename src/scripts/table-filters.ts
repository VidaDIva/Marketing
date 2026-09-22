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
        if (want && (row.dataset[`f${col}`] ?? '') !== want) {
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