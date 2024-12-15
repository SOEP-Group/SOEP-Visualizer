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

let popupOpen = false;
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

function onRendererUpdate() {
  if (popupOpen) {
    const speed_visual = document.getElementsByClassName(
      "satellite_speed_visualizer"
    );
    const long_visual = document.getElementsByClassName(
      "satellite_long_visualizer"
    );
    const lat_visual = document.getElementsByClassName(
      "satellite_lat_visualizer"
    );
    const alt_visual = document.getElementsByClassName(
      "satellite_alt_visualizer"
    );
    // Only really need to check one of them
    if (speed_visual) {
      const clicked_satellite = glState.get("clickedSatellite");
      if (clicked_satellite !== undefined && clicked_satellite !== null) {
        for (let i = 0; i < speed_visual.length; i++) {
          const speed = satellites.getSpeed(clicked_satellite);
          const location = satellites.getGeodeticCoordinates(clicked_satellite);
          const single_speed = Math.sqrt(
            Math.pow(speed.x, 2) + Math.pow(speed.y, 2) + Math.pow(speed.z, 2)
          );
          speed_visual[i].innerHTML = `${single_speed.toFixed(3)}km/s`;
          long_visual[i].innerHTML = location.long
            ? `${location.long.toFixed(2)}°`
            : "Error";
          lat_visual[i].innerHTML = location.lat
            ? `${location.lat.toFixed(2)}°`
            : "Error";
          alt_visual[i].innerHTML = location.lat
            ? `${location.alt.toFixed(3)}km`
            : "Error";
        }
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
  mobileContent.innerHTML = "";
  fetchSatellite(satellite).then((res) => {
    content.classList.remove("hidden");
    skeleton.classList.add("hidden");
    content.innerHTML = res;
    mobileContent.classList.remove("hidden");
    mobileSkeleton.classList.add("hidden");
    mobileContent.innerHTML = res;

    const satelliteImage = document.getElementById("satellite-image");
    if (satelliteImage) {
      const satelliteImagePath = `images/satellite/${satellite}.jpg`;
      satelliteImage.src = satelliteImagePath;
      satelliteImage.alt = `Image of Satellite ${satellite}`;

      satelliteImage.onerror = () => {
        satelliteImage.src = "images/logo/logo.svg";
        satelliteImage.alt = "Default Satellite Image";
      };
    }
  });
}

function closePopup() {
  popupOpen = false;
  popupContainer.classList.add("translate-x-full", "right-[-100%]");
  popupContainer.classList.remove("translate-x-0", "right-5");
}

function togglePopupSize(event) {
  event.stopPropagation();
  popupContainer.classList.toggle("h-[95%]"); // extend the height

  if (popupContainer.classList.contains("h-[95%]")) {
    content.classList.add("popup-content-extended");
  } else {
    content.classList.remove("popup-content-extended");
  }
  arrowIcon.classList.toggle("rotate-180");
}

export function initPopup() {
  subscribe("glStateChanged", onGlStateChanged);
  subscribe("rendererUpdate", onRendererUpdate);

  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    glState.set({ clickedSatellite: undefined });
  });

  toggleArrow.addEventListener("click", togglePopupSize);

  mobileCloseButton.addEventListener("click", (event) => {
    event.stopPropagation();
    glState.set({ clickedSatellite: undefined });
    closeMobilePopup();
  });
  mobileExtendArrow.addEventListener("click", toggleMobilePopupSize);

  popupContainer.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  mobilePopupContainer.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  popupContainer.addEventListener("mousedown", (event) =>
    event.stopPropagation()
  );
  popupContainer.addEventListener("mouseup", (event) =>
    event.stopPropagation()
  );
  popupContainer.addEventListener("mousemove", (event) => {
    document.body.style.cursor = "default";
    event.stopPropagation();
  });
  mobilePopupContainer.addEventListener("mousedown", (event) =>
    event.stopPropagation()
  );
  mobilePopupContainer.addEventListener("mousemove", (event) =>
    event.stopPropagation()
  );
  mobilePopupContainer.addEventListener("mouseup", (event) =>
    event.stopPropagation()
  );
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

// Mobile Popup Functions
function openMobilePopup() {
  mobilePopupContainer.classList.remove("translate-y-full", "bottom-[-100%]");
  mobilePopupContainer.classList.add("translate-y-0", "bottom-0");
  mobileContent.classList.add("hidden");
  mobileSkeleton.classList.remove("hidden");
  popupOpen = true;
}

function closeMobilePopup() {
  mobilePopupContainer.classList.add("translate-y-full", "bottom-[-100%]");
  mobilePopupContainer.classList.remove("translate-y-0", "bottom-0");
  popupOpen = false;
}

function toggleMobilePopupSize() {
  mobilePopupContainer.classList.toggle("h-[95%]");
  mobileArrowIcon.classList.toggle("rotate-180");

  if (mobilePopupContainer.classList.contains("h-[95%]")) {
    mobileContent.classList.add("mobile-popup-content-extended");
  } else {
    mobileContent.classList.remove("mobile-popup-content-extended");
  }
}
