// --------------------------------------------------
// ENV DETECTION (SSR SAFE)
// --------------------------------------------------

const isBrowser = typeof window !== 'undefined'
const isDOM = isBrowser && typeof document !== 'undefined'

// --------------------------------------------------
// IMPORTS
// --------------------------------------------------

import { config as globalConfig } from '../../main.js'

// --------------------------------------------------
// CACHE
// --------------------------------------------------

const loadedStyles = new Set()
const loadedScripts = new Set()
const componentCache = new Map()

// --------------------------------------------------
// PATH RESOLVER
// --------------------------------------------------

function getComponentPath(name) {
  return `${globalConfig.dirs.layouts}/${name}.html`
}

// --------------------------------------------------
// TEMPLATE ENGINE
// --------------------------------------------------

function renderProps(template, props = {}) {
  let rendered = template

  for (const key in props) {
    const safe = String(props[key]).replace(
      /[&<>"]/g,
      (m) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
        })[m]
    )

    rendered = rendered.replace(
      new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
      safe
    )
  }

  return rendered
}

// --------------------------------------------------
// CORE LOADER
// --------------------------------------------------

export async function loadLayouts(
  componentName,
  container,
  props = {}
) {
  if (!isDOM) return
  if (!componentName || !container) return

  let html = componentCache.get(componentName)

  if (!html) {
    try {
      const res = await fetch(
        getComponentPath(componentName)
      )

      if (!res.ok) {
        throw new Error(
          `Componente ${componentName} não encontrado`
        )
      }

      html = await res.text()
      componentCache.set(componentName, html)
    } catch (err) {
      container.innerHTML = `<p style="color:red">Erro ao carregar ${componentName}</p>`
      console.error(err)
      return
    }
  }

  const renderedHTML = renderProps(html, props)

  const temp = document.createElement('div')
  temp.innerHTML = renderedHTML

  // --------------------------------------------------
  // STYLES
  // --------------------------------------------------

  const stylePromises = Array.from(
    temp.querySelectorAll('link[rel="stylesheet"]')
  ).map((link) => {
    if (!link.href || loadedStyles.has(link.href)) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const newLink = link.cloneNode(true)

      newLink.onload = resolve
      newLink.onerror = resolve

      document.head.appendChild(newLink)
      loadedStyles.add(link.href)
    })
  })

  await Promise.all(stylePromises)

  // --------------------------------------------------
  // SCRIPTS EXTRACTION
  // --------------------------------------------------

  const scripts = Array.from(
    temp.querySelectorAll('script')
  )
  scripts.forEach((s) => s.remove())

  container.innerHTML = temp.innerHTML

  // --------------------------------------------------
  // SCRIPT EXECUTION
  // --------------------------------------------------

  scripts.forEach((script, idx) => {
    const id = `${componentName}-${script.src || `inline-${idx}`}`

    if (loadedScripts.has(id)) return

    const el = document.createElement('script')

    if (script.src) {
      el.src = script.src
      el.defer = true
    } else {
      el.textContent = script.textContent
    }

    document.body.appendChild(el)
    loadedScripts.add(id)
  })

  // hook opcional global
  if (typeof window.setupInstallButton === 'function') {
    window.setupInstallButton()
  }
}

// --------------------------------------------------
// AUTO COMPONENT LOADER
// --------------------------------------------------

export function loadAllComponents(root = document) {
  if (!isDOM) return

  root
    .querySelectorAll('[data-component]')
    .forEach((el) => {
      if (el.dataset.initialized === 'true') return

      const name = el.dataset.component

      let props = {}
      if (el.dataset.props) {
        try {
          props = JSON.parse(el.dataset.props)
        } catch {}
      }

      loadLayouts(name, el, props)

      el.dataset.initialized = 'true'
    })
}

// --------------------------------------------------
// BOOTSTRAP (CLIENT ONLY)
// --------------------------------------------------

function setupAutoInit() {
  if (!isDOM) return

  document.addEventListener('DOMContentLoaded', () =>
    loadAllComponents()
  )

  document.addEventListener('spa:pageLoaded', (e) => {
    loadAllComponents(e.target || document)
  })
}

// ativa somente no browser
if (isBrowser) {
  setupAutoInit()
}
