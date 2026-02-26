import { routes, config } from "../main.js";
import { applyFade } from "./sheet.js";

document.addEventListener("DOMContentLoaded", () => {
  const routeEl = document.getElementById("route");
  if (!routeEl) return;

  /* =========================================================
     LOAD PAGE (SPA)
  ========================================================= */
  async function loadPage(pagePath) {
    try {
      const response = await fetch(`${pagePath}.html`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const html = await response.text();

      await applyFade(routeEl, async () => {
        routeEl.innerHTML = html;
        reexecuteScripts();
      });

      document.dispatchEvent(
        new CustomEvent("spa:pageLoaded", {
          detail: { page: pagePath },
        }),
      );
    } catch (error) {
      console.error("Erro ao carregar página:", error);
      routeEl.innerHTML =
        "<p>Desculpe, ocorreu um erro ao carregar a página.</p>";
    }
  }

  /* =========================================================
     REEXECUTA SCRIPTS INJETADOS
  ========================================================= */
  function reexecuteScripts() {
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

  /* =========================================================
     ROUTE RESOLUTION
  ========================================================= */
  function resolveRoute() {
    let hash = window.location.hash;

    // Se não houver hash → define página inicial
    if (!hash) {
      window.location.replace(`#/${config.pageInit}`);
      return;
    }

    // Ignora hashes que não são SPA (#footer por exemplo)
    if (!hash.startsWith("#/")) return;

    const path = hash.slice(1);
    const route = routes.find((r) => r.path.test(path));

    if (!route) {
      routeEl.innerHTML = "<p>Página não encontrada.</p>";
      return;
    }

    loadPage(route.page);
  }

  /* =========================================================
     CLICK INTERCEPTOR GLOBAL
  ========================================================= */
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");

    /* -------------------------
       SPA NAVIGATION
    ------------------------- */
    if (link.hasAttribute("page")) {
      event.preventDefault();

      if (window.location.hash !== href) {
        window.location.hash = href;
      } else {
        resolveRoute(); // recarrega mesma rota
      }

      return;
    }

    /* -------------------------
       INTERNAL SCROLL (MOVE)
    ------------------------- */
    if (link.hasAttribute("move")) {
      event.preventDefault();

      if (!href || !href.startsWith("#")) return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      const startY = window.scrollY;
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      const distance = targetY - startY;
      const duration = 700; // tempo da animação (ms)

      let startTime = null;
      let isScrolling = true;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function animation(currentTime) {
        if (!startTime) startTime = currentTime;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1 && isScrolling) {
          requestAnimationFrame(animation);
        }
      }

      function cancelScroll() {
        isScrolling = false;
        window.removeEventListener("wheel", cancelScroll);
        window.removeEventListener("touchmove", cancelScroll);
      }

      window.addEventListener("wheel", cancelScroll, { passive: true });
      window.addEventListener("touchmove", cancelScroll, { passive: true });

      requestAnimationFrame(animation);

      return;
    }
  });

  /* =========================================================
     EVENT LISTENERS
  ========================================================= */
  window.addEventListener("hashchange", resolveRoute);

  // Inicialização
  resolveRoute();
});
