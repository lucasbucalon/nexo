const isBrowser = typeof window !== 'undefined'

// ------------------
// HELPERS
// ------------------

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)')
    .matches
    ? 'dark'
    : 'light'
}

function getSavedTheme() {
  return localStorage.getItem('theme')
}

function applyTheme(theme) {
  const html = document.documentElement
  html.dataset.theme = theme
  localStorage.setItem('theme', theme)
}

function initTheme() {
  const saved = getSavedTheme()
  applyTheme(saved || getSystemTheme())
}

// ------------------
// INIT CLIENT ONLY
// ------------------

if (isBrowser) {
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle')

    if (toggle) {
      toggle.addEventListener('click', () => {
        const html = document.documentElement
        const next =
          html.dataset.theme === 'dark' ? 'light' : 'dark'

        applyTheme(next)
      })
    }

    initTheme()
  })
}
