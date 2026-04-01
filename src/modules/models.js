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
    }),
  );
  const components = [...classSet];
  const cssPromises = components.map(async (comp) => {
    const [category, name] = comp.split("-");
    if (!category || !name) return;

    const cssPath = `${config.dirs.models}/${category}/${name}/styles.css`;
    if (loadedCss.has(cssPath)) return;

    try {
      const res = await fetch(cssPath, { method: "HEAD" });
      if (!res.ok) {
        console.warn(`[Framework] CSS não encontrado: ${cssPath}`);
        loadedCss.add(cssPath);
        return;
      }
    } catch (err) {}

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    document.head.appendChild(link);
    loadedCss.add(cssPath);
  });

  await Promise.all(cssPromises);

  const jsPromises = components.map(async (comp) => {
    const [category, name] = comp.split("-");
    if (!category || !name) return;

    const jsPath = `${config.dirs.models}/${category}/${name}/script.js`;
    if (loadedJs.has(jsPath)) {
      if (window.Components?.[comp]?.init) {
        try {
          window.Components[comp].init();
        } catch (err) {
          console.warn(`[Framework] Erro init componente ${comp}:`, err);
        }
      }
      return;
    }

    try {
      const head = await fetch(jsPath, { method: "HEAD" });
      if (!head.ok) {
        console.warn(`[Framework] Script não encontrado: ${jsPath}`);
        loadedJs.add(jsPath);
        return;
      }
    } catch (err) {}

    await new Promise((resolve) => {
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
