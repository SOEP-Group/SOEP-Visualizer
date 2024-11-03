document.addEventListener("click", function (event) {
  const button = event.target.closest('[data-ripple="true"]');
  if (button) {
    createRipple(event, button);
  }
});

function createRipple(event, button) {
  const existingRipples = document.getElementsByClassName("ripple");
  while (existingRipples.length > 0) {
    existingRipples[0].remove();
  }

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left - radius;
  const y = event.clientY - rect.top - radius;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.style.pointerEvents = "none";
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];

  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}
