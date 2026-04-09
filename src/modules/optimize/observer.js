import { loadCSS, loadJS } from './assets.js'
import { config } from '../../main.js'

export function createObserver() {
  return new IntersectionObserver(async (entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue

      const el = entry.target

      for (const cls of el.classList) {
        if (!cls.includes('-')) continue

        const [category, name] = cls.split('-')

        const base = `${config.dirs.models}/${category}/${name}`

        await loadCSS(`${base}/styles.css`)
        await loadJS(`${base}/script.js`)

        window.Components?.[`${category}-${name}`]?.init?.()
      }

      if (el.dataset.lazy) {
        import(el.dataset.lazy).then((m) => m.init?.(el))
      }

      obs.unobserve(el)
    }
  })
}
