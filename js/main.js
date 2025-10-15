import { initRouter, navigateTo, getCurrentPath } from './router.js';
import { renderSidebar } from './components/sidebar.js';

function mountApplication() {
  const appRoot = document.getElementById('app');
  if (!appRoot) {
    throw new Error('#app introuvable');
  }

  const layout = document.createElement('div');
  layout.className = 'layout';

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.setAttribute('aria-label', 'Navigation principale');

  const main = document.createElement('main');
  main.className = 'main';
  main.setAttribute('tabindex', '-1');

  layout.appendChild(sidebar);
  layout.appendChild(main);

  appRoot.innerHTML = '';
  appRoot.appendChild(layout);

  renderSidebar(sidebar, getCurrentPath(), navigateTo);

  initRouter(main, {
    onRouteChange: (path) => {
      renderSidebar(sidebar, path, navigateTo);
      main.focus({ preventScroll: false });
    },
  });
}

try {
  mountApplication();
} catch (error) {
  console.error(error);
  if (typeof window.showFatal === 'function') {
    window.showFatal('Une erreur empêche l\'affichage.');
  }
}
