import { createObserver } from './observer.js'
import { loadJS } from './assets.js'

const observer = createObserver()

export function initLazyLoad() {
  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => observer.observe(el))
}

export function lazyLoadRoute() {
  document.querySelectorAll('[data-lazy]').forEach((el) => {
    import(el.dataset.lazy).then((m) => m.init?.(el))
  })

  document
    .querySelectorAll(
      "script[type='module'][src$='script.js']"
    )
    .forEach((s) => loadJS(s.src))
}
