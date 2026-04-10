import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { renderPage } from './render.js'

const app = express()

// ------------------
// PATH FIX (ESM)
// ------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ------------------
// STATIC FILES
// ------------------

app.use(
  '/modules',
  express.static(path.join(__dirname, 'modules'))
)
app.use(
  '/assets',
  express.static(path.join(__dirname, 'assets'))
)
app.use(express.static(__dirname)) // opcional (client.js, etc)

// ------------------
// SSR ROUTE (CORRETA)
// ------------------

app.use(async (req, res) => {
  try {
    const html = await renderPage(req.path, req)
    res.status(200).send(html)
  } catch (err) {
    console.error('[SSR ERROR]', err)
    res.status(500).send('<h1>Erro SSR</h1>')
  }
})

// ------------------
// START SERVER
// ------------------

app.listen(3000, () => {
  console.log('SSR rodando em http://localhost:3000')
})
