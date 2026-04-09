import { routes, matchRoute } from './src/main.js'

async function loadPage(page) {
  // ajuste conforme seu sistema real de pages
  const mod = await import(`${page}/index.js`)
  return mod.render?.() || '<h1>Page sem render()</h1>'
}

export async function renderPage(url) {
  console.log('RAW URL:', url)

  const route = matchRoute(url, routes)

  console.log('ROUTE MATCH:', route)

  if (!route) {
    return `
      <h1>404 SSR</h1>
      <p>URL: ${url}</p>
    `
  }

  console.log('LOADING PAGE:', route.page)

  const html = await loadPage(route.page)

  return html
}
