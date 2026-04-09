const IGNORED = [
  'A listener indicated an asynchronous response',
  'chrome-extension',
]

function shouldIgnore(msg) {
  return IGNORED.some((p) => msg?.includes(p))
}

export function setupErrorFilter() {
  function handler(e) {
    const msg =
      e.message || e.reason?.message || e.reason || ''

    if (shouldIgnore(msg)) {
      e.preventDefault?.()
      e.stopImmediatePropagation?.()
    }
  }

  window.addEventListener('error', handler, true)
  window.addEventListener(
    'unhandledrejection',
    handler,
    true
  )
}
