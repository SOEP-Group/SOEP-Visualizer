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

function openPopup() {
  popupContainer.classList.remove("translate-x-full", "right-[-100%]");
  popupContainer.classList.add("translate-x-0", "right-5");
  content.classList.add("hidden");
  skeleton.classList.remove("hidden");
}

function getContent(satellite) {
  mobileContent.innerHTML = "";
  fetchSatellite(satellite).then((res) => {
    content.classList.remove("hidden");
    skeleton.classList.add("hidden");
    content.innerHTML = res;
    mobileContent.innerHTML = res;
  });
}

function closePopup() {
  popupContainer.classList.add("translate-x-full", "right-[-100%]");
  popupContainer.classList.remove("translate-x-0", "right-5");
}

function togglePopupSize() {
  popupContainer.classList.toggle("h-5/6"); // extend the height
  arrowIcon.classList.toggle("rotate-180");
}

export function initPopup() {
  subscribe("glStateChanged", onGlStateChanged);
  closeBtn.addEventListener("click", (event) => {
    glState.set({ clickedSatellite: undefined });
  });

  toggleArrow.addEventListener("click", togglePopupSize);
}
