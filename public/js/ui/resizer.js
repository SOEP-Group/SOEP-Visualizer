export function initResizer() {
  const resizer = document.querySelector(".resizer");
  const sidebar = document.getElementById("ham_menu");
  const MIN_WIDTH = window.innerWidth * 0.3;
  const MAX_WIDTH = window.innerWidth * 0.95;
  const overlay = document.getElementById("resizer_overlay");

  if (resizer && sidebar) {
    let x = 0,
      w = 0;

    function showResizer() {
      if (!sidebar.classList.contains("-translate-x-full")) {
        resizer.classList.remove("hidden");
      }
    }

    function hideResizer() {
      if (sidebar.classList.contains("-translate-x-full")) {
        resizer.classList.add("hidden");
      }
    }

    hideResizer();

    resizer.addEventListener("mousedown", function (e) {
      e.stopPropagation();
      x = e.clientX;
      const sbWidth = window.getComputedStyle(sidebar).width;
      w = parseInt(sbWidth, 10);

      overlay.classList.remove("hidden");
      overlay.addEventListener("mousemove", mouseMoveHandler);
      overlay.addEventListener("mouseup", mouseUpHandler);
    });
    function mouseUpHandler(e) {
      e.stopPropagation();
      overlay.removeEventListener("mousemove", mouseMoveHandler);
      overlay.removeEventListener("mouseup", mouseUpHandler);
      overlay.classList.add("hidden");
    }

    function mouseMoveHandler(e) {
      const dx = e.clientX - x;
      let cw = w + dx;

      if (cw < MIN_WIDTH) {
        cw = MIN_WIDTH;
      }

      if (cw > MAX_WIDTH) {
        cw = MAX_WIDTH;
      }

      sidebar.style.width = `${cw}px`;
    }

    const toggleButton = document.getElementById("resize");
    toggleButton.addEventListener("click", function () {
      if (sidebar.classList.contains("translate-x-0")) {
        hideResizer();
      } else {
        showResizer();
      }
    });

    sidebar.addEventListener("transitionend", function () {
      if (sidebar.classList.contains("translate-x-0")) {
        showResizer();
      } else {
        hideResizer();
      }
    });
  } else {
    console.error("Resizer or sidebar element not found.");
  }
}
