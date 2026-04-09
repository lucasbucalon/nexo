const loadedCss = new Set()
const loadedJs = new Set()

export async function loadModels(root = document, config) {
  const classSet = new Set()

  root.querySelectorAll("[class*='-']").forEach((el) =>
    el.classList.forEach((c) => {
      if (c.includes('-')) classSet.add(c)
    })
  )

  const components = [...classSet]

  // CSS
  await Promise.all(
    components.map(async (comp) => {
      const [category, name] = comp.split('-')
      if (!category || !name) return

      const cssPath = `${config.dirs.models}/${category}/${name}/styles.css`
      if (loadedCss.has(cssPath)) return

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssPath

      document.head.appendChild(link)
      loadedCss.add(cssPath)
    })
  )

  // JS
  await Promise.all(
    components.map(async (comp) => {
      const [category, name] = comp.split('-')
      if (!category || !name) return

      const jsPath = `${config.dirs.models}/${category}/${name}/script.js`
      if (loadedJs.has(jsPath)) {
        window.Components?.[comp]?.init?.()
        return
      }

      await new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = jsPath
        script.defer = true

        script.onload = () => {
          window.Components?.[comp]?.init?.()
          resolve()
        }

        script.onerror = resolve

        document.body.appendChild(script)
        loadedJs.add(jsPath)
      })
    })
  )
}
