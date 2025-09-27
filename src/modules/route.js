import { routes, config } from "../main.js";

document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("route");

  function loadPage(pagePath) {
    console.log(`Tentando carregar a página: ${pagePath}.html`);

    fetch(`${pagePath}.html`)
      .then((response) => {
        if (!response.ok) {
          console.error(`Erro ${response.status}: ${response.statusText}`);
          throw new Error(`Erro ao carregar a página: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        content.innerHTML = html;
        console.log("Conteúdo carregado com sucesso!");
        executeScripts();
      })
      .catch((err) => {
        console.error("Erro ao carregar a página:", err);
        content.innerHTML =
          "<p>Desculpe, algo deu errado ao carregar a página.</p>";
      });
  }

  function executeScripts() {
    const scripts = content.querySelectorAll("script");

    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      if (script.src) newScript.src = script.src;
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript);
      script.remove();
    });
  }

  function parseRoute() {
    // pega o hash completo, incluindo a barra
    const hash = window.location.hash.substring(1) || `${config.pageInit}`;
    console.log(`Hash atual: ${hash}`);

    // procura a rota correspondente
    const route = routes.find((r) => r.path.test(hash));

    if (route) {
      loadPage(route.page);
    } else {
      content.innerHTML = "<p>Página não encontrada.</p>";
      console.warn(`Rota não encontrada para hash: ${hash}`);
    }
  }

  window.addEventListener("hashchange", parseRoute);

  parseRoute();
});
