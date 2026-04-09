import { config } from '../../main.js'

// ------------------------------
// ERROS IGNORADOS
// ------------------------------

const IGNORED_ERRORS = [
  'A listener indicated an asynchronous response',
  'chrome-extension',
]

function ignoreError(event) {
  const msg = event.message || event.reason || ''
  if (IGNORED_ERRORS.some((p) => msg.includes(p))) {
    console.warn('Ignorado:', msg)
    event.preventDefault?.()
  }
}

window.addEventListener('error', ignoreError)
window.addEventListener('unhandledrejection', ignoreError)

// ------------------------------
// TRACK DE ASSETS CARREGADOS
// ------------------------------
const loadedAssets = { css: new Set(), js: new Set() }

// ------------------------------
// CARREGAMENTO DINÂMICO DE CSS/JS
// ------------------------------
export async function loadCSS(
  href,
  { preload = false } = {}
) {
  const hrefResolved = new URL(href, document.baseURI).href
  if (loadedAssets.css.has(hrefResolved)) return

  try {
    const headResp = await fetch(hrefResolved, {
      method: 'HEAD',
    })
    if (!headResp.ok) {
      console.warn(
        `[Optimize] CSS não encontrado: ${hrefResolved}`
      )
      loadedAssets.css.add(hrefResolved)
      return
    }
  } catch (err) {}

  return new Promise((resolve) => {
    let link
    if (preload) {
      link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = hrefResolved
      link.onload = () => {
        try {
          link.rel = 'stylesheet'
        } catch (e) {}
        resolve()
      }
      link.onerror = () => {
        try {
          link.rel = 'stylesheet'
        } catch (e) {}
        resolve()
      }
      document.head.appendChild(link)
    } else {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = hrefResolved
      link.onload = resolve
      link.onerror = resolve
      document.head.appendChild(link)
    }

    loadedAssets.css.add(hrefResolved)
  })
}

export async function loadJS(src, module = true) {
  const srcResolved = new URL(src, document.baseURI).href
  if (loadedAssets.js.has(srcResolved)) return

  try {
    const headResp = await fetch(srcResolved, {
      method: 'HEAD',
    })
    if (!headResp.ok) {
      console.warn(
        `[Optimize] Script não encontrado: ${srcResolved}`
      )
      loadedAssets.js.add(srcResolved)
      return
    }
  } catch (err) {}

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = srcResolved
    script.defer = true
    if (module) script.type = 'module'
    script.onload = () => resolve()
    script.onerror = () => {
      console.warn(
        `[Optimize] Falha ao carregar ${srcResolved}`
      )
      reject(new Error(`Falha ao carregar ${srcResolved}`))
    }
    document.body.appendChild(script)
    loadedAssets.js.add(srcResolved)
  })
}

// ------------------------------
// OBSERVER PARA LAZY LOAD POR VISIBILIDADE
// ------------------------------
const lazyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return
      const el = entry.target

      for (const cls of Array.from(el.classList).filter(
        (c) => c.includes('-')
      )) {
        const [category, name] = cls.split('-')
        const css = `${config.dirs.models}/${category}/${name}/styles.css`
        const js = `${config.dirs.models}/${category}/${name}/script.js`

        try {
          await loadCSS(css)
          await loadJS(js)
          const key = `${category}-${name}`
          window.Components?.[key]?.init?.()
        } catch (e) {
          console.warn(e)
        }
      }

      if (el.dataset.lazy) {
        import(el.dataset.lazy)
          .then((m) => m.init?.(el))
          .catch(() => {})
      }

      el.querySelectorAll(
        "script[type='module'][src$='script.js']"
      ).forEach((s) => {
        loadJS(s.src).catch(() => {})
      })

      lazyObserver.unobserve(el)
    })
  },
  { threshold: 0.1 }
)

// ------------------------------
// INICIALIZAÇÃO DE LAZY LOAD
// ------------------------------
export function initLazyLoad() {
  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => lazyObserver.observe(el))
}

// ------------------------------
// LAZY LOAD POR ROTA
// ------------------------------
export async function lazyLoadRoute() {
  document.querySelectorAll('[data-lazy]').forEach((el) => {
    import(el.dataset.lazy)
      .then((m) => m.init?.(el))
      .catch(() => {})
  })

  document
    .querySelectorAll(
      "script[type='module'][src$='script.js']"
    )
    .forEach((s) => loadJS(s.src).catch(() => {}))
}

// ------------------------------
// EXECUÇÃO AUTOMÁTICA
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initLazyLoad()
})

document.addEventListener('spa:pageLoaded', () => {
  initLazyLoad()
})
;(function () {
  const IGNORED = [
    'A listener indicated an asynchronous response',
    'chrome-extension',
  ]

  function shouldIgnore(msg) {
    if (!msg) return false
    try {
      msg = String(msg)
    } catch (e) {}
    return IGNORED.some((p) => msg.includes(p))
  }

  function onAny(e) {
    const msg =
      e.message ||
      (e.reason && e.reason.message) ||
      e.reason ||
      ''
    if (shouldIgnore(msg)) {
      try {
        e.preventDefault && e.preventDefault()
      } catch (err) {}
      try {
        e.stopImmediatePropagation &&
          e.stopImmediatePropagation()
      } catch (err) {}
      // silencioso para reduzir ruído de extensões
      return
    }
  }

  window.addEventListener('error', onAny, true)
  window.addEventListener('unhandledrejection', onAny, true)

  // Intercept console to filter extension-origin messages
  try {
    const nativeError = console.error.bind(console)
    console.error = function (...args) {
      try {
        const text = args
          .map((a) => {
            if (typeof a === 'string') return a
            if (a && a.message) return a.message
            try {
              return JSON.stringify(a)
            } catch (e) {
              return String(a)
            }
          })
          .join(' ')
        if (shouldIgnore(text)) return
      } catch (e) {}
      nativeError(...args)
    }

    const nativeWarn = console.warn.bind(console)
    console.warn = function (...args) {
      try {
        const text = args
          .map((a) =>
            typeof a === 'string'
              ? a
              : (a && a.message) || String(a)
          )
          .join(' ')
        if (shouldIgnore(text)) return
      } catch (e) {}
      nativeWarn(...args)
    }
  } catch (e) {}
})()
