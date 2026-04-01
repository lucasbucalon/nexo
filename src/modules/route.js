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

      try {
        updateHeadFromHTML(html, pagePath);
      } catch (err) {
        console.warn("Falha ao atualizar head:", err);
      }

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

      // preserva todos os atributos (type, module, defer, async, crossorigin, etc.)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (oldScript.src) {
        try {
          newScript.src = new URL(oldScript.src, document.baseURI).href;
        } catch (e) {
          newScript.src = oldScript.src;
        }
        if (oldScript.hasAttribute("async")) newScript.async = true;
        if (oldScript.hasAttribute("defer")) newScript.defer = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }

      oldScript.replaceWith(newScript);
    });
  }

  /* =========================================================
     Atualiza head (title, meta description, og, canonical)
  ========================================================= */
  function updateOrCreateTag(selector, tagName, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(tagName);
      document.head.appendChild(el);
    }
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    return el;
  }

  function updateHeadFromHTML(html, pagePath) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const title =
      doc.querySelector("title")?.textContent ||
      doc.querySelector("[data-page-title]")?.textContent;
    if (title) document.title = title;

    const metaDesc = doc
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    if (metaDesc)
      updateOrCreateTag('meta[name="description"]', "meta", {
        name: "description",
        content: metaDesc,
      });

    // Open Graph
    doc.querySelectorAll('meta[property^="og:"]').forEach((m) => {
      const prop = m.getAttribute("property");
      const content = m.getAttribute("content");
      if (prop && content)
        updateOrCreateTag(`meta[property="${prop}"]`, "meta", {
          property: prop,
          content,
        });
    });

    const canonical =
      doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
      window.location.href;
    updateOrCreateTag('link[rel="canonical"]', "link", {
      rel: "canonical",
      href: canonical,
    });
  }

  /* =========================================================
     ROUTE RESOLUTION
  ========================================================= */
  function resolveRoute() {
    let hash = window.location.hash;

    if (!hash) {
      window.location.replace(`#${config.pageInit}`);
      return;
    }

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
        resolveRoute();
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
      const duration = 700;

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

  let resolved = false;

  function doResolve() {
    if (resolved) return;
    resolved = true;
    resolveRoute();
  }

  if (window.__frameworkReady) {
    doResolve();
  } else {
    const onReady = () => {
      doResolve();
      document.removeEventListener("framework:ready", onReady);
    };
    document.addEventListener("framework:ready", onReady);

    setTimeout(() => {
      doResolve();
    }, 300);
  }
});
