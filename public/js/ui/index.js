import { subscribe } from "../eventBuss.js"; 
import { State } from "../globalState.js";
import { initSettings } from "./settings.js";
import { initHeader } from "./header.js";
import { initPredictions } from "./predictions.js";
import { initResizer } from "./resizer.js";
import { initPopup } from "./popup.js";
import { glState } from "../gl/index.js";
import { initOrbit } from "../gl/orbit.js";
import { satellites } from "../gl/scene.js";
import { initGraphs } from "./graphs.js";

export * from "./settings.js";
export * from "./header.js";
export * from "./resizer.js";
export * from "./predictions.js";
export * from "./popup.js";

const hoverTooltip = document.getElementById("hover-tooltip");
const satelliteInputField = document.getElementById("satellite-pass");

// Subscribe to show tooltip on hovered satellite
subscribe("hoveredSatellite", ({ instanceId, mouseX, mouseY }) => {
  if (instanceId === -1) {
    hoverTooltip.classList.add("hidden");
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

// Subscribe to app startup
subscribe("appStartup", onStart);

/**
 * Initialize the app on startup
 */
function onStart() {
  initHeader();
  initSettings();
  initPredictions();
  initResizer();
  initPopup();
  initOrbit();
  initGraphs();

  setupTabNavigation();
  setupSatelliteSelection();
}

/**
 * Setup tab navigation behavior
 */
function setupTabNavigation() {
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
}

/**
 * Setup functionality for "Choose Satellite" button
 */
function setupSatelliteSelection() {
  const chooseSatelliteButton = document.querySelector('.select-satellite-button');
  
  if (!chooseSatelliteButton) return;

  chooseSatelliteButton.addEventListener("click", () => {
    globalState.set({ pickingSatellite: true }); // Enable satellite selection mode
    console.log("Satellite selection mode activated");

    document.addEventListener("click", onSatelliteClick);
  });

  function onSatelliteClick(event) {
    const mouse = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };

    const clickedSatelliteId = satellites.checkForClick(mouse, glState.get("camera"));
    if (clickedSatelliteId !== null && globalState.get("pickingSatellite")) {
      const satelliteName = satellites.instanceIdToDataMap[clickedSatelliteId].name;

      if (satelliteInputField && satelliteName) {
        satelliteInputField.value = satelliteName;
      }

      globalState.set({ pickingSatellite: false }); // Disable selection mode
      console.log(`Satellite selected: ${satelliteName}`);
      
      // Clean up the event listener once selection is complete
      document.removeEventListener("click", onSatelliteClick);
    }
  }
}

const initialUIState = { currentGraphics: undefined };
export const uiState = new State("uiStateChanged", initialUIState);
