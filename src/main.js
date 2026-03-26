import { initAssets, applyAssets, setAssetMaps } from "./modules/utils.js";
import { imageMap, linkMap, iconMap } from "./assets.js";
import { lazyLoadRoute } from "./modules/optimize.js";
import { configureSheet } from "./modules/sheet.js";
import "./modules/route.js";
import "./modules/layouts.js";
import "./modules/models.js";
import "./modules/theme.js";

// ---------- Configurações ----------
export const config = {
  dirs: {
    layouts: "/components/layouts",
    models: "/components/models",
  },
  pageInit: "/home",
};

export const routes = [
  { path: /^\/home$/, page: "/pages/home" },
  { path: /^\/about$/, page: "/pages/about" },
  { path: /^\/work$/, page: "/pages/work" },
  { path: /^\/hooby$/, page: "/pages/hooby" },
  { path: /^\/gallery$/, page: "/pages/gallery" },
];

// ---------- Configurações de animação ----------
export const animated = {
  scroll: {
    enabled: true,
    mode: "smooth",
    custom: { ease: 0.4, stepMin: 1, stepMax: 60 },
  },
  fade: {
    enabled: true,
    duration: 250,
    useTranslate: true,
    translateValue: "5px",
  },
};

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
  setAssetMaps({
    imageMap,
    linkMap,
    iconMap,
  });
  configureSheet(animated);
  initAssets();

  document.addEventListener("spa:pageLoaded", (e) => {
    const container = e.detail?.container || e.target || document;
    try {
      applyAssets(container);
    } catch (err) {
      console.warn("applyAssets falhou:", err);
    }
    lazyLoadRoute();
  });

  // sinaliza que o framework já está pronto (assets e handlers registrados)
  window.__frameworkReady = true;
  document.dispatchEvent(new Event("framework:ready"));

  console.log("Main.js initialized ✅");
});
