import { config } from "../main.js";

window.loadConstants = async function (root = document) {
  root = root || document;

  const loadedCss = window._loadedCss || new Set();
  const loadedJs = window._loadedJs || new Set();
  window._loadedCss = loadedCss;
  window._loadedJs = loadedJs;

  const classSet = new Set();
  root.querySelectorAll("[class*='-']").forEach((el) =>
    el.classList.forEach((c) => {
      if (c.includes("-")) classSet.add(c);
    })
  );
  const components = [...classSet];

  components.forEach((comp) => {
    const [category, name] = comp.split("-");
    if (!category || !name) return;

    const cssPath = `${config.dirs.models}/${category}/${name}/styles.css`;
    if (!loadedCss.has(cssPath)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
      loadedCss.add(cssPath);
    }
  });

  const jsPromises = components.map((comp) => {
    const [category, name] = comp.split("-");
    if (!category || !name) return Promise.resolve();

    const jsPath = `${config.dirs.models}/${category}/${name}/script.js`;
    if (loadedJs.has(jsPath)) {
      if (window.Components?.[comp]?.init) window.Components[comp].init();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = jsPath;
      script.defer = true;
      script.onload = () => {
        if (window.Components?.[comp]?.init) {
          try {
            window.Components[comp].init();
          } catch (err) {
            console.warn(`[Framework] Erro init componente ${comp}:`, err);
          }
        }
        resolve();
      };
      script.onerror = () => {
        console.warn(`[Framework] Falha ao carregar script: ${jsPath}`);
        resolve();
      };
      document.body.appendChild(script);
      loadedJs.add(jsPath);
    });
  });

  await Promise.all(jsPromises);
};

document.addEventListener("spa:pageLoaded", (e) => loadConstants(e.target));
