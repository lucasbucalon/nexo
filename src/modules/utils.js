// utils.js
import { imageMap, linkMap, iconMap } from "../main.js";

// ------------------
// HELPERS
// ------------------
function getCurrentTheme() {
  return document.documentElement.dataset.theme || "light";
}

function getViewportWidth() {
  return window.innerWidth;
}

// ------------------
// IMAGENS DINÂMICAS
// ------------------
function resolveImageSource(cfg) {
  const theme = getCurrentTheme();
  const width = getViewportWidth();
  const isDark = theme === "dark";

  let src = cfg.src;

  if (cfg.set) {
    const matchesMin = !cfg.set.minWidth || width >= cfg.set.minWidth;
    const matchesMax = !cfg.set.maxWidth || width <= cfg.set.maxWidth;

    if (matchesMin && matchesMax) {
      src = isDark && cfg.set.dark ? cfg.set.dark : cfg.set.src;
    } else {
      src = isDark && cfg.dark ? cfg.dark : cfg.src;
    }
  } else {
    src = isDark && cfg.dark ? cfg.dark : cfg.src;
  }

  return src;
}

function applyImages(root = document) {
  const images = root.querySelectorAll("[data-image]");

  images.forEach((img) => {
    const name = img.dataset.image;
    const cfg = imageMap[name];

    if (!cfg) {
      console.warn(`⚠️ data-image="${name}" não encontrado no imageMap`);
      return;
    }

    const newSrc = resolveImageSource(cfg);

    // evita loop desnecessário
    if (img.getAttribute("src") !== newSrc) {
      img.setAttribute("src", newSrc);
    }

    img.alt = cfg.alt || name;
    img.title = cfg.title || name;
    img.decoding = "async";
    img.loading = "lazy";
    img.fetchPriority = cfg.fetchpriority || "low";
  });
}

// ------------------
// LINKS DINÂMICOS
// ------------------
function applyLinks(root = document) {
  const links = root.querySelectorAll("[data-link]");

  links.forEach((link) => {
    const name = link.dataset.link;
    const cfg = linkMap[name];

    if (!cfg) {
      console.warn(`⚠️ data-link="${name}" não encontrado no linkMap`);
      return;
    }

    link.href = cfg.href;
    link.title = cfg.title || name;
    link.rel = "noopener noreferrer";

    if (cfg.type) link.type = cfg.type;
    if (cfg["aria-label"]) link.setAttribute("aria-label", cfg["aria-label"]);
    if (cfg.download)
      link.setAttribute("download", cfg.download === true ? "" : cfg.download);
    if (cfg.target) link.target = cfg.target;
  });
}

// ------------------
// CUSTOM ELEMENT <my-icon>
// ------------------

class IconElement extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const name = this.dataset.icon;
    const cfg = iconMap[name];

    if (!cfg) {
      console.warn(`⚠️ Ícone "${name}" não encontrado no iconMap`);
      return;
    }

    const src = cfg.src || cfg;

    // Define variável CSS com URL do SVG
    this.style.setProperty("--icon-url", `url("${src}")`);

    // Define dimensões se existirem
    if (this.hasAttribute("width")) {
      this.style.width = this.getAttribute("width") + "px";
    }

    if (this.hasAttribute("height")) {
      this.style.height = this.getAttribute("height") + "px";
    }
  }
}

if (!customElements.get("my-icon")) {
  customElements.define("my-icon", IconElement);
}

function applyIcons(root = document) {
  root.querySelectorAll("my-icon[data-icon]").forEach((icon) => {
    if (typeof icon.render === "function") icon.render();
  });
}

// ------------------
// UNIVERSAL APPLY
// ------------------
export function applyAssets(root = document) {
  applyImages(root);
  applyLinks(root);
  applyIcons(root);
}

// ------------------
// OBSERVADOR DE DOM (SPA)
// ------------------
export function observeAssets(container = document.getElementById("route")) {
  if (!container) return;

  const observer = new MutationObserver(() => {
    applyAssets(container);
  });

  observer.observe(container, { childList: true, subtree: true });
}

// ------------------
// REATIVIDADE GLOBAL
// ------------------
function setupReactiveUpdates() {
  // Reage ao resize
  window.addEventListener("resize", () => {
    applyImages();
  });

  // Observa mudança de tema
  const themeObserver = new MutationObserver(() => {
    applyImages();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// ------------------
// INICIALIZAÇÃO
// ------------------
export function initAssets() {
  applyAssets();
  observeAssets();
  setupReactiveUpdates();
}
