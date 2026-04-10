import { ADMIN_ACCESS_CODE, APP_AUTHOR, STORAGE_KEYS } from "../config.js";
import { seedPrompts } from "../data/seedPrompts.js";

const listeners = new Set();

function createInitialState() {
  return {
    prompts: [...seedPrompts].sort((left, right) => right.likes - left.likes),
    user: {
      favorites: [],
      liked: [],
      adminUnlocked: false,
    },
  };
}

function normalizeState(rawState) {
  const base = createInitialState();

  if (!rawState || typeof rawState !== "object") {
    return base;
  }

  return {
    prompts: Array.isArray(rawState.prompts) && rawState.prompts.length ? rawState.prompts : base.prompts,
    user: {
      favorites: Array.isArray(rawState.user?.favorites) ? rawState.user.favorites : [],
      liked: Array.isArray(rawState.user?.liked) ? rawState.user.liked : [],
      adminUnlocked: Boolean(rawState.user?.adminUnlocked),
    },
  };
}

function loadState() {
  try {
    const persisted = localStorage.getItem(STORAGE_KEYS.appState);
    if (!persisted) {
      return createInitialState();
    }

    return normalizeState(JSON.parse(persisted));
  } catch {
    return createInitialState();
  }
}

let state = loadState();

function emit() {
  localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(state));
  listeners.forEach((listener) => listener(state));
}

function sortPrompts(prompts) {
  return [...prompts].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function normalizePromptPayload(payload, previousPrompt = {}) {
  const tags = Array.isArray(payload.tags)
    ? payload.tags
    : String(payload.tags ?? "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

  return {
    id: previousPrompt.id ?? payload.id ?? crypto.randomUUID(),
    title: String(payload.title ?? "").trim(),
    prompt: String(payload.prompt ?? "").trim(),
    author: String(payload.author ?? "").trim() || APP_AUTHOR,
    tags,
    images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : previousPrompt.images ?? [],
    likes: previousPrompt.likes ?? 0,
    views: previousPrompt.views ?? 0,
    createdAt: previousPrompt.createdAt ?? new Date().toISOString(),
  };
}

export function getState() {
  return state;
}

export function getPromptById(id) {
  return state.prompts.find((prompt) => prompt.id === id);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleLike(promptId) {
  const liked = new Set(state.user.liked);
  const hasLike = liked.has(promptId);
  const nextLiked = hasLike ? [...liked].filter((id) => id !== promptId) : [...liked, promptId];

  state = {
    ...state,
    prompts: state.prompts.map((prompt) =>
      prompt.id === promptId
        ? {
            ...prompt,
            likes: Math.max(0, prompt.likes + (hasLike ? -1 : 1)),
          }
        : prompt,
    ),
    user: {
      ...state.user,
      liked: nextLiked,
    },
  };

  emit();
  return !hasLike;
}

export function toggleFavorite(promptId) {
  const favorites = new Set(state.user.favorites);
  const hasFavorite = favorites.has(promptId);
  const nextFavorites = hasFavorite ? [...favorites].filter((id) => id !== promptId) : [...favorites, promptId];

  state = {
    ...state,
    user: {
      ...state.user,
      favorites: nextFavorites,
    },
  };

  emit();
  return !hasFavorite;
}

export function incrementViews(promptId) {
  state = {
    ...state,
    prompts: state.prompts.map((prompt) =>
      prompt.id === promptId
        ? {
            ...prompt,
            views: prompt.views + 1,
          }
        : prompt,
    ),
  };

  emit();
}

export function createPrompt(payload) {
  const prompt = normalizePromptPayload(payload);
  state = {
    ...state,
    prompts: sortPrompts([prompt, ...state.prompts]),
  };
  emit();
  return prompt;
}

export function updatePrompt(promptId, payload) {
  const previousPrompt = getPromptById(promptId);
  if (!previousPrompt) {
    return null;
  }

  const updatedPrompt = normalizePromptPayload(payload, previousPrompt);
  state = {
    ...state,
    prompts: sortPrompts(state.prompts.map((prompt) => (prompt.id === promptId ? updatedPrompt : prompt))),
  };
  emit();
  return updatedPrompt;
}

export function deletePrompt(promptId) {
  state = {
    ...state,
    prompts: state.prompts.filter((prompt) => prompt.id !== promptId),
    user: {
      ...state.user,
      favorites: state.user.favorites.filter((id) => id !== promptId),
      liked: state.user.liked.filter((id) => id !== promptId),
      adminUnlocked: state.user.adminUnlocked,
    },
  };
  emit();
}

export function unlockAdmin(code) {
  if (code !== ADMIN_ACCESS_CODE) {
    return false;
  }

  state = {
    ...state,
    user: {
      ...state.user,
      adminUnlocked: true,
    },
  };

  emit();
  return true;
}

export function logoutAdmin() {
  state = {
    ...state,
    user: {
      ...state.user,
      adminUnlocked: false,
    },
  };

  emit();
}
