import {
  initAssets,
  applyAssets,
  setAssetMaps,
} from './modules/utils.js'

import { imageMap, linkMap, iconMap } from './assets.js'
import { configureSheet } from './modules/sheet.js'
import { createApp } from './modules/lib/index.js'

import './modules/theme.js'

// ---------- Configurações ----------
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

// ---------- Configurações de animação ----------
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

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
  // assets
  setAssetMaps({ imageMap, linkMap, iconMap })
  initAssets()

  // animação
  configureSheet(animated)

  // framework
  const app = createApp({
    routes,
    config,
    root: document.getElementById('route'),
  })

  app.mount()

  // pós-render
  document.addEventListener('spa:pageLoaded', (e) => {
    const container = e.detail?.container || document

    try {
      applyAssets(container)
    } catch (err) {
      console.warn('applyAssets falhou:', err)
    }
  })

  console.log('App initialized ✅')
})
