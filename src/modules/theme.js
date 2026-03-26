const html = document.documentElement;
const toggleButton = document.getElementById("theme-toggle");

// ------------------
// HELPERS
// ------------------
function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSavedTheme() {
  return localStorage.getItem("theme");
}

function applyTheme(theme) {
  html.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = getSavedTheme();
  const system = getSystemTheme();

  applyTheme(saved || system);
}

// ------------------
// EVENTOS
// ------------------
function setupThemeEvents() {
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const current = html.dataset.theme;
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  // Reage se o usuário mudar o tema do sistema operacional
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", (e) => {
    // Só muda automaticamente se o usuário não tiver escolhido manualmente
    if (!getSavedTheme()) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
}

// ------------------
// INIT
// ------------------
initTheme();
setupThemeEvents();
