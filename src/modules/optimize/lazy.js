import { createObserver } from './observer.js'
import { loadJS } from './assets.js'

const isBrowser = typeof window !== 'undefined'

let observer = null

// --------------------------------------------------
// INIT LAZY LOAD
// --------------------------------------------------

export function initLazyLoad() {
  if (!isBrowser) return

  if (!observer) {
    observer = createObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        const el = entry.target

        for (const cls of el.classList) {
          if (!cls.includes('-')) continue

          const [category, name] = cls.split('-')

          const base = `/${category}/${name}`

          import(`./${base}/index.js`)
            .then((m) => m.init?.(el))
            .catch(() => {})
        }

        observer.unobserve(el)
      }
    })
  }

  if (!observer) return

  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => observer.observe(el))
}

// --------------------------------------------------
// ROUTE LAZY LOAD
// --------------------------------------------------

export function lazyLoadRoute() {
  if (!isBrowser) return

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
