import { loadPage } from './loader.js'
import { handleNavigation } from './navigation.js'
export function createRouter({ routes, config, root }) {
  function resolveRoute() {
    let hash = window.location.hash
    if (!hash) {
      window.location.replace(`#${config.pageInit}`)
      return
    }
    if (!hash.startsWith('#/')) return
    const path = hash.slice(1)
    const route = routes.find((r) => r.path.test(path))
    if (!route) {
      root.innerHTML = '<p>Página não encontrada.</p>'
      return
    }
    loadPage(route.page, root)
  }
  function init() {
    handleNavigation(resolveRoute)
    window.addEventListener('hashchange', resolveRoute)
    resolveRoute()
  }
  return { init }
}
