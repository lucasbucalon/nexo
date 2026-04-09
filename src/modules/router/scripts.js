export function reexecuteScripts(root) {
  const scripts = root.querySelectorAll('script')

  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script')

    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value)
    })

    if (oldScript.src) {
      newScript.src = new URL(
        oldScript.src,
        document.baseURI
      ).href
    } else {
      newScript.textContent = oldScript.textContent
    }

    oldScript.replaceWith(newScript)
  })
}
