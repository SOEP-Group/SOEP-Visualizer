export function initResizer() {
  const resizer = document.querySelector(".resizer");
  const sidebar = document.getElementById("ham_menu");
  const MIN_WIDTH = window.innerWidth * 0.30;
  const MAX_WIDTH = window.innerWidth * 0.95;

  if (resizer && sidebar) {
    let x = 0, w = 0;

    resizer.addEventListener("mousedown", function (e) {
      x = e.clientX;
      const sbWidth = window.getComputedStyle(sidebar).width;
      w = parseInt(sbWidth, 10);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });

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

    function mouseUpHandler() {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    }
  } else {
    console.error("Resizer or sidebar element not found.");
  }
}
