window.Components = window.Components || {};

window.Components["background-particles"] = (function () {
  let animationId = null;
  let particles = [];
  let container = null;

  function init() {
    container = document.querySelector(".background-particles");
    if (!container) return;

    // Se já existe animação ativa, não recria
    if (animationId) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    particles = [];

    function createParticle() {
      const el = document.createElement("div");
      el.classList.add("particle");

      const size = Math.random() * 4 + 1;
      el.style.width = el.style.height = `${size}px`;

      const particle = {
        el,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1 - 0.5,
      };

      el.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
      container.appendChild(el);
      particles.push(particle);
    }

    function animate() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }

      animationId = requestAnimationFrame(animate);
    }

    for (let i = 0; i < 60; i++) createParticle();
    animate();
  }

  function destroy() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (container) {
      container.innerHTML = "";
    }

    particles = [];
  }

  return { init, destroy };
})();
