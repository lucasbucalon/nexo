const html = document.documentElement;
const toggle = document.getElementById("button-theme");

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
  applyTheme(saved || getSystemTheme());
}

toggle.addEventListener("click", () => {
  const current = html.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
});

initTheme();
