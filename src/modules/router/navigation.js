export function handleNavigation(resolveRoute) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a')
    if (!link) return

    const href = link.getAttribute('href')

    if (link.hasAttribute('page')) {
      event.preventDefault()

      if (window.location.hash !== href) {
        window.location.hash = href
      } else {
        resolveRoute()
      }
    }
  })
}
