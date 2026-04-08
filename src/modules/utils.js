// --------------------------------------------------
// IMPORTS
// --------------------------------------------------

let imageMap = {}
let linkMap = {}
let iconMap = {}

// --------------------------------------------------
// SETUP DOS MAPAS
// --------------------------------------------------

export function setAssetMaps(maps) {
  imageMap = maps.imageMap || {}
  linkMap = maps.linkMap || {}
  iconMap = maps.iconMap || {}

  // Re-render ícones existentes
  document
    .querySelectorAll('my-icon[data-icon]')
    .forEach((icon) => {
      if (typeof icon.render === 'function') {
        icon.render()
      }
    })
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getCurrentTheme = () =>
  document.documentElement.dataset.theme || 'light'
const getViewportWidth = () => window.innerWidth

function debounce(fn, delay = 150) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

// --------------------------------------------------
// IMAGENS DINÂMICAS
// --------------------------------------------------

function resolveImageSource(cfg) {
  if (!cfg || !cfg.src) return ''

  const theme = getCurrentTheme()
  const width = getViewportWidth()
  const isDark = theme === 'dark'

  if (cfg.set) {
    const matchesMin =
      !cfg.set.minWidth || width >= cfg.set.minWidth
    const matchesMax =
      !cfg.set.maxWidth || width <= cfg.set.maxWidth

    if (matchesMin && matchesMax) {
      return isDark && cfg.set.dark
        ? cfg.set.dark
        : cfg.set.src
    }
  }

  return isDark && cfg.dark ? cfg.dark : cfg.src
}

function applyImages(root = document) {
  if (!imageMap) return

  const images = root.querySelectorAll('[data-image]')

  images.forEach((img) => {
    const name = img.dataset.image
    const cfg = imageMap?.[name]

    if (!cfg) {
      console.warn(
        `[Assets] data-image="${name}" não encontrado.`
      )
      return
    }

    const newSrc = resolveImageSource(cfg)
    if (!newSrc) return

    if (img.getAttribute('src') !== newSrc) {
      img.setAttribute('src', newSrc)
    }

    if (cfg.srcset) {
      img.srcset = cfg.srcset
    }

    if (cfg.sizes) {
      img.sizes = cfg.sizes
    }
  })
}

// --------------------------------------------------
// LINKS DINÂMICOS
// --------------------------------------------------

function applyLinks(root = document) {
  if (!linkMap) return

  const links = root.querySelectorAll('[data-link]')

  links.forEach((link) => {
    const name = link.dataset.link
    const cfg = linkMap?.[name]

    if (!cfg || !cfg.href) {
      console.warn(`[Assets] data-link="${name}" inválido.`)
      return
    }

    const href = String(cfg.href).trim()

    if (
      !href ||
      href.toLowerCase().startsWith('javascript:')
    ) {
      console.warn(
        `[Assets] data-link="${name}" possui href inválido.`
      )
      return
    }

    link.href = href

    if (cfg.target) {
      link.target = cfg.target
    }

    if (cfg.rel) {
      link.rel = cfg.rel
    } else if (link.target === '_blank') {
      link.rel = 'noopener noreferrer'
    }

    if (cfg.download) {
      link.setAttribute(
        'download',
        cfg.download === true ? '' : cfg.download
      )
    }
  })
}

// --------------------------------------------------
// CUSTOM ELEMENT <my-icon>
// --------------------------------------------------

class IconElement extends HTMLElement {
  connectedCallback() {
    if (!iconMap || Object.keys(iconMap).length === 0)
      return
    this.render()
  }

  render() {
    const name = this.dataset.icon
    if (!name) return

    const cfg = iconMap?.[name]
    if (!cfg) {
      console.warn(
        `[Assets] Ícone "${name}" não encontrado.`
      )
      return
    }

    const src = typeof cfg === 'string' ? cfg : cfg.src
    if (!src) return

    this.dataset.src = src
    this.style.setProperty('--icon-url', `url("${src}")`)
  }
}

if (!customElements.get('my-icon')) {
  customElements.define('my-icon', IconElement)
}

function applyIcons(root = document) {
  root
    .querySelectorAll('my-icon[data-icon]')
    .forEach((icon) => {
      if (typeof icon.render === 'function') {
        icon.render()
      }
    })
}

// --------------------------------------------------
// APPLY UNIFICADO
// --------------------------------------------------

export function applyAssets(root = document) {
  if (!root) return

  applyImages(root)
  applyLinks(root)
  applyIcons(root)
}

// --------------------------------------------------
// OBSERVADOR SPA
// --------------------------------------------------

export function observeAssets(containerId = 'route') {
  const container = document.getElementById(containerId)
  if (!container) return

  const observer = new MutationObserver(() => {
    applyAssets(container)
  })

  observer.observe(container, {
    childList: true,
    subtree: true,
  })
}

// --------------------------------------------------
// REATIVIDADE GLOBAL
// --------------------------------------------------

function setupReactiveUpdates() {
  window.addEventListener(
    'resize',
    debounce(() => {
      applyImages()
    }, 200)
  )

  const themeObserver = new MutationObserver(() => {
    applyImages()
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
}

// --------------------------------------------------
// INICIALIZAÇÃO
// --------------------------------------------------

let initialized = false

export function initAssets() {
  if (initialized) return
  initialized = true

  applyAssets()
  observeAssets()
  setupReactiveUpdates()
}

// --------------------------------------------------
// TOOLTIPS
// --------------------------------------------------

let tooltip = null
let currentEl = null
let longPressTimer = null
let longPressPointerId = null
let longPressStartPos = null

const LONG_PRESS_MS = 450
const MOVE_THRESHOLD = 10

function clearLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
    longPressPointerId = null
    longPressStartPos = null
  }
}

function hideTooltip() {
  if (tooltip) {
    tooltip.remove()
    tooltip = null
    currentEl = null
  }
}

function showTooltipFor(el) {
  if (!el) return
  if (tooltip) tooltip.remove()

  tooltip = document.createElement('div')
  tooltip.className = 'tooltip-global'
  tooltip.textContent = el.dataset.tooltip || ''

  let offset = getComputedStyle(el)
    .getPropertyValue('--tooltip-offset')
    .trim()
  if (!offset) offset = '10px'
  tooltip.style.setProperty('--tooltip-offset', offset)

  document.body.appendChild(tooltip)

  const rect = el.getBoundingClientRect()
  tooltip.style.top = rect.top + 'px'
  tooltip.style.left = rect.left + rect.width / 2 + 'px'

  requestAnimationFrame(() => {
    if (!tooltip) return
    tooltip.classList.add('show')
  })

  currentEl = el

  const onDocPointerDown = (ev) => {
    if (
      ev.target.closest &&
      (ev.target.closest('[data-tooltip]') === el ||
        ev.target.closest('.tooltip-global') === tooltip)
    ) {
      return
    }
    hideTooltip()
    document.removeEventListener(
      'pointerdown',
      onDocPointerDown,
      true
    )
  }

  document.addEventListener(
    'pointerdown',
    onDocPointerDown,
    true
  )
}

// Mouse
document.addEventListener('pointerover', (e) => {
  if (e.pointerType === 'touch') return
  const el = e.target.closest('[data-tooltip]')
  if (!el || el === currentEl) return
  showTooltipFor(el)
})

document.addEventListener('pointerout', (e) => {
  if (e.pointerType === 'touch') return
  const el = e.target.closest('[data-tooltip]')
  if (!el || el !== currentEl) return
  hideTooltip()
})

// Touch
document.addEventListener(
  'pointerdown',
  (e) => {
    if (e.pointerType !== 'touch') return
    const el = e.target.closest('[data-tooltip]')
    if (!el) return

    longPressStartPos = { x: e.clientX, y: e.clientY }
    longPressPointerId = e.pointerId

    longPressTimer = setTimeout(() => {
      showTooltipFor(el)
      clearLongPress()
    }, LONG_PRESS_MS)
  },
  { passive: true }
)

document.addEventListener('pointermove', (e) => {
  if (!longPressTimer || e.pointerId !== longPressPointerId)
    return
  const dx = e.clientX - longPressStartPos.x
  const dy = e.clientY - longPressStartPos.y
  if (Math.hypot(dx, dy) > MOVE_THRESHOLD) clearLongPress()
})

document.addEventListener('pointerup', (e) => {
  if (longPressTimer && e.pointerId === longPressPointerId)
    clearLongPress()
})

document.addEventListener('pointercancel', clearLongPress)

window.addEventListener('scroll', hideTooltip)
window.addEventListener('resize', hideTooltip)
