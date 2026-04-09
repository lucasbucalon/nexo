// client/bootstrap.js

import { initTheme } from '../modules/core/theme.js'
import { initAssets } from '../modules/core/utils.js'
import { initLazyLoad } from '../modules/optimize/lazy.js'

function bootstrap() {
  initTheme()
  initAssets()
  initLazyLoad()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
