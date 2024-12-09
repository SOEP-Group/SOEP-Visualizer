import { subscribe } from "../eventBuss.js";
import { camera, glState } from "../gl/index.js";
import { satellites } from "../gl/scene.js";

const earthView = document.getElementById("earth-view-button");
const satelliteView = document.getElementById("satellite-view-button");

let toggledSatellite = null;

export function initToggleView() {
    subscribe("glStateChanged", onGlStateChanged);

    earthView.addEventListener("click", () => toggleView("earth"));
    satelliteView.addEventListener("click", () => toggleView("satellite"));

    changeView("earth");
}

function toggleView(view) {
    const currentView = glState.get("selectedView");

    if (view === "earth" && currentView !== "earth") {
        changeView("earth");
    }
    else if (view === "satellite" && currentView !== "satellite") {
        if (!toggledSatellite) {
            alert("No satellite selected");
        }
        changeView("satellite");
    }
}

function changeView(view) {
    if (glState.get("selectedView") === view) return;
    glState.set({ selectedView: view });
    updateViewButtons(view);
    switchView(view);
}

function updateViewButtons(selectedView) {
    earthView.classList.remove("bg-teal-500", "pointer-events-none");
    satelliteView.classList.remove("bg-teal-500", "pointer-events-none");

    if (selectedView === "earth") {
        earthView.classList.add("bg-teal-500", "pointer-events-none");
    } else if (selectedView === "satellite") {
        satelliteView.classList.add("bg-teal-500", "pointer-events-none");
    }
}

function switchView(view) {
    if (view === "earth") {
        console.log("Switching to Earth view...");

        const earthPosition = { x: 0, y: 0, z: 0 };
        camera.position.set(earthPosition.x, earthPosition.y, earthPosition.z);
    }
    else if (view === "satellite" && toggledSatellite) {
        console.log("Switching to Satellite view...");

        const satellite = satellites.get(toggledSatellite);

        camera.position.set(satellite.position.x, satellite.position.y, satellite.position.z);

    }
}

function onGlStateChanged(changedStates) {
    if (changedStates["selectedView"]) {
        const selectedView = glState.get("selectedView");
        updateViewButtons(selectedView);
        switchView(selectedView);
    }

    if (changedStates["clickedSatellite"]) {
        const clickedSatellite = glState.get("clickedSatellite");
        if (clickedSatellite) {
            toggledSatellite = clickedSatellite;

            if (glState.get("selectedView") !== "satellite") {
                changeView("satellite");
            }
        } else {
            toggledSatellite = null;
            if (glState.get("selectedView") !== "earth") {
                changeView("earth");
            }
        }
    }
}
