window.Components = window.Components || {};
window.Components["effect-ripple"] = {
  init: function () {
    document.querySelectorAll(".effect-ripple").forEach((effect) => {
      let isTouching = false;

      function createRipple(e) {
        const rect = effect.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const maxX = Math.max(clientX - rect.left, rect.right - clientX);
        const maxY = Math.max(clientY - rect.top, rect.bottom - clientY);
        const radius = Math.sqrt(maxX ** 2 + maxY ** 2);

        const ripple = document.createElement("span");
        ripple.classList.add("ripple_effect");

        // tamanho real
        ripple.style.width = ripple.style.height = `${radius * 2}px`;
        ripple.style.left = `${clientX - rect.left - radius}px`;
        ripple.style.top = `${clientY - rect.top - radius}px`;

        // 🔥 velocidade constante (px/ms)
        const SPEED = 1; // ajuste fino aqui (quanto maior, mais rápido)
        const duration = radius / SPEED;

        ripple.style.setProperty("--ripple-duration", `${duration}ms`);

        effect.appendChild(ripple);

        // força reflow para iniciar animação corretamente
        ripple.offsetHeight;

        ripple.classList.add("ripple-animate");

        function removeRipple() {
          ripple.classList.add("ripple-fade");

          // remove só depois da animação terminar
          const fadeDuration = 600; // igual ao CSS
          setTimeout(() => {
            ripple.remove();
          }, fadeDuration);
        }

        effect.addEventListener("mouseup", removeRipple, { once: true });
        effect.addEventListener("mouseleave", removeRipple, { once: true });
        effect.addEventListener("touchend", removeRipple, { once: true });
        effect.addEventListener("touchcancel", removeRipple, { once: true });
      }

      effect.addEventListener(
        "touchstart",
        (e) => {
          isTouching = true;
          createRipple(e);
        },
        { passive: true },
      );

      effect.addEventListener("mousedown", (e) => {
        if (isTouching) return;
        createRipple(e);
      });

      effect.addEventListener("click", () => {
        setTimeout(() => (isTouching = false), 300);
      });
    });
  },
};
