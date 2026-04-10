import { bindCarousel, renderCarousel } from "../components/carousel.js";
import { escapeHtml, formatCompactNumber, formatLongDate } from "../utils/formatters.js";

export function renderDetailView(state, promptId) {
  const prompt = state.prompts.find((item) => item.id === promptId);

  if (!prompt) {
    return {
      html: `
        <section class="empty-panel glass-panel">
          <h2 class="section-title">Este prompt no existe</h2>
          <p>Puede haber sido eliminado o el enlace no es válido.</p>
          <a class="primary-button" href="#/">Volver a la biblioteca</a>
        </section>
      `,
      bind: () => () => {},
    };
  }

  const liked = state.user.liked.includes(prompt.id);
  const favorited = state.user.favorites.includes(prompt.id);
  const canEdit = state.user.adminUnlocked;
  const relatedPrompts = state.prompts.filter((item) => item.id !== prompt.id).slice(0, 3);

  return {
    html: `
      <section class="detail-layout">
        <div class="detail-panel glass-panel">
          <div class="detail-header">
            <span class="eyebrow">Prompt visual</span>
            <h1>${escapeHtml(prompt.title)}</h1>
            <p class="detail-copy">
              Resultado primero, texto listo para copiar y un flujo de exploración pensado para que la acción
              principal ocurra en segundos.
            </p>
          </div>

          <div class="detail-actions">
            <button class="secondary-button ${liked ? "is-active" : ""}" data-action="toggle-like" data-id="${prompt.id}">
              ${liked ? "Liked" : "Like"} ${formatCompactNumber(prompt.likes)}
            </button>
            <button
              class="secondary-button ${favorited ? "is-active" : ""}"
              data-action="toggle-favorite"
              data-id="${prompt.id}"
            >
              ${favorited ? "Guardado" : "Guardar"}
            </button>
            <button class="ghost-button" data-action="share-prompt" data-id="${prompt.id}">Compartir</button>
            ${canEdit ? `<button class="ghost-button" data-action="edit-prompt" data-id="${prompt.id}">Editar prompt</button>` : ""}
          </div>

          ${renderCarousel(prompt.images, prompt.title)}
        </div>

        <aside class="detail-panel glass-panel">
          <div class="prompt-toolbar">
            <h2 class="section-title">Prompt listo para usar</h2>
            <button class="primary-button" data-action="copy-prompt" data-id="${prompt.id}">Copiar prompt</button>
          </div>

          <div class="prompt-box glass-panel">
            <pre>${escapeHtml(prompt.prompt)}</pre>
          </div>

          <div class="meta-grid">
            <span class="pill">Autor ${escapeHtml(prompt.author)}</span>
            <span class="pill">Vistas ${formatCompactNumber(prompt.views)}</span>
            <span class="pill">Creado ${formatLongDate(prompt.createdAt)}</span>
          </div>

          <div class="inline-list">
            ${prompt.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}
          </div>

          <p class="support-copy">
            La vista individual está preparada para crecer con autenticación, comentarios o analytics reales
            sin rehacer la experiencia principal.
          </p>
        </aside>
      </section>

      <section class="related-panel glass-panel detail-panel">
        <div class="toolbar-row">
          <div>
            <h2 class="section-title">Más prompts para explorar</h2>
            <p class="support-copy">Mantén el recorrido visual sin perder el contexto del prompt actual.</p>
          </div>
          <a class="ghost-button" href="#/">Volver al home</a>
        </div>

        <div class="related-grid">
          ${relatedPrompts
            .map(
              (item) => `
                <article class="related-card">
                  <img src="${item.images[0]}" alt="${escapeHtml(item.title)}" />
                  <div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.tags.join(" · "))}</p>
                  </div>
                  <button class="ghost-button" data-action="open-detail" data-id="${item.id}">Ver detalle</button>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `,
    bind: ({ ensurePromptView }) => {
      ensurePromptView(prompt.id);
      return bindCarousel(document.querySelector("[data-carousel]"));
    },
  };
}
