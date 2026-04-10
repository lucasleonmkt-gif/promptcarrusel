import { renderPromptCard } from "../components/promptCard.js";
export function renderHomeView(state) {
  const prompts = state.prompts;
  if (!prompts.length) {
    return {
      html: `
        <section class="empty-panel glass-panel">
          <span class="eyebrow">Catálogo vacío</span>
          <h2 class="section-title">Tu biblioteca está lista para empezar.</h2>
          <p>
            Todavía no hay prompts cargados. Entra al dashboard privado para publicar el primero con sus
            imágenes, tags y texto listo para copiar.
          </p>
          <div class="hero-actions">
            <a class="primary-button" href="#/admin">Abrir dashboard</a>
          </div>
        </section>
      `,
      bind: () => () => {},
    };
  }

  return {
    html: `
      <section class="toolbar glass-panel">
        <div class="search-shell">
          <input
            id="prompt-search"
            class="search-input"
            type="search"
            placeholder="Buscar por título, idea o estilo visual"
          />
        </div>
      </section>

      <section class="prompt-grid" id="prompt-grid">
        ${prompts.map((prompt) => renderPromptCard(prompt, state.user)).join("")}
      </section>

      <section class="empty-panel glass-panel hidden" id="empty-state">
        <h2 class="section-title">No encontramos prompts con ese filtro</h2>
        <p>Prueba con otra palabra, borra la búsqueda o cambia la categoría activa.</p>
      </section>
    `,
    bind: () => {
      const searchInput = document.querySelector("#prompt-search");
      const cards = Array.from(document.querySelectorAll("[data-prompt-card]"));
      const emptyState = document.querySelector("#empty-state");

      const applyFilters = () => {
        const query = searchInput?.value.trim().toLowerCase() ?? "";
        let visible = 0;

        cards.forEach((card) => {
          const title = card.dataset.title ?? "";
          const tags = card.dataset.tags ?? "";
          const shouldShow = !query || title.includes(query) || tags.includes(query);
          card.classList.toggle("hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        emptyState?.classList.toggle("hidden", visible > 0);
      };

      searchInput?.addEventListener("input", applyFilters);

      return () => {
        searchInput?.removeEventListener("input", applyFilters);
      };
    },
  };
}
