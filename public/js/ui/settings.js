import { graphicalSettings } from "../gl/renderer.js";
import { subscribe } from "../eventBuss.js";
import { glState } from "../gl/index.js";
import { uiState } from "./index.js";

export function initSettings() {
  subscribe("glStateChanged", onGlStateChanged);
  subscribe("uiStateChanged", onUiStateChanged);
  let settings = {};
  const cachedSettings = localStorage.getItem("settings");
  let hasCache = false;
  if (cachedSettings) {
    settings = JSON.parse(cachedSettings);
    hasCache = true;
  }
  const graphicsSelectElement = document.getElementById("graphics-settings");
  uiState.set({ ...settings });
  graphicsSelectElement.addEventListener("change", (event) => {
    glState.set({ currentGraphics: graphicalSettings[event.target.value] });
  });

  document
    .getElementById("settings-save")
    .addEventListener("click", (event) => {
      cacheSettings();
    });
  initStates(settings);
  if (!hasCache) {
    cacheSettings();
  }

  updateSettings();
}

function initStates(settings) {
  if ("currentGraphics" in settings) {
    glState.set({ currentGraphics: settings.currentGraphics });
  }
}

function onGlStateChanged(changedStates) {
  if (changedStates["currentGraphics"]) {
    uiState.set({ currentGraphics: glState.get("currentGraphics") });
  }
}

function onUiStateChanged(changedStates) {
  if (changedStates["currentGraphics"]) {
    updateSettings();
  }
}

function updateSettings() {
  // Graphics
  const selectElement = document.getElementById("graphics-settings");
  selectElement.innerHTML = "";

  for (const [key, settings] of Object.entries(graphicalSettings)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = settings.tag;
    selectElement.appendChild(option);
  }

  selectElement.value = Object.keys(graphicalSettings).find(
    (key) => graphicalSettings[key].tag === glState.get("currentGraphics").tag
  );
}

function cacheSettings() {
  const settings = {};
  if (uiState.get("currentGraphics")) {
    settings.currentGraphics = uiState.get("currentGraphics");
  }
  localStorage.setItem("settings", JSON.stringify(settings));
}
