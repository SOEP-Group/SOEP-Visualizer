import { subscribe } from "../eventBuss.js";
import { glState } from "../gl/index.js";
import { fetchSatellite } from "../api/satellites.js";
import { satellites } from "../gl/scene.js";

const popupContainer = document.getElementById("popup-container");
const closeBtn = document.getElementById("close-popup");
const skeleton = document.getElementById("popup-skeleton");
const content = document.getElementById("popup-content");
const mobileContent = document.getElementById("popup-content-mobile");
const toggleArrow = document.getElementById("toggle-arrow");
const arrowIcon = document.getElementById("arrow-icon");

let popupOpen = false;

function onGlStateChanged(changedStates) {
  if (changedStates["clickedSatellite"]) {
    const clicked_satellite = glState.get("clickedSatellite");
    if (clicked_satellite !== undefined && clicked_satellite !== null) {
      openPopup();
      getContent(satellites.getIdByInstanceId(clicked_satellite));
    } else {
      closePopup();
    }
  }
}

function onRendererUpdate() {
  if (popupOpen) {
    const speed_visual = document.getElementById("satellite_speed_visualizer");
    const long_visual = document.getElementById("satellite_long_visualizer");
    const lat_visual = document.getElementById("satellite_lat_visualizer");
    // Only really need to check one of them
    if (speed_visual) {
      const clicked_satellite = glState.get("clickedSatellite");
      if (clicked_satellite !== undefined && clicked_satellite !== null) {
        const speed = satellites.getSpeed(clicked_satellite);
        const location = satellites.getGeodeticCoordinates(clicked_satellite);
        const single_speed = Math.sqrt(
          Math.pow(speed.x, 2) + Math.pow(speed.y, 2) + Math.pow(speed.z, 2)
        );
        speed_visual.innerHTML = `${single_speed.toFixed(3)}km/s`;
        long_visual.innerHTML = `${location.long.toFixed(2)}°`;
        lat_visual.innerHTML = `${location.lat.toFixed(2)}°`;
      }
    }
  }
}

function openPopup() {
  popupContainer.classList.remove("translate-x-full", "right-[-100%]");
  popupContainer.classList.add("translate-x-0", "right-5");
  content.classList.add("hidden");
  skeleton.classList.remove("hidden");
  popupOpen = true;
}

function getContent(satellite) {
  // mobileContent.innerHTML = "";
  fetchSatellite(satellite).then((res) => {
    content.classList.remove("hidden");
    skeleton.classList.add("hidden");
    content.innerHTML = res;
    // mobileContent.innerHTML = res;
  });
}

function closePopup() {
  popupOpen = false;
  popupContainer.classList.add("translate-x-full", "right-[-100%]");
  popupContainer.classList.remove("translate-x-0", "right-5");
}

function togglePopupSize() {
  popupContainer.classList.toggle("h-[95%]"); // extend the height
  arrowIcon.classList.toggle("rotate-180");
}

export function initPopup() {
  subscribe("glStateChanged", onGlStateChanged);
  subscribe("rendererUpdate", onRendererUpdate);
  closeBtn.addEventListener("click", (event) => {
    glState.set({ clickedSatellite: undefined });
  });

  toggleArrow.addEventListener("click", togglePopupSize);
}

function confirmOpenLink(event, url) {
  event.preventDefault();

  const userConfirmed = confirm(
    "Are you sure you want to open this link in a new tab?"
  );

  if (userConfirmed) {
    window.open(url, "_blank");
  }
}
