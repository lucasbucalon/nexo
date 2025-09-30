// utils.js
import { imageMap, linkMap, iconMap } from "../main.js";

//------------------
// IMAGENS DINÂMICAS
//------------------
function applyImages(root = document) {
  const images = root.querySelectorAll("[data-image]");
  images.forEach((img) => {
    const name = img.dataset.image;
    const cfg = imageMap[name];
    if (!cfg)
      return console.warn(`⚠️ data-image="${name}" não encontrado no imageMap`);

    const isDark =
      cfg.dark && window.matchMedia("(prefers-color-scheme: dark)").matches;
    let src = cfg.src;

    if (cfg.set) {
      const w = window.innerWidth;
      if (
        (!cfg.set.minWidth || w >= cfg.set.minWidth) &&
        (!cfg.set.maxWidth || w <= cfg.set.maxWidth)
      ) {
        src = isDark && cfg.set.dark ? cfg.set.dark : cfg.set.src;
      } else if (isDark && cfg.dark) {
        src = cfg.dark;
      }
    } else if (isDark && cfg.dark) {
      src = cfg.dark;
    }

    img.src = src;
    img.alt = cfg.alt || name;
    img.title = cfg.title || name;
    img.decoding = "async";
    img.loading = "lazy";
    img.fetchPriority = cfg.fetchpriority || "low";
  });
}

//------------------
// LINKS DINÂMICOS
//------------------
function applyLinks(root = document) {
  const links = root.querySelectorAll("[data-link]");
  links.forEach((link) => {
    const name = link.dataset.link;
    const cfg = linkMap[name];
    if (!cfg)
      return console.warn(`⚠️ data-link="${name}" não encontrado no linkMap`);

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

//------------------
// CUSTOM ELEMENT <my-icon>
//------------------
class IconElement extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const name = this.dataset.icon;
    const cfg = iconMap[name];
    if (!cfg || this.querySelector("img")) return;

    const img = document.createElement("img");
    img.src = cfg.src || cfg;
    img.alt = this.getAttribute("alt") || name;
    img.title = this.getAttribute("title") || name;
    img.decoding = "async";
    img.loading = "lazy";
    img.setAttribute("role", "img");

    if (this.hasAttribute("width")) img.width = this.getAttribute("width");
    if (this.hasAttribute("height")) img.height = this.getAttribute("height");

    this.appendChild(img);
  }
}

if (!customElements.get("my-icon"))
  customElements.define("my-icon", IconElement);

//------------------
// REAPLICAR ICONS DINAMICAMENTE
//------------------
function applyIcons(root = document) {
  root.querySelectorAll("my-icon[data-icon]").forEach((icon) => {
    if (typeof icon.render === "function") icon.render();
  });
}

//------------------
// UNIVERSAL APPLY
//------------------
export function applyAssets(root = document) {
  applyImages(root);
  applyLinks(root);
  applyIcons(root);
}

//------------------
// OBSERVADOR AUTOMÁTICO
//------------------
export function observeAssets(container = document.getElementById("route")) {
  if (!container) return;
  const observer = new MutationObserver(() => applyAssets(container));
  observer.observe(container, { childList: true, subtree: true });
}

//------------------
// INICIALIZAÇÃO GLOBAL
//------------------
export function initAssets() {
  applyAssets();
  observeAssets();
}
