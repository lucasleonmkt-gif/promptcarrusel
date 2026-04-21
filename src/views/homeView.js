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
      <section class="prompt-grid" id="prompt-grid">
        ${prompts.map((prompt) => renderPromptCard(prompt, state.user)).join("")}
      </section>
    `,
    bind: () => () => {},
  };
}
