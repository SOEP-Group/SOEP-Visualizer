import { glState } from "../gl/index.js";
import { subscribe } from "../eventBuss.js";
import { displayOrbit, satellites, stopDisplayingOrbit } from "../gl/scene.js";


export function initOrbit() {
    subscribe("glStateChanged", onGlStateChanged);
  }
  
function onGlStateChanged(changedStates) {
if (changedStates["clickedSatellite"]) {
    const clicked_satellite = glState.get("clickedSatellite");
    if (clicked_satellite !== undefined && clicked_satellite !== null) {
    displayOrbit(satellites.getIdByInstanceId(clicked_satellite));
    } else {
    stopDisplayingOrbit()
    }
}
}