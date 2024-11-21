import { graphicalSettings } from "../gl/renderer.js";
import { subscribe } from "../eventBuss.js";
import { glState } from "../gl/index.js";
import { uiState } from "./index.js";

const timeZones = [
  { value: "UTC", label: "UTC" },
  { value: "local", label: "Local Time" },
  { value: "CET", label: "Central European Time (CET)" },
  { value: "CEST", label: "Central European Summer Time (CEST)" },
  { value: "EET", label: "Eastern European Time (EET)" },
  { value: "EEST", label: "Eastern European Summer Time (EEST)" },
  { value: "EST", label: "Eastern Standard Time (EST)" },
  { value: "IST", label: "India Standard Time (IST)" },
  { value: "PST", label: "Pacific Standard Time (PST)" },
];
const timeZoneDropdown = document.getElementById("time-zone-settings");

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

  timeZoneDropdown.addEventListener("change", (event) => {
    uiState.set({ currentTimeZone: event.target.value });
    cacheSettings();
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

  // Time zone
  timeZoneDropdown.innerHTML = "";

  timeZones.forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone.value;
    option.textContent = zone.label;
    timeZoneDropdown.appendChild(option);
  });

  const savedTimeZone = uiState.get("currentTimeZone") || "local"; // Default to "local"
  timeZoneDropdown.value = savedTimeZone;
}

function cacheSettings() {
  const settings = {};
  if (uiState.get("currentGraphics")) {
    settings.currentGraphics = uiState.get("currentGraphics");
  }
  if (uiState.get("currentTimeZone")) {
    settings.currentTimeZone = uiState.get("currentTimeZone");
  }
  localStorage.setItem("settings", JSON.stringify(settings));
}
