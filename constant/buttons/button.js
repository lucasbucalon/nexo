// Botão com Efeito Ripple Persistente

document
  .querySelector(".ripple-button")
  .addEventListener("mousedown", function (e) {
    const button = this;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    button.appendChild(ripple);

    function removeRipple() {
      ripple.classList.add("fade-out");
      setTimeout(() => ripple.remove(), 300);
      button.removeEventListener("mouseup", removeRipple);
      button.removeEventListener("mouseleave", removeRipple);
    }

    button.addEventListener("mouseup", removeRipple);
    button.addEventListener("mouseleave", removeRipple);
  });
