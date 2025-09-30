// sheet.js

// ------------------------------
// Configurações internas padrão
// ------------------------------
let cfgInterno = {
  scroll: {
    enabled: false,
    mode: "original",
    custom: { ease: 0.2, stepMin: 0.8, stepMax: 80 },
  },
  fade: {
    enabled: true,
    duration: 250,
    useTranslate: true,
    translateValue: "1px",
  },
};

// ------------------------------
// Fade Helpers
// ------------------------------
export function fadeOut(el, duration = 200, translate = "6px") {
  return new Promise((resolve) => {
    if (!el) return resolve();
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.willChange = "opacity, transform";
    void el.offsetWidth;
    el.style.opacity = "0";
    if (translate) el.style.transform = `translateY(${translate})`;
    setTimeout(resolve, duration + 10);
  });
}

export function fadeIn(el, duration = 200) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.willChange = "opacity, transform";
    void el.offsetWidth;
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    setTimeout(resolve, duration + 10);
  });
}

// ------------------------------
// Espera transição de elemento
// ------------------------------
function onceTransitionEnd(el, timeoutMs = 250) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    let resolved = false;
    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    }, timeoutMs + 50);

    function handler(e) {
      if (e.target !== el || resolved) return;
      resolved = true;
      cleanup();
      resolve();
    }

    function cleanup() {
      clearTimeout(timer);
      el.removeEventListener("transitionend", handler);
    }

    el.addEventListener("transitionend", handler);
  });
}

// ------------------------------
// applyFade para renderizações SPA
// ------------------------------
const fadeMap = new WeakMap();

export async function applyFade(el, render, durationOverride) {
  const fadeCfg = cfgInterno.fade || { enabled: false };
  if (!fadeCfg.enabled || !el) return render();

  const duration = durationOverride ?? fadeCfg.duration;
  const translate = fadeCfg.useTranslate ? fadeCfg.translateValue : null;

  const ongoing = fadeMap.get(el);
  if (ongoing) await ongoing.catch(() => {});

  const op = (async () => {
    const prevTransition = el.style.transition;
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.willChange = "opacity, transform";

    if (!el.style.opacity)
      el.style.opacity = getComputedStyle(el).opacity || "1";

    void el.offsetWidth;

    el.style.opacity = "0";
    if (translate) el.style.transform = `translateY(${translate})`;

    await onceTransitionEnd(el, duration);
    await render();
    void el.offsetWidth;

    el.style.opacity = "1";
    if (translate) el.style.transform = "translateY(0)";

    await onceTransitionEnd(el, duration);

    el.style.transition = prevTransition || "";
  })();

  fadeMap.set(el, op);
  try {
    await op;
  } finally {
    fadeMap.delete(el);
  }
}

// ------------------------------
// Smooth Scroll SPA
// ------------------------------
let smoothState = { initialized: false, cleanup: null };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initSmoothScroll(scrollCfg) {
  if (smoothState.initialized || !scrollCfg?.enabled) return;

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouch && scrollCfg.mode !== "custom") return;

  const presets = {
    original: { ease: 1, stepMin: 0.5, stepMax: Infinity },
    smooth: { ease: 0.2, stepMin: 0.8, stepMax: 80 },
    heavy: { ease: 0.07, stepMin: 0.6, stepMax: 40 },
  };

  const cfgScroll =
    scrollCfg.mode === "custom"
      ? scrollCfg.custom || scrollCfg
      : presets[scrollCfg.mode] || presets.smooth;

  let target = window.scrollY;
  let current = target;
  let running = false;

  function animate() {
    const diff = target - current;
    if (Math.abs(diff) > 0.5) {
      let step = diff * cfgScroll.ease;
      step = clamp(step, -cfgScroll.stepMax, cfgScroll.stepMax);
      if (Math.abs(step) < cfgScroll.stepMin)
        step = step > 0 ? cfgScroll.stepMin : -cfgScroll.stepMin;
      current += step;
      window.scrollTo(0, current);
      requestAnimationFrame(animate);
    } else {
      current = target;
      window.scrollTo(0, current);
      running = false;
    }
  }

  function goTo(newTarget) {
    target = clamp(
      newTarget,
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    if (!running) {
      running = true;
      requestAnimationFrame(animate);
    }
  }

  function onWheel(e) {
    const tag = e.target?.tagName;
    if (
      e.ctrlKey ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(tag) ||
      e.target.isContentEditable
    )
      return;
    e.preventDefault();
    goTo(target + e.deltaY);
  }

  window.addEventListener("wheel", onWheel, { passive: false });

  smoothState.initialized = true;
  smoothState.cleanup = () => {
    window.removeEventListener("wheel", onWheel);
    smoothState.initialized = false;
    smoothState.cleanup = null;
  };

  console.log("Smooth scroll initialized:", cfgScroll);
}

// ------------------------------
// Configure sheet
// ------------------------------
export function configureSheet(configFromMain) {
  cfgInterno = { ...cfgInterno, ...configFromMain };
  initSmoothScroll(cfgInterno.scroll);
}

// ------------------------------
// Cleanup smooth scroll
// ------------------------------
export function cleanupSmooth() {
  if (smoothState.cleanup) smoothState.cleanup();
}
