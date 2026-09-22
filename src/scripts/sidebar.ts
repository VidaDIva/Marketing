export function initSidebar(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-sidebar-close]');
  const overlay = document.querySelector<HTMLElement>('[data-sidebar-overlay]');
  const sidebar = document.querySelector<HTMLElement>('[data-sidebar]');

  const open = (): void => {
    document.body.classList.add('sidebar-open');
    sidebar?.classList.add('is-open');
  };

  const close = (): void => {
    document.body.classList.remove('sidebar-open');
    sidebar?.classList.remove('is-open');
  };

  toggle?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  sidebar?.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1100px)').matches) close();
    });
  });
}