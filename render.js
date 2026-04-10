import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { imageMap } from './src/assets.js'
import { routes } from './src/path.js'

// ------------------
// PATH FIX
// ------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function matchRoute(url) {
  return routes.find((r) => r.path.test(url))
}

// ------------------
// LOAD HTML FILE
// ------------------

async function loadHTML(file) {
  const filePath = path.join(__dirname, 'pages', file)
  return await fs.readFile(filePath, 'utf-8')
}

// ------------------
// SSR IMAGE RESOLVER
// ------------------

function resolveImages(html) {
  return html.replace(/data-image="(.*?)"/g, (_, name) => {
    const src = imageMap[name]
    if (!src) return ''
    return `src="${src}"`
  })
}

// ------------------
// TEMPLATE FINAL
// ------------------

function buildHTML(content) {
  return `
<!DOCTYPE html>
<html data-theme="light">
<head>
  <meta charset="UTF-8" />
  <title>SSR App</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>

<div id="app">
  ${content}
</div>

<script type="module" src="/src/main.js"></script>

</body>
</html>
`
}

// ------------------
// MAIN SSR
// ------------------

export async function renderPage(url) {
  const route = matchRoute(url)

  if (!route) {
    return `<h1>404</h1><p>${url}</p>`
  }

  let html = await loadHTML(route.file)

  html = resolveImages(html)

  return buildHTML(html)
}
