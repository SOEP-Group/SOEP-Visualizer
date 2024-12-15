import { subscribe } from "../eventBuss.js";
import { glState } from "./index.js";

export function initDebug() {
  subscribe("glStateChanged", updateDebugMenu);
}

function updateDebugMenu(prevState) {
  if (!("rendererInfo" in prevState)) {
    return;
  }
  const rendererInfo = glState.get("rendererInfo");
  const fpsCounter = document.getElementById("debug-ui-fps-counter");
  if (fpsCounter) {
    fpsCounter.innerText = `FPS: ${rendererInfo.fps}`;
  }

  const gpuInfoText = `
        - Card: ${rendererInfo.gpuContext.card || "Unknown"}<br>
        - Manufacturer: ${rendererInfo.gpuContext.manufacturer || "Unknown"}<br>
        - Integrated: ${rendererInfo.gpuContext.integrated ? "Yes" : "No"}<br>
        - Vendor: ${rendererInfo.gpuContext.vendor || "Unknown"}<br>
        - Renderer: ${rendererInfo.gpuContext.renderer || "Unknown"}<br>
        - Max Texture Size: ${
          rendererInfo.gpuContext.maxTextureSize || "Unknown"
        }<br>
        - Score: ${rendererInfo.gpuContext.score || "Unknown"}<br>
        - Graphical Preset: ${
          rendererInfo.gpuContext.graphicalPreset || "Unknown"
        }<br>
        - Hardware Accelerated: ${
          rendererInfo.gpuContext.isHardwareAccelerated ? "Yes" : "No"
        }
    `;
  const gpuInfo = document.getElementById("debug-ui-gpu-info");
  if (gpuInfo) {
    gpuInfo.innerHTML = gpuInfoText;
  }
  const rendererRealTimeDump = glState.get("realTimeDump");
  const rendererInfoTag = document.getElementById("debug-ui-renderer-info");
  if (rendererInfoTag && rendererRealTimeDump) {
    const rendererInfoText = `
        - Draw Calls: ${rendererRealTimeDump.render.calls || 0}<br>
        - Geometries: ${rendererRealTimeDump.memory.geometries || 0}<br>
        - Textures: ${rendererRealTimeDump.memory.textures || 0}<br>
        - Programs: ${rendererRealTimeDump.programs?.length || 0}
    `;
    rendererInfoTag.innerHTML = rendererInfoText;
  }
}
