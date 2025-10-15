const ROUTES = {
  '/': renderClientDashboard,
  '/espace-client': renderClientDashboard,
  '/administration': renderAdminOverview,
  '/404': renderNotFound,
};

let outlet = null;
let onRouteChange = () => {};

export function initRouter(outletElement, options = {}) {
  outlet = outletElement;
  onRouteChange = typeof options.onRouteChange === 'function' ? options.onRouteChange : () => {};

  window.addEventListener('popstate', () => {
    const path = getCurrentPath();
    route(path);
    onRouteChange(path);
  });

  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('a[data-router-link="true"]');
    if (!target) return;
    const href = target.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    event.preventDefault();
    navigateTo(href);
  });

  const initialPath = getCurrentPath();
  route(initialPath);
  onRouteChange(initialPath);
}

export function navigateTo(path) {
  const safePath = normalise(path);
  if (safePath === getCurrentPath()) {
    route(safePath);
    onRouteChange(safePath);
    return;
  }
  window.history.pushState({}, '', safePath);
  route(safePath);
  onRouteChange(safePath);
}

export function getCurrentPath() {
  const { pathname } = window.location;
  return normalise(pathname);
}

function route(path) {
  if (!outlet) return;
  const render = ROUTES[path] || ROUTES['/404'];
  try {
    outlet.setAttribute('data-route', path);
    outlet.innerHTML = '';
    render(outlet, path);
  } catch (error) {
    console.error(error);
    if (typeof window.showFatal === 'function') {
      window.showFatal('Une erreur empêche l\'affichage.');
    }
  }
}

function renderClientDashboard(root, path) {
  const summary = getClientSummary();
  const heading = path === '/espace-client' || path === '/' ? 'Tableau de bord client' : 'Espace client';
  root.innerHTML = `
    <header class="main__header">
      <p class="main__subtitle">Bonjour ${summary.contact}, voici votre suivi en direct.</p>
      <h1 class="main__title">${heading}</h1>
    </header>
    <section aria-label="Statistiques de livraisons" class="dashboard-grid">
      <article class="dashboard-card" role="status">
        <span class="dashboard-card__label">Courses du jour</span>
        <span class="dashboard-card__value">${summary.todayDeliveries}</span>
      </article>
      <article class="dashboard-card">
        <span class="dashboard-card__label">Course urgente</span>
        <span class="dashboard-card__value">${summary.urgentPickup}</span>
        <p class="dashboard-card__label">Collecte prévue à ${summary.nextPickup}</p>
      </article>
      <article class="dashboard-card">
        <span class="dashboard-card__label">Satisfaction</span>
        <span class="dashboard-card__value">${summary.satisfaction}%</span>
        <p class="dashboard-card__label">Basée sur les livraisons des 30 derniers jours.</p>
      </article>
    </section>
    <section class="alert-box" role="region" aria-live="polite">
      <strong>Bon à savoir :</strong> Les créneaux premium soir sont ouverts jusqu'à 22h.
    </section>
    <button class="cta-button" data-action="new-delivery">Programmer une livraison</button>
  `;

  const button = root.querySelector('[data-action="new-delivery"]');
  button?.addEventListener('click', () => {
    alert('Créneau réservé ! Un conseiller vous recontacte sous 5 minutes.');
  });
}

function renderAdminOverview(root) {
  root.innerHTML = `
    <header class="main__header">
      <h1 class="main__title">Administration</h1>
      <p class="main__subtitle">Gestion des comptes, tournées et notifications.</p>
    </header>
    <div class="alert-box">
      <strong>Information :</strong> Les fonctionnalités avancées arrivent prochainement.
    </div>
  `;
}

function renderNotFound(root) {
  root.innerHTML = `
    <section class="not-found" aria-labelledby="not-found-title">
      <h1 id="not-found-title" class="not-found__title">Page non trouvée</h1>
      <p class="not-found__description">La page que vous recherchez est introuvable. Revenez à l'espace client.</p>
      <button class="cta-button not-found__cta" data-go-home>Retour à l'espace client</button>
    </section>
  `;

  root.querySelector('[data-go-home]')?.addEventListener('click', () => {
    navigateTo('/espace-client');
  });
}

function normalise(path) {
  if (!path) return '/';
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function getClientSummary() {
  const key = 'one-connexion:client-dashboard';
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Impossible de lire les données du tableau de bord', error);
  }
  const fallback = {
    contact: 'Alexandre',
    todayDeliveries: 5,
    urgentPickup: 'Clinique Pasteur',
    nextPickup: '16:45',
    satisfaction: 97,
  };
  try {
    window.localStorage.setItem(key, JSON.stringify(fallback));
  } catch (error) {
    console.warn('Impossible de sauvegarder les données du tableau de bord', error);
  }
  return fallback;
}
