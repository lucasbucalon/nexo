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
    img.loading = "lazy";

    if (cfg.fetchpriority) {
      img.fetchPriority = cfg.fetchpriority;
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

    link.href = cfg.href;
    link.title = cfg.title ?? name;

    if (cfg.target) link.target = cfg.target;
    if (cfg.rel) link.rel = cfg.rel;
    else if (cfg.target === "_blank") link.rel = "noopener noreferrer";

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
