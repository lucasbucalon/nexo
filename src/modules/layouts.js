import { config } from "../main.js";

const loadedStyles = new Set();
const loadedScripts = new Set();
const componentCache = new Map();

function getComponentPath(name, type = "html") {
  return `${window.location.origin}/${config.dirs.layouts}/${name}.${type}`;
}

function renderProps(template, props = {}) {
  let rendered = template;
  Object.keys(props).forEach((key) => {
    const safe = String(props[key]).replace(
      /[&<>"]/g,
      (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])
    );
    rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), safe);
  });
  return rendered;
}

export async function loadComponent(componentName, container, props = {}) {
  if (!componentName || !container) return;

  let html = componentCache.get(componentName);
  if (!html) {
    try {
      const res = await fetch(getComponentPath(componentName, "html"));
      if (!res.ok)
        throw new Error(`Componente ${componentName} não encontrado`);
      html = await res.text();
      componentCache.set(componentName, html);
    } catch (err) {
      container.innerHTML = `<p style="color:red">Erro ao carregar ${componentName}</p>`;
      console.error(err);
      return;
    }
  }

  const renderedHTML = renderProps(html, props);
  const temp = document.createElement("div");
  temp.innerHTML = renderedHTML;

  const stylePromises = Array.from(
    temp.querySelectorAll('link[rel="stylesheet"]')
  ).map((link) => {
    if (!link.href || loadedStyles.has(link.href)) return Promise.resolve();
    return new Promise((resolve) => {
      const newLink = link.cloneNode(true);
      newLink.onload = newLink.onerror = resolve;
      document.head.appendChild(newLink);
      loadedStyles.add(link.href);
    });
  });
  await Promise.all(stylePromises);

  const scripts = Array.from(temp.querySelectorAll("script"));
  scripts.forEach((s) => s.remove());
  container.innerHTML = temp.innerHTML;

  scripts.forEach((script, idx) => {
    const id = `${componentName}-${script.src || "inline-" + idx}`;
    if (loadedScripts.has(id)) return;

    const el = document.createElement("script");
    if (script.src) {
      el.src = script.src;
      el.defer = true;
    } else {
      el.textContent = script.textContent;
    }
    document.body.appendChild(el);
    loadedScripts.add(id);
  });

  if (typeof window.setupInstallButton === "function")
    window.setupInstallButton();
}

export function loadAllComponents(root = document) {
  root.querySelectorAll("[data-component]").forEach((el) => {
    if (el.dataset.initialized === "true") return;

    const name = el.dataset.component;
    const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
    loadComponent(name, el, props);

    el.dataset.initialized = "true";
  });
}

document.addEventListener("DOMContentLoaded", () => loadAllComponents());
document.addEventListener("spa:pageLoaded", (e) => loadAllComponents(e.target));
