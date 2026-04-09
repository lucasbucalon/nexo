import { initLazyLoad, lazyLoadRoute } from './lazy.js'
import { setupErrorFilter } from './errors.js'

export function initOptimize() {
  setupErrorFilter()

  if (document.readyState !== 'loading') {
    initLazyLoad()
  } else {
    document.addEventListener(
      'DOMContentLoaded',
      initLazyLoad
    )
  }

  document.addEventListener('spa:pageLoaded', () => {
    initLazyLoad()
    lazyLoadRoute()
  })
}
