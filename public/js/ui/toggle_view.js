import { subscribe } from "../eventBuss.js";
import { camera, glState } from "../gl/index.js";
import { satellites, earth } from "../gl/scene.js";

const earthView = document.getElementById("earth-view-button");
const satelliteView = document.getElementById("satellite-view-button");
const viewport = document.getElementById("gl_viewport");

let toggledSatellite = false;

export function initToggleView() {
  subscribe("glStateChanged", onGlStateChanged);

  earthView.addEventListener("click", (event) => {
    event.stopPropagation();
    glState.set({
      focusedTarget: { target: earth.getGroup().id },
    });
  });
  satelliteView.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!toggledSatellite) {
      return;
    }
    glState.set({
      focusedTarget: {
        target: satellites.getGroup().id,
        instanceIndex: glState.get("clickedSatellite"),
      },
    });
  });

  viewport.addEventListener("keydown", keyboardToggle);
}

function keyboardToggle(event) {
  const isShiftV = event.shiftKey && event.key.toLowerCase() === "v";
  if (isShiftV) {
    event.preventDefault();

    toggleView();
  }
}

function toggleView() {
  const currentTarget = glState.get("focusedTarget").target;
  if (currentTarget === earth.getGroup().id) {
    if (toggledSatellite) {
      glState.set({
        focusedTarget: {
          target: satellites.getGroup().id,
          instanceIndex: glState.get("clickedSatellite"),
        },
      });
    }
  } else {
    glState.set({
      focusedTarget: { target: earth.getGroup().id },
    });
  }
}

function updateViewButtons(selectedView) {
  earthView.classList.remove("bg-teal-500", "pointer-events-none");
  satelliteView.classList.remove("bg-teal-500", "pointer-events-none");

  if (selectedView.target === earth.getGroup().id) {
    earthView.classList.add("bg-teal-500", "pointer-events-none");
  } else if (selectedView.target === satellites.getGroup().id) {
    satelliteView.classList.add("bg-teal-500", "pointer-events-none");
    earthView.classList.add("bg-black");
  }
}

function onGlStateChanged(changedStates) {
  if (changedStates["focusedTarget"]) {
    const selectedView = glState.get("focusedTarget");
    updateViewButtons(selectedView);
  }

  if (changedStates["clickedSatellite"]) {
    let clickedSatellite = glState.get("clickedSatellite");

    if (!clickedSatellite) {
      toggledSatellite = false;
    } else {
      toggledSatellite = true;
    }
  }

  if (!toggledSatellite) {
    satelliteView.classList.add("cursor-not-allowed");
  } else {
    satelliteView.classList.remove("cursor-not-allowed");
  }
}
