import { subscribe } from "../eventBuss.js";
import { State } from "../globalState.js";
import { initSettings } from "./settings.js";
import { initHeader } from "./header.js";
import { initPredictions } from "./predictions.js";
import { initEvents } from "./events.js";
import { initResizer } from "./resizer.js";
import { initPopup } from "./popup.js";
import { initToggleView } from "./toggle_view.js";
import { glState } from "../gl/index.js";
import { initOrbit } from "../gl/orbit.js";
import { satellites } from "../gl/scene.js";
import { initGraphs } from "./graphs.js";

export * from "./settings.js";
export * from "./header.js";
export * from "./resizer.js";
export * from "./predictions.js";
export * from "./events.js";
export * from "./popup.js";
export * from "./toggle_view.js";

const hoverTooltip = document.getElementById("hover-tooltip");

function hideTooltip() {
  hoverTooltip.classList.add("hidden");
}

subscribe("glStateChanged", (prevState) => {
  if ("clickedSatellite" in prevState) {
    hideTooltip();
  }
});

subscribe("hoveredSatellite", ({ instanceId, mouseX, mouseY }) => {
  if (instanceId === -1) {
    hideTooltip();
  } else {
    const satData = satellites.instanceIdToDataMap[instanceId];

    if (satData && satData.name) {
      hoverTooltip.innerHTML = `<strong>${satData.name}</strong>`;
    } else {
      hoverTooltip.innerHTML = "Unknown Satellite";
    }

    hoverTooltip.style.left = `${mouseX + 10}px`;
    hoverTooltip.style.top = `${mouseY + 10}px`;
    hoverTooltip.classList.remove("hidden");
  }
});

document.addEventListener("touchstart", hideTooltip);

subscribe("appStartup", onStart);
// subscribe("glStateChanged", onGlStateChanged);
// const satellite_default = document.getElementById("satellite-info-default");
// const satellite_content = document.getElementById("satellite-info-content");
// const satellite_mobile_revert = document.getElementById("mobile-popup-revert");

function onStart() {
  initHeader();
  initSettings();
  initPredictions();
  initEvents();
  initResizer();
  initPopup();
  initOrbit();
  initToggleView();
  initGraphs();

  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active-tab"));
      panels.forEach((p) => p.classList.remove("active-panel"));
      tab.classList.add("active-tab");
      panels[index].classList.add("active-panel");
    });
  });

  // satellite_mobile_revert.addEventListener("click", (event) => {
  //   glState.set({ clickedSatellite: undefined });
  // });
}

const initialUIState = { currentGraphics: undefined };

export const uiState = new State("uiStateChanged", initialUIState);

// function onGlStateChanged(prevState) {
//   if ("clickedSatellite" in prevState) {
//     const clicked_satellite = glState.get("clickedSatellite");
//     if (clicked_satellite === undefined || clicked_satellite === null) {
//       satellite_default.classList.remove("hidden");
//       satellite_content.classList.add("hidden");
//       satellite_mobile_revert.classList.remove("translate-y-0");
//       satellite_mobile_revert.classList.add("translate-y-full");
//     } else {
//       satellite_default.classList.add("hidden");
//       satellite_content.classList.remove("hidden");
//       satellite_mobile_revert.classList.add("translate-y-0");
//       satellite_mobile_revert.classList.remove("translate-y-full");
//     }
//   }
// }
