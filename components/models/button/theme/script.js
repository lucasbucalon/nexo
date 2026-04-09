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

// ------------------
// INIT
// ------------------

function initTheme() {
  const saved = getSavedTheme()
  applyTheme(saved || getSystemTheme())
}

// ------------------
// DOM READY
// ------------------

if (isBrowser) {
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle')

    if (toggle) {
      toggle.addEventListener('click', () => {
        const html = document.documentElement
        const current = html.dataset.theme
        const next = current === 'dark' ? 'light' : 'dark'
        applyTheme(next)
      })
    } else {
      console.warn('Botão de tema não encontrado')
    }

    initTheme()
  })
}
