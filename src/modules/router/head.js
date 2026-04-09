function updateOrCreateTag(selector, tagName, attrs) {
  let el = document.head.querySelector(selector)

  if (!el) {
    el = document.createElement(tagName)
    document.head.appendChild(el)
  }

  Object.keys(attrs).forEach((key) => {
    el.setAttribute(key, attrs[key])
  })

  return el
}

export function updateHeadFromHTML(html, pagePath) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  /* -------------------------
     TITLE
  ------------------------- */
  const title =
    doc.querySelector('title')?.textContent ||
    doc.querySelector('[data-page-title]')?.textContent

  if (title) {
    document.title = title
  }

  /* -------------------------
     META DESCRIPTION
  ------------------------- */
  const metaDesc = doc
    .querySelector('meta[name="description"]')
    ?.getAttribute('content')

  if (metaDesc) {
    updateOrCreateTag('meta[name="description"]', 'meta', {
      name: 'description',
      content: metaDesc,
    })
  }

  /* -------------------------
     OPEN GRAPH
  ------------------------- */
  doc
    .querySelectorAll('meta[property^="og:"]')
    .forEach((meta) => {
      const property = meta.getAttribute('property')
      const content = meta.getAttribute('content')

      if (property && content) {
        updateOrCreateTag(
          `meta[property="${property}"]`,
          'meta',
          {
            property,
            content,
          }
        )
      }
    })

  /* -------------------------
     CANONICAL
  ------------------------- */
  const canonical =
    doc
      .querySelector('link[rel="canonical"]')
      ?.getAttribute('href') || window.location.href

  updateOrCreateTag('link[rel="canonical"]', 'link', {
    rel: 'canonical',
    href: canonical,
  })
}
