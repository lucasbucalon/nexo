// const loadedStyles = new Set()
// const loadedScripts = new Set()
// const componentCache = new Map()

// function renderProps(template, props = {}) {
//   return Object.keys(props).reduce((html, key) => {
//     const safe = String(props[key]).replace(
//       /[&<>"]/g,
//       (m) =>
//         ({
//           '&': '&amp;',
//           '<': '&lt;',
//           '>': '&gt;',
//           '"': '&quot;',
//         })[m]
//     )

//     return html.replace(
//       new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
//       safe
//     )
//   }, template)
// }

// export async function loadLayout(
//   name,
//   container,
//   config,
//   props = {}
// ) {
//   if (!name || !container) return

//   let html = componentCache.get(name)

//   if (!html) {
//     const path = `${config.dirs.layouts}/${name}.html`

//     try {
//       const res = await fetch(path)
//       if (!res.ok) throw new Error(name)

//       html = await res.text()
//       componentCache.set(name, html)
//     } catch (err) {
//       container.innerHTML = `<p>Erro ao carregar ${name}</p>`
//       return
//     }
//   }

//   const temp = document.createElement('div')
//   temp.innerHTML = renderProps(html, props)

//   // CSS
//   temp
//     .querySelectorAll('link[rel="stylesheet"]')
//     .forEach((link) => {
//       if (loadedStyles.has(link.href)) return

//       const el = link.cloneNode(true)
//       document.head.appendChild(el)
//       loadedStyles.add(link.href)
//     })

//   // Scripts
//   const scripts = temp.querySelectorAll('script')
//   scripts.forEach((s) => s.remove())

//   container.innerHTML = temp.innerHTML

//   scripts.forEach((script, i) => {
//     const id = `${name}-${script.src || i}`
//     if (loadedScripts.has(id)) return

//     const el = document.createElement('script')

//     if (script.src) {
//       el.src = script.src
//       el.defer = true
//     } else {
//       el.textContent = script.textContent
//     }

//     document.body.appendChild(el)
//     loadedScripts.add(id)
//   })
// }
