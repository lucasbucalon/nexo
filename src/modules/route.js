import { routes, config } from "../main.js";
import { applyFade } from "./sheet.js";

document.addEventListener("DOMContentLoaded", () => {
  const routeEl = document.getElementById("route");

  if (!routeEl) return;

  async function loadPage(pagePath) {
    try {
      const response = await fetch(`${pagePath}.html`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const html = await response.text();

      await applyFade(routeEl, async () => {
        routeEl.innerHTML = html;
        executeScripts();
      });

      const ev = new CustomEvent("spa:pageLoaded", {
        detail: { page: pagePath },
        target: routeEl,
      });
      routeEl.dispatchEvent(ev);
      document.dispatchEvent(ev);
    } catch (err) {
      console.error("Erro ao carregar a página:", err);
      routeEl.innerHTML =
        "<p>Desculpe, algo deu errado ao carregar a página.</p>";
    }
  }

  function executeScripts() {
    const scripts = routeEl.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = false; 
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.replaceWith(newScript); 
    });
  }

  function parseRoute() {
    const hash = window.location.hash.substring(1) || config.pageInit;
    const route = routes.find((r) => r.path.test(hash));
    if (route) {
      loadPage(route.page);
    } else {
      routeEl.innerHTML = "<p>Página não encontrada.</p>";
    }
  }

  window.addEventListener("hashchange", parseRoute);
  parseRoute();
});
