import { escapeHtml, formatCompactNumber, truncate } from "../utils/formatters.js";

export function renderPromptCard(prompt, user) {
  const liked = user.liked.includes(prompt.id);
  const favorited = user.favorites.includes(prompt.id);
  const canEdit = user.adminUnlocked;
  const firstImage = prompt.images[0];
  const tags = prompt.tags.slice(0, 3);

  return `
    <article
      class="prompt-card"
      data-prompt-card
      data-title="${escapeHtml(prompt.title.toLowerCase())}"
      data-tags="${escapeHtml(prompt.tags.join(" "))}"
    >
      <button class="card-image-button" data-action="open-detail" data-id="${prompt.id}">
        <div class="card-image-shell">
          <img src="${firstImage}" alt="${escapeHtml(prompt.title)}" loading="lazy" />
          <span class="card-overlay">Ver más</span>
        </div>
      </button>

      <div class="card-body">
        <div class="card-title-row">
          <button class="card-title-button" data-action="open-detail" data-id="${prompt.id}">
            <h2 class="card-title">${escapeHtml(prompt.title)}</h2>
          </button>
          <button
            class="icon-button ${favorited ? "is-active" : ""}"
            data-action="toggle-favorite"
            data-id="${prompt.id}"
            aria-label="Guardar prompt"
            title="Guardar prompt"
          >
            ${favorited ? "★" : "☆"}
          </button>
        </div>

        <p class="helper-text">${escapeHtml(truncate(prompt.prompt, 124))}</p>
        <div class="inline-list card-tags">
          ${tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}
        </div>

        <div class="card-actions">
          <div class="inline-list">
            ${canEdit ? `<button class="mini-button" data-action="edit-prompt" data-id="${prompt.id}">Editar</button>` : ""}
            <button class="ghost-button" data-action="open-detail" data-id="${prompt.id}">
              Ver prompt
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
