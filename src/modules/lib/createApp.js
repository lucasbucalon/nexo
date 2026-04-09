import { createRouter } from '../router/index.js'
import { initOptimize } from '../optimize/index.js'
import { loadModels } from './model.js'
import { loadLayouts } from './layout.js'

export function createApp({ routes, config, root }) {
  return {
    mount() {
      if (!root) return

      initOptimize()

      const router = createRouter({
        routes,
        config,
        root,
      })

      router.init()

      // 🔥 PRIMEIRA EXECUÇÃO (FALTAVA ISSO)
      loadModels(root, config)
      loadLayouts(root, config)

      document.addEventListener('spa:pageLoaded', (e) => {
        const container = root // 🔥 força consistência

        loadModels(container, config)
        loadLayouts(container, config)
      })
    },
  }
}
