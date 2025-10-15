const THEME_KEY = 'one-connexion:theme';

export function renderSidebar(container, currentPath, onNavigate) {
  if (!container) return;
  container.innerHTML = `
    <div class="sidebar__brand" aria-label="One Connexion">One Connexion</div>
    <nav class="sidebar__nav" aria-label="Sections du portail">
      <a class="sidebar__link" data-router-link="true" href="/espace-client" ${
        currentPath === '/espace-client' || currentPath === '/' ? 'aria-current="page"' : ''
      }>Espace client</a>
      <a class="sidebar__link" data-router-link="true" href="/administration" ${
        currentPath === '/administration' ? 'aria-current="page"' : ''
      }>Administration</a>
    </nav>
    <div class="sidebar__section" aria-live="polite">
      <p class="sidebar__section-title">Préférences</p>
      <button type="button" class="theme-toggle" data-theme-toggle>
        <span aria-hidden="true">🌓</span>
        <span>Changer de thème</span>
      </button>
    </div>
  `;

  container.querySelectorAll('a[data-router-link="true"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!onNavigate) return;
      event.preventDefault();
      const href = link.getAttribute('href');
      if (!href) return;
      onNavigate(href);
    });
  });

  const toggle = container.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const html = document.documentElement;
      const nextTheme = html.dataset.theme === 'dark' ? 'light' : 'dark';
      html.dataset.theme = nextTheme;
      try {
        window.localStorage.setItem(THEME_KEY, nextTheme);
      } catch (error) {
        console.warn('Impossible d\'enregistrer le thème', error);
      }
    });
  }

  applySavedTheme();
}

function applySavedTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved) {
      document.documentElement.dataset.theme = saved;
    }
  } catch (error) {
    console.warn('Impossible de lire le thème enregistré', error);
  }
}
