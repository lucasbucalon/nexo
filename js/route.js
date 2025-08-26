document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

  function loadPage(page) {
    console.log(`Tentando carregar a página: pages/${page}.html`);

    fetch(`pages/${page}.html`)
      .then((response) => {
        if (!response.ok) {
          console.error(`Erro ${response.status}: ${response.statusText}`);
          throw new Error(`Erro ao carregar a página: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        if (html) {
          content.innerHTML = html;
          console.log("Conteúdo carregado com sucesso!");

          executeScripts();
        }
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
      newScript.src = script.src;
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript);
      script.remove();
    });
  }

  function parseRoute() {
    const hash = window.location.hash.substring(1) || "home";
    console.log(`Hash atual: ${hash}`);
    loadPage(hash);
  }

  window.addEventListener("hashchange", parseRoute);

  parseRoute();
});
