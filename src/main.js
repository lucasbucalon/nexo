import {
  initAssets,
  applyAssets,
  setAssetMaps,
} from './modules/core/utils.js'

import { imageMap, linkMap, iconMap } from './assets.js'
import { configureSheet } from './modules/core/sheet.js'
import { createApp } from './modules/lib/index.js'
export function matchRoute(url, routes) {
  return routes.find((r) => r.path.test(url))
}

import './modules/core/theme.js'

// ------------------------------
// CONFIG GLOBAL (COMPARTILHÁVEL SSR/CLIENT)
// ------------------------------
export const config = {
  dirs: {
    layouts: '/components/layouts',
    models: '/components/models',
  },
  pageInit: '/home',
}

export const routes = [
  { path: /^\/home$/, page: '/pages/home' },
  { path: /^\/about$/, page: '/pages/about' },
  { path: /^\/work$/, page: '/pages/work' },
  { path: /^\/hooby$/, page: '/pages/hooby' },
  { path: /^\/gallery$/, page: '/pages/gallery' },
]

// ------------------------------
// ANIMAÇÕES (CLIENT ONLY)
// ------------------------------
export const animated = {
  scroll: {
    enabled: true,
    mode: 'smooth',
    custom: { ease: 0.4, stepMin: 1, stepMax: 60 },
  },
  fade: {
    enabled: true,
    duration: 300,
    useTranslate: true,
    translateValue: '5px',
  },
}

// ------------------------------
// BOOTSTRAP CLIENT (SPA HYDRATION)
// ------------------------------
function bootstrapClient() {
  // segurança SSR
  if (typeof window === 'undefined') return

  // assets
  setAssetMaps({ imageMap, linkMap, iconMap })
  initAssets()

  // animações
  configureSheet(animated)

  // app SPA
  const app = createApp({
    routes,
    config,
    root:
      document.getElementById('route') ||
      document.getElementById('app'),
  })

  app.mount()

  // pós-render SPA
  document.addEventListener('spa:pageLoaded', (e) => {
    const container = e.detail?.container || document

    try {
      applyAssets(container)
    } catch (err) {
      console.warn('applyAssets falhou:', err)
    }
  })

  console.log('[SPA] Client hydrated ✅')
}

// ------------------------------
// AUTO START (CLIENT ONLY)
// ------------------------------
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      bootstrapClient
    )
  } else {
    bootstrapClient()
  }
}
