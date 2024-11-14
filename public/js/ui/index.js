import { subscribe } from "../eventBuss.js";
import { State } from "../globalState.js";
import { initSettings } from "./settings.js";
import { initHeader } from "./header.js";
import { initPredictions } from "./predictions.js";
import { initPopup } from "./popup.js";
import { glState } from "../gl/index.js";
import { initOrbit } from "../gl/orbit.js";

export * from "./settings.js";
export * from "./header.js";
export * from "./predictions.js";
export * from "./popup.js";

subscribe("appStartup", onStart);
// subscribe("glStateChanged", onGlStateChanged);
// const satellite_default = document.getElementById("satellite-info-default");
// const satellite_content = document.getElementById("satellite-info-content");
const satellite_mobile_revert = document.getElementById("mobile-popup-revert");

function onStart() {
  initHeader();
  initSettings();
  initPredictions();
  initPopup();
  initOrbit();

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

  satellite_mobile_revert.addEventListener("click", (event) => {
    glState.set({ clickedSatellite: undefined });
  });
}

const initialUIState = { currentGraphics: undefined };

export const uiState = new State("uiStateChanged", initialUIState);

// function onGlStateChanged(changedStates) {
//   if (changedStates["clickedSatellite"]) {
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
