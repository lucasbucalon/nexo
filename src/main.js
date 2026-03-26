import { initAssets, applyAssets, setAssetMaps } from "./modules/utils.js";
import { lazyLoadRoute } from "./modules/optimize.js";
import { configureSheet } from "./modules/sheet.js";
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
  { path: /^\/work$/, page: "/pages/work" },
  { path: /^\/hooby$/, page: "/pages/hooby" },
  { path: /^\/gallery$/, page: "/pages/gallery" },
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
      dark: "/constant/images/foto_perfil.png",
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
      dark: "/constant/images/arte_perfil.png",
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
  sun: {
    src: "/constant/icons/sun.svg",
    alt: "sol",
    title: "sol",
  },

  moon: {
    src: "/constant/icons/moon.svg",
    alt: "lua",
    title: "lua",
  },

  home: {
    src: "/constant/icons/home.svg",
    alt: "home",
    title: "home",
  },

  about: {
    src: "/constant/icons/about.svg",
    alt: "sobre",
    title: "sobre",
  },

  work: {
    src: "/constant/icons/work.svg",
    alt: "trabalho",
    title: "trabalho",
  },

  hooby: {
    src: "/constant/icons/hooby.svg",
    alt: "hobby",
    title: "hobby",
  },

  gallery: {
    src: "/constant/icons/gallery.svg",
    alt: "galeria",
    title: "galeria",
  },

  footer: {
    src: "/constant/icons/footer.svg",
    alt: "rodapé",
    title: "rodapé",
  },

  facebook: {
    src: "/constant/icons/facebook.svg",
    alt: "facebook",
    title: "facebook",
  },

  instagram: {
    src: "/constant/icons/instagram.svg",
    alt: "instagram",
    title: "instagram",
  },

  linkedin: {
    src: "/constant/icons/linkedin.svg",
    alt: "linkedin",
    title: "linkedin",
  },
  whatsapp: {
    src: "/constant/icons/whatsapp.svg",
    alt: "whatsapp",
    title: "whatsapp",
  },
  github: {
    src: "/constant/icons/github.svg",
    alt: "github",
    title: "github",
  },
  email: {
    src: "/constant/icons/email.svg",
    alt: "email",
    title: "email",
  },
  doc: {
    src: "/constant/icons/doc.svg",
    alt: "document",
    title: "document",
  },

  tiktok: {
    src: "/constant/icons/tiktok.svg",
    alt: "tiktok",
    title: "tiktok",
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
