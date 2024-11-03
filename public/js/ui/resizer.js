// I'll be honest, i've no idea what this is supposed to do

var resizer = document.querySelector(".resizer");

function initResizerFn(resizer, sidebar) {
  var x, w;

  function rs_mousedownHandler(e) {
    x = e.clientX;
    var sbWidth = window.getComputedStyle(sidebar).width;
    w = parseInt(sbWidth, 10);

    document.addEventListener("mousemove", rs_mousemoveHandler);
    document.addEventListener("mouseup", rs_mouseupHandler);
  }

  function rs_mousemoveHandler(e) {
    var dx = e.clientX - x;
    var cw = w + dx;

    if (cw > MIN_WIDTH) {
      sidebar.style.width = `${cw}px`;
      lastWidth = cw;
    } else {
      sidebar.style.width = `${MIN_WIDTH}px`;
      lastWidth = MIN_WIDTH;
    }
  }

  function rs_mouseupHandler() {
    document.removeEventListener("mouseup", rs_mouseupHandler);
    document.removeEventListener("mousemove", rs_mousemoveHandler);
  }

  resizer.addEventListener("mousedown", rs_mousedownHandler);
}

initResizerFn(resizer, sideWindow);
