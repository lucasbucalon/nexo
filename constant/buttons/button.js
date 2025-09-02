//  Botão com Efeito Ripple
document.querySelectorAll(".ripple-button").forEach((button) => {
  let isRippling = false;

  ["mousedown", "touchstart"].forEach((evt) => {
    button.addEventListener(evt, function (e) {
      if (isRippling) return;
      isRippling = true;

      const rect = button.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const maxX = Math.max(clientX - rect.left, rect.right - clientX);
      const maxY = Math.max(clientY - rect.top, rect.bottom - clientY);
      const radius = Math.sqrt(maxX ** 2 + maxY ** 2);

      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      ripple.style.width = ripple.style.height = `${radius * 2}px`;
      ripple.style.left = `${clientX - rect.left - radius}px`;
      ripple.style.top = `${clientY - rect.top - radius}px`;

      button.querySelectorAll(".ripple").forEach((r) => r.remove());
      button.appendChild(ripple);

      function removeRipple() {
        ripple.classList.add("fade-out");
        setTimeout(() => ripple.remove(), 300);
        isRippling = false;
      }

      button.addEventListener("mouseup", removeRipple, { once: true });
      button.addEventListener("mouseleave", removeRipple, { once: true });
      button.addEventListener("touchend", removeRipple, { once: true });
      button.addEventListener("touchcancel", removeRipple, { once: true });
    });
  });
});
