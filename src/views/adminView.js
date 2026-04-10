import { ADMIN_ACCESS_CODE } from "../config.js";
import { truncate, escapeHtml, formatCompactNumber } from "../utils/formatters.js";
import { fileListToDataUrls } from "../utils/media.js";

function createEmptyDraft() {
  return {
    id: null,
    title: "",
    author: "Admin Studio",
    tags: "",
    prompt: "",
    images: [],
  };
}

let adminDraft = createEmptyDraft();
let adminFlashMessage = "";

function hydrateDraft(prompt) {
  if (!prompt) {
    adminDraft = createEmptyDraft();
    return;
  }

  adminDraft = {
    id: prompt.id,
    title: prompt.title,
    author: prompt.author,
    tags: prompt.tags.join(", "),
    prompt: prompt.prompt,
    images: [...prompt.images],
  };
}

export function renderAdminView(state, route) {
  if (!state.user.adminUnlocked) {
    return {
      html: `
        <section class="login-shell">
          <div class="login-panel glass-panel">
            <span class="eyebrow">Private admin</span>
            <h2>Dashboard privado para cargar y editar prompts</h2>
            <p class="support-copy">
              Esta protección es local y sirve como placeholder hasta que agregues autenticación real. Código
              de demo: <strong>${escapeHtml(ADMIN_ACCESS_CODE)}</strong>.
            </p>
            <form id="admin-login-form" class="form-grid">
              <input
                id="admin-access-code"
                class="login-input"
                type="password"
                placeholder="Ingresa el código de acceso"
                autocomplete="off"
              />
              <div class="login-actions">
                <button class="primary-button" type="submit">Entrar al dashboard</button>
                <a class="ghost-button" href="#/">Volver al home</a>
              </div>
            </form>
          </div>
        </section>
      `,
      bind: ({ showToast, actions }) => {
        const form = document.querySelector("#admin-login-form");
        const input = document.querySelector("#admin-access-code");

        const submitHandler = (event) => {
          event.preventDefault();
          const success = actions.unlockAdmin(input.value.trim());
          if (!success) {
            showToast("Código incorrecto");
            return;
          }

          showToast("Dashboard desbloqueado");
        };

        form?.addEventListener("submit", submitHandler);

        return () => {
          form?.removeEventListener("submit", submitHandler);
        };
      },
    };
  }

  if (route?.editId && adminDraft.id !== route.editId) {
    const routePrompt = state.prompts.find((prompt) => prompt.id === route.editId);
    if (routePrompt) {
      hydrateDraft(routePrompt);
    }
  }

  if (adminDraft.id && !state.prompts.find((prompt) => prompt.id === adminDraft.id)) {
    hydrateDraft(null);
  }

  const totalViews = state.prompts.reduce((total, prompt) => total + prompt.views, 0);
  const totalLikes = state.prompts.reduce((total, prompt) => total + prompt.likes, 0);

  return {
    html: `
      <section class="admin-layout">
        <div class="form-shell glass-panel">
          <div class="toolbar-row">
            <div>
              <span class="eyebrow">Admin studio</span>
              <h2>${adminDraft.id ? "Editar prompt" : "Crear nuevo prompt"}</h2>
            </div>
            <button class="ghost-button" id="admin-logout-button" type="button">Cerrar sesión</button>
          </div>

          <p class="support-copy">
            Carga imágenes, texto del prompt y tags desde una sola interfaz. La persistencia queda en
            <code>localStorage</code>, con una capa fácil de migrar a backend real.
          </p>

          ${adminFlashMessage ? `<div class="status-banner">${escapeHtml(adminFlashMessage)}</div>` : ""}

          <form id="admin-form" class="form-grid">
            <div class="form-grid two-cols">
              <label class="admin-label">
                Título
                <input class="admin-input" name="title" value="${escapeHtml(adminDraft.title)}" required />
              </label>

              <label class="admin-label">
                Autor
                <input class="admin-input" name="author" value="${escapeHtml(adminDraft.author)}" />
              </label>
            </div>

            <label class="admin-label">
              Tags
              <input
                class="admin-input"
                name="tags"
                value="${escapeHtml(adminDraft.tags)}"
                placeholder="ui, saas, editorial"
              />
            </label>

            <label class="admin-label">
              Prompt
              <textarea class="admin-textarea" name="prompt" required>${escapeHtml(adminDraft.prompt)}</textarea>
            </label>

            <div class="upload-zone">
              <label class="admin-label">
                Subida de múltiples imágenes
                <input id="image-upload-input" type="file" accept="image/*" multiple />
              </label>
              <p class="helper-text">Puedes arrastrar resultados, mockups o renders. Se guardan localmente en el navegador.</p>
            </div>

            <div class="upload-preview-grid">
              ${adminDraft.images
                .map(
                  (image, index) => `
                    <div class="upload-preview">
                      <img src="${image}" alt="Preview ${index + 1}" />
                      <button class="upload-remove" type="button" data-remove-image="${index}" aria-label="Eliminar imagen">
                        ×
                      </button>
                    </div>
                  `,
                )
                .join("")}
            </div>

            <div class="form-actions">
              <button class="primary-button" type="submit">${adminDraft.id ? "Guardar cambios" : "Publicar prompt"}</button>
              <button class="ghost-button" id="admin-reset-button" type="button">Limpiar formulario</button>
            </div>
          </form>
        </div>

        <div class="admin-shell glass-panel">
          <div class="stats-list">
            <div class="stat-card">
              <strong>${state.prompts.length}</strong>
              <span>Prompts publicados</span>
            </div>
            <div class="stat-card">
              <strong>${formatCompactNumber(totalLikes)}</strong>
              <span>Likes acumulados</span>
            </div>
            <div class="stat-card">
              <strong>${formatCompactNumber(totalViews)}</strong>
              <span>Vistas totales</span>
            </div>
          </div>

          <div class="toolbar-row">
            <div>
              <h2 class="section-title">Contenido actual</h2>
              <p class="support-copy">Edita, elimina o abre cada prompt en su detalle público.</p>
            </div>
          </div>

          <div class="prompt-list" id="admin-prompt-list">
            ${
              state.prompts.length
                ? state.prompts
                    .map(
                      (prompt) => `
                        <article class="prompt-item">
                          <img src="${prompt.images[0]}" alt="${escapeHtml(prompt.title)}" />
                          <div>
                            <h3>${escapeHtml(prompt.title)}</h3>
                            <p>${escapeHtml(truncate(prompt.prompt, 120))}</p>
                            <div class="detail-meta">
                              <span>Likes ${formatCompactNumber(prompt.likes)}</span>
                              <span>Vistas ${formatCompactNumber(prompt.views)}</span>
                            </div>
                            <div class="card-actions">
                              <button class="mini-button" type="button" data-edit-prompt="${prompt.id}">Editar</button>
                              <a class="mini-button" href="#/prompt/${prompt.id}">Abrir</a>
                              <button class="mini-button danger" type="button" data-delete-prompt="${prompt.id}">Eliminar</button>
                            </div>
                          </div>
                        </article>
                      `,
                    )
                    .join("")
                : `
                    <div class="empty-panel">
                      <h3 class="section-title">Aún no hay prompts publicados</h3>
                      <p>Usa el formulario de la izquierda para cargar el primero.</p>
                    </div>
                  `
            }
          </div>
        </div>
      </section>
    `,
    bind: ({ actions, showToast, requestRender }) => {
      const form = document.querySelector("#admin-form");
      const uploadInput = document.querySelector("#image-upload-input");
      const logoutButton = document.querySelector("#admin-logout-button");
      const resetButton = document.querySelector("#admin-reset-button");
      const promptList = document.querySelector("#admin-prompt-list");
      const previewGrid = document.querySelector(".upload-preview-grid");

      const inputHandler = (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
          return;
        }

        if (!target.name) {
          return;
        }

        adminDraft = {
          ...adminDraft,
          [target.name]: target.value,
        };
      };

      const uploadHandler = async () => {
        if (!(uploadInput instanceof HTMLInputElement) || !uploadInput.files?.length) {
          return;
        }

        const newImages = await fileListToDataUrls(uploadInput.files);
        adminDraft = {
          ...adminDraft,
          images: [...adminDraft.images, ...newImages],
        };
        uploadInput.value = "";
        requestRender();
        showToast(`${newImages.length} imagen${newImages.length > 1 ? "es" : ""} cargada${newImages.length > 1 ? "s" : ""}`);
      };

      const previewHandler = (event) => {
        const removeButton = event.target.closest("[data-remove-image]");
        if (!removeButton) {
          return;
        }

        const imageIndex = Number(removeButton.dataset.removeImage);
        adminDraft = {
          ...adminDraft,
          images: adminDraft.images.filter((_, index) => index !== imageIndex),
        };
        requestRender();
      };

      const submitHandler = (event) => {
        event.preventDefault();

        if (!(form instanceof HTMLFormElement)) {
          return;
        }

        const formData = new FormData(form);
        const payload = {
          title: String(formData.get("title") ?? "").trim(),
          author: String(formData.get("author") ?? "").trim(),
          tags: String(formData.get("tags") ?? "").trim(),
          prompt: String(formData.get("prompt") ?? "").trim(),
          images: [...adminDraft.images],
        };

        if (!payload.title || !payload.prompt) {
          showToast("Completa título y prompt");
          return;
        }

        if (!payload.images.length) {
          showToast("Sube al menos una imagen");
          return;
        }

        if (adminDraft.id) {
          adminFlashMessage = `Prompt "${payload.title}" actualizado correctamente.`;
          hydrateDraft(null);
          actions.updatePrompt(adminDraft.id, payload);
          showToast("Prompt actualizado");
          if (window.location.hash !== "#/admin") {
            window.location.hash = "#/admin";
          }
          return;
        }

        adminFlashMessage = `Prompt "${payload.title}" publicado correctamente.`;
        hydrateDraft(null);
        actions.createPrompt(payload);
        showToast("Prompt publicado");
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

      const listHandler = (event) => {
        const editButton = event.target.closest("[data-edit-prompt]");
        if (editButton) {
          const prompt = actions.getPromptById(editButton.dataset.editPrompt);
          hydrateDraft(prompt);
          requestRender();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const deleteButton = event.target.closest("[data-delete-prompt]");
        if (deleteButton) {
          const prompt = actions.getPromptById(deleteButton.dataset.deletePrompt);
          if (!prompt) {
            return;
          }

          const confirmed = window.confirm(`Eliminar "${prompt.title}"?`);
          if (!confirmed) {
            return;
          }

          adminFlashMessage = `Prompt "${prompt.title}" eliminado.`;
          actions.deletePrompt(prompt.id);
          if (adminDraft.id === prompt.id) {
            hydrateDraft(null);
          }
          showToast("Prompt eliminado");
        }
      };

      const logoutHandler = () => {
        actions.logoutAdmin();
        adminFlashMessage = "";
        showToast("Sesión cerrada");
      };

      const resetHandler = () => {
        hydrateDraft(null);
        adminFlashMessage = "";
        requestRender();
      };

      form?.addEventListener("input", inputHandler);
      form?.addEventListener("submit", submitHandler);
      uploadInput?.addEventListener("change", uploadHandler);
      previewGrid?.addEventListener("click", previewHandler);
      promptList?.addEventListener("click", listHandler);
      logoutButton?.addEventListener("click", logoutHandler);
      resetButton?.addEventListener("click", resetHandler);

      return () => {
        form?.removeEventListener("input", inputHandler);
        form?.removeEventListener("submit", submitHandler);
        uploadInput?.removeEventListener("change", uploadHandler);
        previewGrid?.removeEventListener("click", previewHandler);
        promptList?.removeEventListener("click", listHandler);
        logoutButton?.removeEventListener("click", logoutHandler);
        resetButton?.removeEventListener("click", resetHandler);
      };
    },
  };
}
