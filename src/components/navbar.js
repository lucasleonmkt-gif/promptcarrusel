import { APP_NAME, APP_TAGLINE } from "../config.js";
import { escapeHtml, formatCompactNumber } from "../utils/formatters.js";

export function renderNavbar(state, route) {
  const favoritesCount = state.user.favorites.length;
  const totalPrompts = state.prompts.length;
  const totalLikes = state.prompts.reduce((total, prompt) => total + prompt.likes, 0);

  return `
    <aside class="sidebar glass-panel">
      <a class="brand" href="#/">
        <div class="brand-mark">PA</div>
        <div class="brand-copy sidebar-copy">
          <strong>${escapeHtml(APP_NAME)}</strong>
          <p>${escapeHtml(APP_TAGLINE)}</p>
        </div>
      </a>

      <div class="sidebar-label">Navegación</div>
      <nav class="sidebar-nav">
        <a class="nav-link ${route.name === "home" ? "is-active" : ""}" href="#/">
          <span>Explorar</span>
          <span>${totalPrompts}</span>
        </a>
        <a class="nav-link ${route.name === "admin" ? "is-active" : ""}" href="#/admin">
          <span>Dashboard</span>
          <span>CRUD</span>
        </a>
        <span class="nav-pill">Favoritos ${favoritesCount}</span>
      </nav>

      <div class="sidebar-label">Resumen</div>
      <div class="sidebar-meta">
        <div class="sidebar-stat">
          <strong>${totalPrompts}</strong>
          <span>Colecciones publicadas</span>
        </div>
        <div class="sidebar-stat">
          <strong>${formatCompactNumber(totalLikes)}</strong>
          <span>Likes acumulados</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <a class="primary-button" href="#/admin">Nuevo prompt</a>
        <a class="ghost-button" href="#/">Feed visual</a>
      </div>
    </aside>
  `;
}
