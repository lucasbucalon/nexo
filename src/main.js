import { lazyLoadRoute } from "./modules/optimize.js";
import { configureSheet } from "./modules/sheet.js";
import { initAssets, applyAssets } from "./modules/utils.js";
import "./modules/route.js";
import "./modules/layouts.js";
import "./modules/models.js";

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
];

// ---------- Mapas de recursos ----------
export const imageMap = {
  foto: {
    src: "/constant/images/foto_perfil.png",
    alt: "imagem do perfil",
    title: "Lucas Bucalon",
    fetchpriority: "low",
    dark: "/constant/images/foto_perfil.png",
    set: {
      src: "/constant/images/foto_perfil.png",
      Dark: "/constant/images/foto_perfil.png",
      maxWidth: 768,
    },
  },
  arte: {
    src: "/constant/images/arte_perfil.png",
    alt: "arte do perfil",
    title: "Lucas Bucalon",
    fetchpriority: "low",
    dark: "/constant/images/arte_perfil.png",
    set: {
      src: "/constant/images/arte_perfil.png",
      Dark: "/constant/images/arte_perfil.png",
      maxWidth: 768,
    },
  },
};

export const linkMap = {
  curriculo: {
    href: "/constant/pdf/Curriculo.pdf",
    download: false,
    type: "application/pdf",
    title: "Currículo",
    "aria-label": "Currículo em PDF",
  },
};

export const iconMap = {
  icon: {
    src: "/constant/svg/icon.svg",
    alt: "icon",
    title: "icon",
  },
};

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
  configureSheet(animated);
  initAssets();

  document.addEventListener("spa:pageLoaded", (e) => {
    applyAssets(e.target);
    lazyLoadRoute();
  });

  console.log("Main.js initialized ✅");
});
