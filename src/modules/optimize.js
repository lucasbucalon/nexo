// optimize.js
import { config } from "../main.js";

// ------------------------------
// ERROS IGNORADOS
// ------------------------------
const IGNORED_ERRORS = [
  "A listener indicated an asynchronous response",
  "chrome-extension",
];

function ignoreError(event) {
  const msg = event.message || event.reason || "";
  if (IGNORED_ERRORS.some((p) => msg.includes(p))) {
    console.warn("Ignorado:", msg);
    event.preventDefault?.();
  }
}

window.addEventListener("error", ignoreError);
window.addEventListener("unhandledrejection", ignoreError);

// ------------------------------
// TRACK DE ASSETS CARREGADOS
// ------------------------------
const loadedAssets = { css: new Set(), js: new Set() };

// ------------------------------
// CARREGAMENTO DINÂMICO DE CSS/JS
// ------------------------------
export function loadCSS(href) {
  if (loadedAssets.css.has(href)) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
    loadedAssets.css.add(href);
  });
}

export function loadJS(src, module = true) {
  if (loadedAssets.js.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    if (module) script.type = "module";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.body.appendChild(script);
    loadedAssets.js.add(src);
  });
}

// ------------------------------
// OBSERVER PARA LAZY LOAD POR VISIBILIDADE
// ------------------------------
const lazyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      for (const cls of Array.from(el.classList).filter((c) =>
        c.includes("-")
      )) {
        const [category, name] = cls.split("-");
        const css = `${config.dirs.models}/${category}/${name}/styles.css`;
        const js = `${config.dirs.models}/${category}/${name}/script.js`;

        try {
          await loadCSS(css);
          await loadJS(js);
          const key = `${category}-${name}`;
          window.Components?.[key]?.init?.();
        } catch (e) {
          console.warn(e);
        }
      }

      if (el.dataset.lazy) {
        import(el.dataset.lazy)
          .then((m) => m.init?.(el))
          .catch(() => {});
      }

      el.querySelectorAll("script[type='module'][src$='script.js']").forEach(
        (s) => {
          loadJS(s.src).catch(() => {});
        }
      );

      lazyObserver.unobserve(el);
    });
  },
  { threshold: 0.1 }
);

// ------------------------------
// INICIALIZAÇÃO DE LAZY LOAD
// ------------------------------
export function initLazyLoad() {
  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => lazyObserver.observe(el));
}

// ------------------------------
// LAZY LOAD POR ROTA
// ------------------------------
export async function lazyLoadRoute() {
  document.querySelectorAll("[data-lazy]").forEach((el) => {
    import(el.dataset.lazy)
      .then((m) => m.init?.(el))
      .catch(() => {});
  });

  document
    .querySelectorAll("script[type='module'][src$='script.js']")
    .forEach((s) => loadJS(s.src).catch(() => {}));
}

// ------------------------------
// EXECUÇÃO AUTOMÁTICA
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initLazyLoad();
});

document.addEventListener("spa:pageLoaded", () => {
  initLazyLoad();
});
