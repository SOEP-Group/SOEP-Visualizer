import { subscribe } from "../eventBuss.js";
import { glState } from "../gl/index.js";
import { fetchSatellite } from "../api/satellites.js";
import { satellites } from "../gl/scene.js";

const popupContainer = document.getElementById("popup-container");
const closeBtn = document.getElementById("close-popup");
const skeleton = document.getElementById("popup-skeleton");
const content = document.getElementById("popup-content");
const toggleArrow = document.getElementById("toggle-arrow");
const arrowIcon = document.getElementById("arrow-icon");

// Mobile Popup
const mobilePopupContainer = document.getElementById("mobile-popup-container");
const mobileContent = document.getElementById("mobile-popup-content");
const mobileExtendArrow = document.getElementById("mobile-toggle-arrow");
const mobileCloseButton = document.getElementById("mobile-close-popup");
const mobileSkeleton = document.getElementById("mobile-popup-skeleton");
const mobileArrowIcon = document.getElementById("mobile-arrow-icon");

function onGlStateChanged(changedStates) {
  if (changedStates["clickedSatellite"]) {
    const clicked_satellite = glState.get("clickedSatellite");
    if (clicked_satellite !== undefined && clicked_satellite !== null) {
      openPopup();
      openMobilePopup();
      getContent(satellites.getIdByInstanceId(clicked_satellite));
    } else {
      closePopup();
      closeMobilePopup();
    }
  }
}

export function initPopup() {
  subscribe("glStateChanged", onGlStateChanged);
  closeBtn.addEventListener("click", (event) => {
    glState.set({ clickedSatellite: undefined });
  });

  toggleArrow.addEventListener("click", togglePopupSize);

  mobileCloseButton.addEventListener("click", () => {
    glState.set({ clickedSatellite: undefined });
    closeMobilePopup();
  });
  mobileExtendArrow.addEventListener("click", toggleMobilePopupSize);
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
    mobileContent.classList.remove("hidden");
    mobileSkeleton.classList.add("hidden");
    mobileContent.innerHTML = res;
  });
}

function closePopup() {
  popupContainer.classList.add("translate-x-full", "right-[-100%]");
  popupContainer.classList.remove("translate-x-0", "right-5");
}

function togglePopupSize() {
  popupContainer.classList.toggle("h-[95%]"); // extend the height
  arrowIcon.classList.toggle("rotate-180");
}



function confirmOpenLink(event, url) {
  event.preventDefault();

  const userConfirmed = confirm("Are you sure you want to open this link in a new tab?");

  if (userConfirmed) {
    window.open(url, "_blank");
  }
}

// Mobile Popup Functions
function openMobilePopup() {
  mobilePopupContainer.classList.remove("translate-y-full", "bottom-[-100%]");
  mobilePopupContainer.classList.add("translate-y-0", "bottom-0");
  mobileContent.classList.add("hidden");
  mobileSkeleton.classList.remove("hidden");
}

function closeMobilePopup() {
  mobilePopupContainer.classList.add("translate-y-full", "bottom-[-100%]");
  mobilePopupContainer.classList.remove("translate-y-0", "bottom-0");
}

function toggleMobilePopupSize() {
  mobilePopupContainer.classList.toggle("h-[95%]");
  mobileArrowIcon.classList.toggle("rotate-180");
}
