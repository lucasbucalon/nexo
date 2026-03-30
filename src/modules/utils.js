// utils.js
// --------------------------------------------------
// IMPORTS
// --------------------------------------------------

let imageMap = {};
let linkMap = {};
let iconMap = {};

export function setAssetMaps(maps) {
  imageMap = maps.imageMap || {};
  linkMap = maps.linkMap || {};
  iconMap = maps.iconMap || {};

  // Força re-render dos ícones já existentes
  document.querySelectorAll("my-icon[data-icon]").forEach((icon) => {
    if (typeof icon.render === "function") {
      icon.render();
    }
  });
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getCurrentTheme = () => document.documentElement.dataset.theme || "light";

const getViewportWidth = () => window.innerWidth;

// Debounce para evitar spam em resize
function debounce(fn, delay = 150) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// --------------------------------------------------
// IMAGENS DINÂMICAS
// --------------------------------------------------

function resolveImageSource(cfg) {
  if (!cfg || !cfg.src) return "";

  const theme = getCurrentTheme();
  const width = getViewportWidth();
  const isDark = theme === "dark";

  if (cfg.set) {
    const matchesMin = !cfg.set.minWidth || width >= cfg.set.minWidth;
    const matchesMax = !cfg.set.maxWidth || width <= cfg.set.maxWidth;

    if (matchesMin && matchesMax) {
      return isDark && cfg.set.dark ? cfg.set.dark : cfg.set.src;
    }
  }

  return isDark && cfg.dark ? cfg.dark : cfg.src;
}

function applyImages(root = document) {
  if (!imageMap) return;

  const images = root.querySelectorAll("[data-image]");

  images.forEach((img) => {
    const name = img.dataset.image;
    const cfg = imageMap?.[name];

    if (!cfg) {
      console.warn(`[Assets] data-image="${name}" não encontrado.`);
      return;
    }

    const newSrc = resolveImageSource(cfg);

    if (!newSrc) return;

    if (img.getAttribute("src") !== newSrc) {
      img.setAttribute("src", newSrc);
    }

    img.alt = cfg.alt ?? name;
    img.title = cfg.title ?? name;
    img.decoding = "async";
    // loading: use eager for prioritized images (fetchpriority or explicit priority)
    const isPriorityImage =
      Boolean(cfg.fetchpriority) ||
      (typeof cfg.priority === "string" &&
        ["high", "eager", "critical"].includes(cfg.priority.toLowerCase()));

    img.loading = isPriorityImage ? "eager" : cfg.loading || "lazy";

    if (cfg.fetchpriority) {
      try {
        img.fetchPriority = cfg.fetchpriority;
      } catch (e) {
        // alguns navegadores podem não suportar fetchPriority
      }
    }
  });
}

// --------------------------------------------------
// LINKS DINÂMICOS
// --------------------------------------------------

function applyLinks(root = document) {
  if (!linkMap) return;

  const links = root.querySelectorAll("[data-link]");

  links.forEach((link) => {
    const name = link.dataset.link;
    const cfg = linkMap?.[name];

    if (!cfg || !cfg.href) {
      console.warn(`[Assets] data-link="${name}" inválido.`);
      return;
    }

    // valida href para evitar javascript: e outros protocolos perigosos
    const href = String(cfg.href || "").trim();
    if (!href || href.toLowerCase().startsWith("javascript:")) {
      console.warn(`[Assets] data-link="${name}" possui href inválido.`);
      return;
    }

    link.href = href;
    link.title = cfg.title ?? name;

    if (cfg.target) link.target = cfg.target;
    if (cfg.rel) link.rel = cfg.rel;
    else if (cfg.target === "_blank") link.rel = "noopener noreferrer";
    // garantia extra: sempre remove referencias window-opener se target=_blank
    if (link.target === "_blank") {
      const existing = link.getAttribute("rel") || "";
      const parts = new Set(existing.split(/\s+/).filter(Boolean));
      parts.add("noopener");
      parts.add("noreferrer");
      link.setAttribute("rel", Array.from(parts).join(" "));
    }

    if (cfg.type) link.type = cfg.type;
    if (cfg["aria-label"]) link.setAttribute("aria-label", cfg["aria-label"]);

    if (cfg.download)
      link.setAttribute("download", cfg.download === true ? "" : cfg.download);
  });
}

// --------------------------------------------------
// CUSTOM ELEMENT <my-icon>
// --------------------------------------------------

class IconElement extends HTMLElement {
  connectedCallback() {
    // Só renderiza se os mapas já foram injetados
    if (!iconMap || Object.keys(iconMap).length === 0) return;
    this.render();
  }

  render() {
    const name = this.dataset.icon;
    if (!name) return;

    const cfg = iconMap?.[name];

    if (!cfg) {
      console.warn(`[Assets] Ícone "${name}" não encontrado.`);
      return;
    }

    const src = typeof cfg === "string" ? cfg : cfg.src;
    if (!src) return;

    this.style.setProperty("--icon-url", `url("${src}")`);

    const width = this.getAttribute("width");
    const height = this.getAttribute("height");

    if (width) this.style.width = `${width}px`;
    if (height) this.style.height = `${height}px`;
  }
}

// Evita erro de redefinição
if (!customElements.get("my-icon")) {
  customElements.define("my-icon", IconElement);
}

function applyIcons(root = document) {
  root.querySelectorAll("my-icon[data-icon]").forEach((icon) => {
    if (typeof icon.render === "function") {
      icon.render();
    }
  });
}

// --------------------------------------------------
// APPLY UNIFICADO
// --------------------------------------------------

export function applyAssets(root = document) {
  if (!root) return;

  applyImages(root);
  applyLinks(root);
  applyIcons(root);
}

// --------------------------------------------------
// OBSERVADOR SPA
// --------------------------------------------------

export function observeAssets(containerId = "route") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const observer = new MutationObserver(() => {
    applyAssets(container);
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });
}

// --------------------------------------------------
// REATIVIDADE GLOBAL
// --------------------------------------------------

function setupReactiveUpdates() {
  // Resize com debounce
  window.addEventListener(
    "resize",
    debounce(() => {
      applyImages();
    }, 200),
  );

  // Mudança de tema
  const themeObserver = new MutationObserver(() => {
    applyImages();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// --------------------------------------------------
// INICIALIZAÇÃO
// --------------------------------------------------

let initialized = false;

export function initAssets() {
  if (initialized) return;
  initialized = true;

  applyAssets();
  observeAssets();
  setupReactiveUpdates();
}

// --------------------------------------------------
// TOOLTIPS (ESTÁVEL)
// --------------------------------------------------

let tooltip = null;
let currentEl = null;

document.addEventListener("mouseover", (e) => {
  const el = e.target.closest("[data-tooltip]");
  if (!el || el === currentEl) return;

  currentEl = el;

  if (tooltip) tooltip.remove();

  tooltip = document.createElement("div");
  tooltip.className = "tooltip-global";
  tooltip.textContent = el.dataset.tooltip;

  // pega offset correto (com fallback)
  let offset = getComputedStyle(el).getPropertyValue("--tooltip-offset").trim();

  if (!offset) offset = "10px";

  tooltip.style.setProperty("--tooltip-offset", offset);

  document.body.appendChild(tooltip);

  const rect = el.getBoundingClientRect();

  tooltip.style.top = rect.top + "px";
  tooltip.style.left = rect.left + rect.width / 2 + "px";

  requestAnimationFrame(() => {
    if (!tooltip) return;
    try {
      tooltip.classList.add("show");
    } catch (err) {
      console.warn("[Tooltip] Falha ao aplicar classe 'show':", err);
    }
  });
});

document.addEventListener("mouseout", (e) => {
  const el = e.target.closest("[data-tooltip]");
  if (!el || el !== currentEl) return;

  if (tooltip) {
    tooltip.remove();
    tooltip = null;
    currentEl = null;
  }
});

// resolve bug do scroll
window.addEventListener("scroll", () => {
  // remove tooltip atual
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
    currentEl = null;
  }

  // 🔥 força reativação se o mouse estiver parado em cima de algo
  const el = document.elementFromPoint(
    window.innerWidth / 2,
    window.innerHeight / 2,
  );

  const target = el?.closest?.("[data-tooltip]");
  if (!target) return;

  // simula entrada novamente
  target.dispatchEvent(new Event("mouseover", { bubbles: true }));
});
