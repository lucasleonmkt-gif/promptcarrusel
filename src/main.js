import { STORAGE_KEYS } from "./config.js";
import { renderNavbar } from "./components/navbar.js";
import { copyToClipboard, pulseButton, showToast } from "./utils/dom.js";
import {
  createPrompt,
  deletePrompt,
  getPromptById,
  getState,
  incrementViews,
  logoutAdmin,
  subscribe,
  toggleFavorite,
  toggleLike,
  unlockAdmin,
  updatePrompt,
} from "./store/promptStore.js";
import { renderAdminView } from "./views/adminView.js";
import { renderDetailView } from "./views/detailView.js";
import { renderHomeView } from "./views/homeView.js";

const app = document.querySelector("#app");
let cleanup = null;

const actions = {
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleLike,
  toggleFavorite,
  getPromptById,
  unlockAdmin,
  logoutAdmin,
};

function parseRoute() {
  const hash = window.location.hash || "#/";
  const normalized = hash.replace(/^#\/?/, "");
  const parts = normalized.split("/").filter(Boolean);

  if (parts[0] === "prompt" && parts[1]) {
    return { name: "detail", id: parts[1] };
  }

  if (parts[0] === "admin") {
    return { name: "admin", editId: parts[1] === "edit" && parts[2] ? parts[2] : null };
  }

  return { name: "home" };
}

function buildPromptUrl(promptId) {
  return `${window.location.href.split("#")[0]}#/prompt/${promptId}`;
}

function ensurePromptView(promptId) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.sessionViews);
    const trackedIds = raw ? JSON.parse(raw) : [];
    if (trackedIds.includes(promptId)) {
      return false;
    }

    sessionStorage.setItem(STORAGE_KEYS.sessionViews, JSON.stringify([...trackedIds, promptId]));
  } catch {
    return false;
  }

  incrementViews(promptId);
  return true;
}

async function sharePrompt(promptId) {
  const prompt = getPromptById(promptId);
  if (!prompt) {
    return;
  }

  const shareData = {
    title: prompt.title,
    text: `Mira este prompt: ${prompt.title}`,
    url: buildPromptUrl(prompt.id),
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch {
      // Ignore and fall back to clipboard.
    }
  }

  await copyToClipboard(shareData.url);
  showToast("Enlace copiado");
}

function bindGlobalActions() {
  const clickHandler = async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const promptId = target.dataset.id;
    const prompt = promptId ? getPromptById(promptId) : null;

    switch (target.dataset.action) {
      case "open-detail":
        if (promptId) {
          window.location.hash = `#/prompt/${promptId}`;
        }
        break;
      case "edit-prompt":
        if (promptId) {
          window.location.hash = `#/admin/edit/${promptId}`;
        }
        break;
      case "toggle-like":
        if (!promptId) {
          return;
        }
        toggleLike(promptId);
        showToast("Like actualizado");
        break;
      case "toggle-favorite":
        if (!promptId) {
          return;
        }
        toggleFavorite(promptId);
        showToast("Favoritos actualizados");
        break;
      case "share-prompt":
        if (!promptId) {
          return;
        }
        await sharePrompt(promptId);
        break;
      case "copy-prompt":
        if (!prompt) {
          return;
        }
        await copyToClipboard(prompt.prompt);
        pulseButton(target);
        showToast("Prompt copiado");
        break;
      default:
        break;
    }
  };

  app?.addEventListener("click", clickHandler);

  return () => {
    app?.removeEventListener("click", clickHandler);
  };
}

function render() {
  cleanup?.();

  const state = getState();
  const route = parseRoute();
  const view =
    route.name === "detail"
      ? renderDetailView(state, route.id)
      : route.name === "admin"
        ? renderAdminView(state, route)
        : renderHomeView(state);

  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell workspace-shell">
      ${renderNavbar(state, route)}
      <main class="page-shell">${view.html}</main>
    </div>
  `;

  const unbindGlobal = bindGlobalActions();
  const unbindView =
    typeof view.bind === "function"
      ? view.bind({
          state,
          route,
          actions,
          showToast,
          requestRender: render,
          ensurePromptView,
        })
      : () => {};

  cleanup = () => {
    unbindGlobal?.();
    unbindView?.();
  };
}

subscribe(() => render());
window.addEventListener("hashchange", render);
render();
