(function () {
  const APP_NAME = "Prompt Atlas";
  const APP_TAGLINE = "Biblioteca visual de prompts para descubrir, copiar y escalar ideas.";
  const APP_AUTHOR = "Admin Studio";
  const ADMIN_ACCESS_CODE = "startup-admin";
  const STORAGE_KEYS = {
    appState: "prompt-atlas/state",
    sessionViews: "prompt-atlas/session-views",
  };

  function formatCompactNumber(value) {
    return new Intl.NumberFormat("es-AR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value ?? 0);
  }

  function formatLongDate(value) {
    if (!value) {
      return "Sin fecha";
    }

    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function truncate(value, length) {
    const safeValue = String(value ?? "");
    if (safeValue.length <= length) {
      return safeValue;
    }

    return `${safeValue.slice(0, length).trim()}...`;
  }

  function svgToDataUri(svg) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function createArtwork(options) {
    const { title, eyebrow, accent, secondary, glow, height } = options;
    const safeTitle = String(title).replaceAll("&", "&amp;");
    const safeEyebrow = String(eyebrow).replaceAll("&", "&amp;");

    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#08111f"/>
            <stop offset="48%" stop-color="${secondary}"/>
            <stop offset="100%" stop-color="${accent}"/>
          </linearGradient>
          <radialGradient id="halo" cx="0.24" cy="0.18" r="0.8">
            <stop offset="0%" stop-color="${glow}" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1080" height="${height}" rx="72" fill="url(#bg)"/>
        <circle cx="220" cy="170" r="280" fill="url(#halo)"/>
        <circle cx="880" cy="${Math.round(height * 0.66)}" r="220" fill="${glow}" fill-opacity="0.22"/>
        <path d="M120 ${Math.round(height * 0.72)}C340 ${Math.round(height * 0.54)} 530 ${Math.round(height * 0.9)} 920 ${Math.round(height * 0.55)}" stroke="rgba(255,255,255,0.45)" stroke-width="3" fill="none"/>
        <rect x="72" y="72" width="194" height="58" rx="29" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)"/>
        <text x="108" y="110" fill="#ffffff" font-size="24" font-family="Manrope, Arial, sans-serif">${safeEyebrow}</text>
        <text x="80" y="${Math.round(height * 0.48)}" fill="#ffffff" font-size="92" font-weight="700" font-family="Space Grotesk, Arial, sans-serif">${safeTitle}</text>
        <text x="82" y="${Math.round(height * 0.48 + 88)}" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Manrope, Arial, sans-serif">Prompt Atlas visual concept</text>
        <rect x="78" y="${Math.round(height - 190)}" width="320" height="104" rx="28" fill="rgba(7,14,24,0.46)" stroke="rgba(255,255,255,0.14)"/>
        <text x="114" y="${Math.round(height - 128)}" fill="#ffffff" font-size="30" font-family="Space Grotesk, Arial, sans-serif">High-conversion output</text>
      </svg>
    `);
  }

  function fileListToDataUrls(fileList) {
    const files = Array.from(fileList ?? []);
    return Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
  }

  async function copyToClipboard(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return true;
  }

  function showToast(message) {
    const root = document.querySelector("#toast-root");
    if (!root) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    root.append(toast);

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function pulseButton(button, copiedLabel) {
    if (!button) {
      return;
    }

    const original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = copiedLabel || "Copiado";
    button.classList.add("is-active");

    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove("is-active");
    }, 1600);
  }

  function buildPrompt(data) {
    return {
      id: data.id,
      title: data.title,
      likes: data.likes,
      views: data.views,
      tags: data.tags,
      author: APP_AUTHOR,
      createdAt: new Date(Date.now() - data.views * 18000000).toISOString(),
      prompt: data.prompt,
      images: data.heights.map((height, index) =>
        createArtwork({
          title: data.title,
          eyebrow: `Visual ${index + 1}`,
          accent: data.palette[0],
          secondary: data.palette[1],
          glow: data.palette[2],
          height,
        }),
      ),
    };
  }

  const seedPrompts = [
    buildPrompt({
      id: "prompt-saas-neon",
      title: "SaaS Neon Launch",
      likes: 189,
      views: 1422,
      tags: ["landing", "saas", "ads"],
      palette: ["#4ecdc4", "#14314c", "#ff9467"],
      heights: [1320, 1120, 1380],
      prompt: "Create a startup landing page for an AI SaaS product with a dark premium look, expressive headline, glassmorphism cards, conversion-focused CTA, radial gradient background, product stats, customer logos, founder note, and a mobile-first responsive layout.",
    }),
    buildPrompt({
      id: "prompt-editorial-fashion",
      title: "Editorial Fashion Grid",
      likes: 246,
      views: 1680,
      tags: ["fashion", "editorial", "branding"],
      palette: ["#ff8f70", "#23153a", "#ffe6a8"],
      heights: [1480, 1080, 1260],
      prompt: "Generate an editorial fashion campaign scene with cinematic side lighting, luxury textures, dramatic composition, minimal props, rich skin tones, shallow depth of field, and a premium magazine cover feeling. Keep the styling modern and confident.",
    }),
    buildPrompt({
      id: "prompt-interior-biophilic",
      title: "Biophilic Interior Concept",
      likes: 132,
      views: 1188,
      tags: ["interior", "architecture", "concept"],
      palette: ["#7ae5c5", "#10211f", "#94d9ff"],
      heights: [1180, 1400, 1160],
      prompt: "Design a biophilic interior for a creative startup office featuring warm wood, polished concrete, layered plants, sculptural furniture, soft morning light, integrated product display zones, and a calm editorial atmosphere with realistic materials.",
    }),
    buildPrompt({
      id: "prompt-product-orbit",
      title: "Orbit Product Hero",
      likes: 174,
      views: 1294,
      tags: ["product", "3d", "hero"],
      palette: ["#89e3ff", "#0b1630", "#70ffa6"],
      heights: [1360, 1240, 1100],
      prompt: "Render a floating consumer tech product as a cinematic hero shot with soft reflections, precise rim light, layered gradients, suspended particles, futuristic packaging cues, and a clean composition optimized for a premium website header.",
    }),
    buildPrompt({
      id: "prompt-cafe-branding",
      title: "Cafe Branding Suite",
      likes: 98,
      views: 884,
      tags: ["branding", "food", "social"],
      palette: ["#ffc86b", "#321b0d", "#ff8f70"],
      heights: [1280, 1180, 1340],
      prompt: "Create a cohesive branding suite for a specialty coffee shop with tactile packaging, social-ready mockups, warm analog colors, artisan label details, moody editorial shadows, and a friendly yet elevated startup brand personality.",
    }),
    buildPrompt({
      id: "prompt-ui-dashboard",
      title: "Analytics Dashboard Motion",
      likes: 287,
      views: 2144,
      tags: ["ui", "dashboard", "motion"],
      palette: ["#7ae5c5", "#10273f", "#9fe7ff"],
      heights: [1220, 1500, 1140],
      prompt: "Design a dark analytics dashboard for a tech startup with bold typography, modular charts, layered cards, onboarding tips, tasteful motion cues, soft shadows, glowing accent lines, and hierarchy optimized for fast scanning and decision making.",
    }),
  ];

  const listeners = new Set();

  function createInitialState() {
    return {
      prompts: seedPrompts.slice().sort((left, right) => right.likes - left.likes),
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
        favorites: Array.isArray(rawState.user && rawState.user.favorites) ? rawState.user.favorites : [],
        liked: Array.isArray(rawState.user && rawState.user.liked) ? rawState.user.liked : [],
        adminUnlocked: Boolean(rawState.user && rawState.user.adminUnlocked),
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
    } catch (error) {
      return createInitialState();
    }
  }

  let state = loadState();

  function emit() {
    localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(state));
    listeners.forEach((listener) => listener(state));
  }

  function sortPrompts(prompts) {
    return prompts.slice().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  }

  function normalizePromptPayload(payload, previousPrompt) {
    const safePrevious = previousPrompt || {};
    const tags = Array.isArray(payload.tags)
      ? payload.tags
      : String(payload.tags || "")
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);

    return {
      id: safePrevious.id || payload.id || (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : `prompt-${Date.now()}`),
      title: String(payload.title || "").trim(),
      prompt: String(payload.prompt || "").trim(),
      author: String(payload.author || "").trim() || APP_AUTHOR,
      tags,
      images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : safePrevious.images || [],
      likes: safePrevious.likes || 0,
      views: safePrevious.views || 0,
      createdAt: safePrevious.createdAt || new Date().toISOString(),
    };
  }

  function getState() {
    return state;
  }

  function getPromptById(id) {
    return state.prompts.find((prompt) => prompt.id === id);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function toggleLike(promptId) {
    const liked = new Set(state.user.liked);
    const hasLike = liked.has(promptId);
    const nextLiked = hasLike ? Array.from(liked).filter((id) => id !== promptId) : Array.from(liked).concat(promptId);

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

  function toggleFavorite(promptId) {
    const favorites = new Set(state.user.favorites);
    const hasFavorite = favorites.has(promptId);
    const nextFavorites = hasFavorite ? Array.from(favorites).filter((id) => id !== promptId) : Array.from(favorites).concat(promptId);

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

  function incrementViews(promptId) {
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

  function createPrompt(payload) {
    const prompt = normalizePromptPayload(payload);
    state = {
      ...state,
      prompts: sortPrompts([prompt].concat(state.prompts)),
    };
    emit();
    return prompt;
  }

  function updatePrompt(promptId, payload) {
    const previousPrompt = getPromptById(promptId);
    if (!previousPrompt) {
      return null;
    }

    const updatedPrompt = normalizePromptPayload(payload, previousPrompt);
    state = {
      ...state,
      prompts: sortPrompts(
        state.prompts.map((prompt) => (prompt.id === promptId ? updatedPrompt : prompt)),
      ),
    };
    emit();
    return updatedPrompt;
  }

  function deletePrompt(promptId) {
    state = {
      ...state,
      prompts: state.prompts.filter((prompt) => prompt.id !== promptId),
      user: {
        ...state.user,
        favorites: state.user.favorites.filter((id) => id !== promptId),
        liked: state.user.liked.filter((id) => id !== promptId),
      },
    };
    emit();
  }

  function unlockAdmin(code) {
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

  function logoutAdmin() {
    state = {
      ...state,
      user: {
        ...state.user,
        adminUnlocked: false,
      },
    };
    emit();
  }

  function renderNavbar(currentState, route) {
    const favoritesCount = currentState.user.favorites.length;
    const totalPrompts = currentState.prompts.length;
    const totalLikes = currentState.prompts.reduce((total, prompt) => total + prompt.likes, 0);
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

  function renderPromptCard(prompt, user) {
    const liked = user.liked.includes(prompt.id);
    const favorited = user.favorites.includes(prompt.id);
    const canEdit = user.adminUnlocked;
    return `
      <article class="prompt-card" data-prompt-card data-title="${escapeHtml(prompt.title.toLowerCase())}" data-tags="${escapeHtml(prompt.tags.join(" "))}">
        <button class="card-image-button" data-action="open-detail" data-id="${prompt.id}">
          <div class="card-image-shell">
            <img src="${prompt.images[0]}" alt="${escapeHtml(prompt.title)}" loading="lazy" />
            <span class="card-overlay">Ver más</span>
          </div>
        </button>
        <div class="card-body">
          <div class="card-title-row">
            <button class="card-title-button" data-action="open-detail" data-id="${prompt.id}">
              <h2 class="card-title">${escapeHtml(prompt.title)}</h2>
            </button>
            <button class="icon-button ${favorited ? "is-active" : ""}" data-action="toggle-favorite" data-id="${prompt.id}" aria-label="Guardar prompt" title="Guardar prompt">
              ${favorited ? "★" : "☆"}
            </button>
          </div>
          <p class="helper-text">${escapeHtml(truncate(prompt.prompt, 124))}</p>
          <div class="inline-list card-tags">
            ${prompt.tags.slice(0, 3).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="card-actions">
            <div class="inline-list">
              ${canEdit ? `<button class="mini-button" data-action="edit-prompt" data-id="${prompt.id}">Editar</button>` : ""}
              <button class="ghost-button" data-action="open-detail" data-id="${prompt.id}">Ver prompt</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderCarousel(images, title) {
    return `
      <div class="carousel" data-carousel>
        <div class="carousel-stage">
          ${images
            .map(
              (image, index) => `
                <figure class="carousel-slide ${index === 0 ? "is-active" : ""}" data-slide="${index}">
                  <img src="${image}" alt="${escapeHtml(title)} vista ${index + 1}" />
                </figure>
              `,
            )
            .join("")}
          <button class="carousel-nav prev" type="button" data-carousel-nav="-1" aria-label="Imagen anterior">←</button>
          <button class="carousel-nav next" type="button" data-carousel-nav="1" aria-label="Imagen siguiente">→</button>
          <span class="carousel-counter" data-carousel-counter>1 / ${images.length}</span>
        </div>
        <div class="gallery-strip glass-panel">
          <div class="thumb-list">
            ${images
              .map(
                (image, index) => `
                  <button class="thumb-button ${index === 0 ? "is-active" : ""}" type="button" data-carousel-thumb="${index}" aria-label="Ir a imagen ${index + 1}">
                    <img src="${image}" alt="${escapeHtml(title)} miniatura ${index + 1}" />
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function bindCarousel(root) {
    if (!root) {
      return function noop() {};
    }

    const slides = Array.from(root.querySelectorAll("[data-slide]"));
    const thumbs = Array.from(root.querySelectorAll("[data-carousel-thumb]"));
    const counter = root.querySelector("[data-carousel-counter]");
    let currentIndex = 0;
    let touchStart = 0;

    function update(nextIndex) {
      currentIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => slide.classList.toggle("is-active", index === currentIndex));
      thumbs.forEach((thumb, index) => thumb.classList.toggle("is-active", index === currentIndex));
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${slides.length}`;
      }
    }

    function clickHandler(event) {
      const navButton = event.target.closest("[data-carousel-nav]");
      if (navButton) {
        update(currentIndex + Number(navButton.dataset.carouselNav));
        return;
      }

      const thumbButton = event.target.closest("[data-carousel-thumb]");
      if (thumbButton) {
        update(Number(thumbButton.dataset.carouselThumb));
      }
    }

    function touchStartHandler(event) {
      touchStart = event.changedTouches[0].clientX;
    }

    function touchEndHandler(event) {
      const delta = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(delta) < 24) {
        return;
      }

      update(currentIndex + (delta > 0 ? -1 : 1));
    }

    root.addEventListener("click", clickHandler);
    root.addEventListener("touchstart", touchStartHandler, { passive: true });
    root.addEventListener("touchend", touchEndHandler, { passive: true });

    return function unbind() {
      root.removeEventListener("click", clickHandler);
      root.removeEventListener("touchstart", touchStartHandler);
      root.removeEventListener("touchend", touchEndHandler);
    };
  }

  function renderHomeView(currentState) {
    const prompts = currentState.prompts;
    if (!prompts.length) {
      return {
        html: `
          <section class="empty-panel glass-panel">
            <span class="eyebrow">Catálogo vacío</span>
            <h2 class="section-title">Tu biblioteca está lista para empezar.</h2>
            <p>Todavía no hay prompts cargados. Entra al dashboard privado para publicar el primero con sus imágenes, tags y texto listo para copiar.</p>
            <div class="hero-actions">
              <a class="primary-button" href="#/admin">Abrir dashboard</a>
            </div>
          </section>
        `,
        bind: function bindEmpty() {
          return function noop() {};
        },
      };
    }

    return {
      html: `
        <section class="toolbar glass-panel">
          <div class="search-shell">
            <input id="prompt-search" class="search-input" type="search" placeholder="Buscar por título, idea o estilo visual" />
          </div>
        </section>
        <section class="prompt-grid" id="prompt-grid">
          ${prompts.map((prompt) => renderPromptCard(prompt, currentState.user)).join("")}
        </section>
        <section class="empty-panel glass-panel hidden" id="empty-state">
          <h2 class="section-title">No encontramos prompts con ese filtro</h2>
          <p>Prueba con otra palabra, borra la búsqueda o cambia la categoría activa.</p>
        </section>
      `,
      bind: function bindHome() {
        const searchInput = document.querySelector("#prompt-search");
        const cards = Array.from(document.querySelectorAll("[data-prompt-card]"));
        const emptyState = document.querySelector("#empty-state");

        function applyFilters() {
          const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
          let visible = 0;
          cards.forEach((card) => {
            const title = card.dataset.title || "";
            const tags = card.dataset.tags || "";
            const shouldShow = !query || title.includes(query) || tags.includes(query);
            card.classList.toggle("hidden", !shouldShow);
            if (shouldShow) {
              visible += 1;
            }
          });
          if (emptyState) {
            emptyState.classList.toggle("hidden", visible > 0);
          }
        }

        if (searchInput) {
          searchInput.addEventListener("input", applyFilters);
        }

        return function unbindHome() {
          if (searchInput) {
            searchInput.removeEventListener("input", applyFilters);
          }
        };
      },
    };
  }

  function renderDetailView(currentState, promptId) {
    const prompt = currentState.prompts.find((item) => item.id === promptId);
    if (!prompt) {
      return {
        html: `
          <section class="empty-panel glass-panel">
            <h2 class="section-title">Este prompt no existe</h2>
            <p>Puede haber sido eliminado o el enlace no es válido.</p>
            <a class="primary-button" href="#/">Volver a la biblioteca</a>
          </section>
        `,
        bind: function bindMissing() {
          return function noop() {};
        },
      };
    }

    const liked = currentState.user.liked.includes(prompt.id);
    const favorited = currentState.user.favorites.includes(prompt.id);
    const canEdit = currentState.user.adminUnlocked;
    const relatedPrompts = currentState.prompts.filter((item) => item.id !== prompt.id).slice(0, 3);

    return {
      html: `
        <section class="detail-layout">
          <div class="detail-panel glass-panel">
            <div class="detail-header">
              <span class="eyebrow">Prompt visual</span>
              <h1>${escapeHtml(prompt.title)}</h1>
              <p class="detail-copy">Resultado primero, texto listo para copiar y un flujo de exploración pensado para que la acción principal ocurra en segundos.</p>
            </div>
            <div class="detail-actions">
              <button class="secondary-button ${liked ? "is-active" : ""}" data-action="toggle-like" data-id="${prompt.id}">
                ${liked ? "Liked" : "Like"} ${formatCompactNumber(prompt.likes)}
              </button>
            <button class="secondary-button ${favorited ? "is-active" : ""}" data-action="toggle-favorite" data-id="${prompt.id}">
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
            <p class="support-copy">La vista individual está preparada para crecer con autenticación, comentarios o analytics reales sin rehacer la experiencia principal.</p>
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
      bind: function bindDetail(context) {
        context.ensurePromptView(prompt.id);
        return bindCarousel(document.querySelector("[data-carousel]"));
      },
    };
  }

  function createEmptyDraft() {
    return {
      id: null,
      title: "",
      author: APP_AUTHOR,
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
      images: prompt.images.slice(),
    };
  }

  function renderAdminView(currentState, route) {
    if (!currentState.user.adminUnlocked) {
      return {
        html: `
          <section class="login-shell">
            <div class="login-panel glass-panel">
              <span class="eyebrow">Private admin</span>
              <h2>Dashboard privado para cargar y editar prompts</h2>
              <p class="support-copy">Esta protección es local y sirve como placeholder hasta que agregues autenticación real. Código de demo: <strong>${escapeHtml(ADMIN_ACCESS_CODE)}</strong>.</p>
              <form id="admin-login-form" class="form-grid">
                <input id="admin-access-code" class="login-input" type="password" placeholder="Ingresa el código de acceso" autocomplete="off" />
                <div class="login-actions">
                  <button class="primary-button" type="submit">Entrar al dashboard</button>
                  <a class="ghost-button" href="#/">Volver al home</a>
                </div>
              </form>
            </div>
          </section>
        `,
        bind: function bindLogin(context) {
          const form = document.querySelector("#admin-login-form");
          const input = document.querySelector("#admin-access-code");
          function submitHandler(event) {
            event.preventDefault();
            const success = context.actions.unlockAdmin(input.value.trim());
            if (!success) {
              context.showToast("Código incorrecto");
              return;
            }
            context.showToast("Dashboard desbloqueado");
          }
          if (form) {
            form.addEventListener("submit", submitHandler);
          }
          return function unbindLogin() {
            if (form) {
              form.removeEventListener("submit", submitHandler);
            }
          };
        },
      };
    }

    if (route && route.editId && adminDraft.id !== route.editId) {
      const routePrompt = currentState.prompts.find((prompt) => prompt.id === route.editId);
      if (routePrompt) {
        hydrateDraft(routePrompt);
      }
    }

    if (adminDraft.id && !currentState.prompts.find((prompt) => prompt.id === adminDraft.id)) {
      hydrateDraft(null);
    }

    const totalViews = currentState.prompts.reduce((total, prompt) => total + prompt.views, 0);
    const totalLikes = currentState.prompts.reduce((total, prompt) => total + prompt.likes, 0);

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
            <p class="support-copy">Carga imágenes, texto del prompt y tags desde una sola interfaz. La persistencia queda en <code>localStorage</code>, con una capa fácil de migrar a backend real.</p>
            ${adminFlashMessage ? `<div class="status-banner">${escapeHtml(adminFlashMessage)}</div>` : ""}
            <form id="admin-form" class="form-grid">
              <div class="form-grid two-cols">
                <label class="admin-label">Título
                  <input class="admin-input" name="title" value="${escapeHtml(adminDraft.title)}" required />
                </label>
                <label class="admin-label">Autor
                  <input class="admin-input" name="author" value="${escapeHtml(adminDraft.author)}" />
                </label>
              </div>
              <label class="admin-label">Tags
                <input class="admin-input" name="tags" value="${escapeHtml(adminDraft.tags)}" placeholder="ui, saas, editorial" />
              </label>
              <label class="admin-label">Prompt
                <textarea class="admin-textarea" name="prompt" required>${escapeHtml(adminDraft.prompt)}</textarea>
              </label>
              <div class="upload-zone">
                <label class="admin-label">Subida de múltiples imágenes
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
                        <button class="upload-remove" type="button" data-remove-image="${index}" aria-label="Eliminar imagen">×</button>
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
              <div class="stat-card"><strong>${currentState.prompts.length}</strong><span>Prompts publicados</span></div>
              <div class="stat-card"><strong>${formatCompactNumber(totalLikes)}</strong><span>Likes acumulados</span></div>
              <div class="stat-card"><strong>${formatCompactNumber(totalViews)}</strong><span>Vistas totales</span></div>
            </div>
            <div class="toolbar-row">
              <div>
                <h2 class="section-title">Contenido actual</h2>
                <p class="support-copy">Edita, elimina o abre cada prompt en su detalle público.</p>
              </div>
            </div>
            <div class="prompt-list" id="admin-prompt-list">
              ${
                currentState.prompts.length
                  ? currentState.prompts
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
      bind: function bindAdmin(context) {
        const form = document.querySelector("#admin-form");
        const uploadInput = document.querySelector("#image-upload-input");
        const logoutButton = document.querySelector("#admin-logout-button");
        const resetButton = document.querySelector("#admin-reset-button");
        const promptList = document.querySelector("#admin-prompt-list");
        const previewGrid = document.querySelector(".upload-preview-grid");

        function inputHandler(event) {
          const target = event.target;
          if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
            return;
          }
          if (!target.name) {
            return;
          }
          adminDraft = { ...adminDraft, [target.name]: target.value };
        }

        async function uploadHandler() {
          if (!(uploadInput instanceof HTMLInputElement) || !uploadInput.files || !uploadInput.files.length) {
            return;
          }

          const newImages = await fileListToDataUrls(uploadInput.files);
          adminDraft = {
            ...adminDraft,
            images: adminDraft.images.concat(newImages),
          };
          uploadInput.value = "";
          context.requestRender();
          context.showToast(`${newImages.length} imagen${newImages.length > 1 ? "es" : ""} cargada${newImages.length > 1 ? "s" : ""}`);
        }

        function previewHandler(event) {
          const removeButton = event.target.closest("[data-remove-image]");
          if (!removeButton) {
            return;
          }

          const imageIndex = Number(removeButton.dataset.removeImage);
          adminDraft = {
            ...adminDraft,
            images: adminDraft.images.filter((_, index) => index !== imageIndex),
          };
          context.requestRender();
        }

        function submitHandler(event) {
          event.preventDefault();

          if (!(form instanceof HTMLFormElement)) {
            return;
          }

          const formData = new FormData(form);
          const payload = {
            title: String(formData.get("title") || "").trim(),
            author: String(formData.get("author") || "").trim(),
            tags: String(formData.get("tags") || "").trim(),
            prompt: String(formData.get("prompt") || "").trim(),
            images: adminDraft.images.slice(),
          };

          if (!payload.title || !payload.prompt) {
            context.showToast("Completa título y prompt");
            return;
          }

          if (!payload.images.length) {
            context.showToast("Sube al menos una imagen");
            return;
          }

          if (adminDraft.id) {
            adminFlashMessage = `Prompt "${payload.title}" actualizado correctamente.`;
            hydrateDraft(null);
            context.actions.updatePrompt(adminDraft.id, payload);
            context.showToast("Prompt actualizado");
            if (window.location.hash !== "#/admin") {
              window.location.hash = "#/admin";
            }
            return;
          }

          adminFlashMessage = `Prompt "${payload.title}" publicado correctamente.`;
          hydrateDraft(null);
          context.actions.createPrompt(payload);
          context.showToast("Prompt publicado");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        function listHandler(event) {
          const editButton = event.target.closest("[data-edit-prompt]");
          if (editButton) {
            const prompt = context.actions.getPromptById(editButton.dataset.editPrompt);
            hydrateDraft(prompt);
            context.requestRender();
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }

          const deleteButton = event.target.closest("[data-delete-prompt]");
          if (deleteButton) {
            const prompt = context.actions.getPromptById(deleteButton.dataset.deletePrompt);
            if (!prompt) {
              return;
            }

            const confirmed = window.confirm(`Eliminar "${prompt.title}"?`);
            if (!confirmed) {
              return;
            }

            adminFlashMessage = `Prompt "${prompt.title}" eliminado.`;
            context.actions.deletePrompt(prompt.id);
            if (adminDraft.id === prompt.id) {
              hydrateDraft(null);
            }
            context.showToast("Prompt eliminado");
          }
        }

        function logoutHandler() {
          context.actions.logoutAdmin();
          adminFlashMessage = "";
          context.showToast("Sesión cerrada");
        }

        function resetHandler() {
          hydrateDraft(null);
          adminFlashMessage = "";
          context.requestRender();
        }

        if (form) {
          form.addEventListener("input", inputHandler);
          form.addEventListener("submit", submitHandler);
        }
        if (uploadInput) {
          uploadInput.addEventListener("change", uploadHandler);
        }
        if (previewGrid) {
          previewGrid.addEventListener("click", previewHandler);
        }
        if (promptList) {
          promptList.addEventListener("click", listHandler);
        }
        if (logoutButton) {
          logoutButton.addEventListener("click", logoutHandler);
        }
        if (resetButton) {
          resetButton.addEventListener("click", resetHandler);
        }

        return function unbindAdmin() {
          if (form) {
            form.removeEventListener("input", inputHandler);
            form.removeEventListener("submit", submitHandler);
          }
          if (uploadInput) {
            uploadInput.removeEventListener("change", uploadHandler);
          }
          if (previewGrid) {
            previewGrid.removeEventListener("click", previewHandler);
          }
          if (promptList) {
            promptList.removeEventListener("click", listHandler);
          }
          if (logoutButton) {
            logoutButton.removeEventListener("click", logoutHandler);
          }
          if (resetButton) {
            resetButton.removeEventListener("click", resetHandler);
          }
        };
      },
    };
  }

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

      sessionStorage.setItem(STORAGE_KEYS.sessionViews, JSON.stringify(trackedIds.concat(promptId)));
    } catch (error) {
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
      } catch (error) {
        // Keep clipboard fallback.
      }
    }

    await copyToClipboard(shareData.url);
    showToast("Enlace copiado");
  }

  function bindGlobalActions() {
    function clickHandler(event) {
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget) {
        return;
      }

      const promptId = actionTarget.dataset.id;
      const prompt = promptId ? getPromptById(promptId) : null;

      if (actionTarget.dataset.action === "open-detail" && promptId) {
        window.location.hash = `#/prompt/${promptId}`;
        return;
      }

      if (actionTarget.dataset.action === "edit-prompt" && promptId) {
        window.location.hash = `#/admin/edit/${promptId}`;
        return;
      }

      if (actionTarget.dataset.action === "toggle-like" && promptId) {
        toggleLike(promptId);
        showToast("Like actualizado");
        return;
      }

      if (actionTarget.dataset.action === "toggle-favorite" && promptId) {
        toggleFavorite(promptId);
        showToast("Favoritos actualizados");
        return;
      }

      if (actionTarget.dataset.action === "share-prompt" && promptId) {
        sharePrompt(promptId);
        return;
      }

      if (actionTarget.dataset.action === "copy-prompt" && prompt) {
        copyToClipboard(prompt.prompt).then(() => {
          pulseButton(actionTarget, "Copiado");
          showToast("Prompt copiado");
        });
      }
    }

    if (app) {
      app.addEventListener("click", clickHandler);
    }

    return function unbindGlobal() {
      if (app) {
        app.removeEventListener("click", clickHandler);
      }
    };
  }

  function render() {
    if (cleanup) {
      cleanup();
    }

    const currentState = getState();
    const route = parseRoute();
    const view =
      route.name === "detail"
        ? renderDetailView(currentState, route.id)
        : route.name === "admin"
          ? renderAdminView(currentState, route)
          : renderHomeView(currentState);

    if (!app) {
      return;
    }

    app.innerHTML = `
      <div class="app-shell workspace-shell">
        ${renderNavbar(currentState, route)}
        <main class="page-shell">${view.html}</main>
      </div>
    `;

    const unbindGlobal = bindGlobalActions();
    const unbindView =
      typeof view.bind === "function"
        ? view.bind({
            state: currentState,
            route,
            actions,
            showToast,
            requestRender: render,
            ensurePromptView,
          })
        : function noop() {};

    cleanup = function nextCleanup() {
      unbindGlobal();
      unbindView();
    };
  }

  subscribe(function onStateChange() {
    render();
  });
  window.addEventListener("hashchange", render);
  render();
})();
