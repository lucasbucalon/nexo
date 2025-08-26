function loadComponent(componentId) {
  let componentPath = `components/${componentId}.html`;

  fetch(componentPath)
    .then((response) => {
      if (!response.ok) {
        console.warn(`Componente ${componentId} não encontrado.`);
        return;
      }
      return response.text();
    })
    .then((html) => {
      if (html) {
        const container = document.getElementById(componentId);
        if (!container) return;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        tempDiv.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          if (!document.querySelector(`link[href="${link.href}"]`)) {
            document.head.appendChild(link.cloneNode(true));
          }
        });

        const scripts = [...tempDiv.querySelectorAll("script")];
        scripts.forEach((script) => script.remove());

        container.innerHTML = tempDiv.innerHTML;

        scripts.forEach((script) => {
          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
            newScript.defer = true;
          } else {
            newScript.textContent = script.textContent;
          }
          document.body.appendChild(newScript);
        });

        loadComponentScript(componentId);
      }
    })
    .catch((err) => console.error("Erro ao carregar componente:", err));
}

function loadComponentScript(componentId) {
  const scriptUrl = `components/${componentId}.js`;

  fetch(scriptUrl, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.defer = true;
        document.body.appendChild(script);
      }
    })
    .catch(() => console.warn(`Nenhum script encontrado para ${componentId}`));
}

function loadAllComponents() {
  document.querySelectorAll("[id]").forEach((element) => {
    loadComponent(element.id);
  });
}

document.addEventListener("DOMContentLoaded", loadAllComponents);
