// burger menu

import { fetchEvents } from "../api/events.js";
import { getLocation } from "./utils.js";

const dropdownButton = document.getElementById("menu__toggle");
const dropdownMenu = document.getElementById("ham_menu");

const eventsButton = document.getElementById("events-button");
const eventsTab = document.getElementById("events-tab");
const eventsContent = document.querySelector(".tab-content .tab-panel");

const predictionButton = document.getElementById("prediction-button");
const predictionTab = document.getElementById("prediction-tab-icon");

let firstMenuOpen = true;

let userLatitude = null;
let userLongitude = null;

export function initHeader() {
  const satelliteDropdown = document.getElementById("satellite-dropdown");

  const searchInput = document.getElementById("satellite-search");

  searchInput.addEventListener("keyup", function () {
    const filter = searchInput.value.toUpperCase();
    const satelliteLinks = satelliteDropdown.getElementsByTagName("a");

    for (let i = 0; i < satelliteLinks.length; i++) {
      const txtValue =
        satelliteLinks[i].textContent || satelliteLinks[i].innerText;

      if (txtValue.toUpperCase().startsWith(filter)) {
        satelliteLinks[i].style.display = ""; // show matching item
      } else {
        satelliteLinks[i].style.display = "none"; // hide non-matching item
      }
    }
  });

  dropdownButton.addEventListener("click", function () {
    const menuClosed = dropdownMenu.classList.contains("-translate-x-full");
    if (menuClosed) {
      return openMenu();
    }
    closeMenu();
  });

  eventsButton.addEventListener("click", function () {
    openMenu();
    eventsTab.click();
  });

  predictionButton.addEventListener("click", function () {
    openMenu();
    predictionTab.click();
  });

  eventsTab.addEventListener("click", function () {
    openMenu();
    predictionTab.click();
  });

  eventsTab.addEventListener("click", async () => {
    eventsContent.innerHTML = "<p>Loading events...</p>";

    // getLocation(null, (latitude, longitude) => {
    //   if (latitude && longitude) {
    //     userLatitude = latitude;
    //     userLongitude = longitude;
    //   } else {
    //     console.warn("Unable to retrieve user location.");
    //   }
    // });

    // console.log("long and lat", userLatitude, userLongitude);

    const location = await getLocation(null);
    userLatitude = location.latitude;
    userLongitude = location.longitude;

    console.log("long and lat", userLatitude, userLongitude);
  
    const [sunEvents, moonEvents] = await Promise.all([
      fetchEvents("sun", userLatitude || 37.7749, userLongitude || -122.4194),
      fetchEvents("moon", userLatitude || 37.7749, userLongitude || -122.4194),
    ]);
  
    if (!sunEvents || sunEvents.length === 0) {
      eventsContent.innerHTML = "<p>No Sun events found.</p>";
      return;
    }
  
    if (!moonEvents || moonEvents.length === 0) {
      eventsContent.innerHTML = "<p>No Moon events found.</p>";
      return;
    }
  
    // Sun
    const sunEvent = sunEvents.table.rows[0].cells[0];
    const { eventHighlights: sunHighlights, rise: sunRise, set: sunSet, extraInfo: sunExtraInfo } = sunEvent;
    const { partialStart: sunPartialStart, peak: sunPeak, partialEnd: sunPartialEnd } = sunHighlights;
  
    const sunContentHTML = `
      <div class="event-details">
        <h2>Sun Events</h2>
        <ul>
          <li><strong>Event Type:</strong> Partial Solar Eclipse</li>
          <li><strong>Partial Start:</strong> ${new Date(sunPartialStart.date).toLocaleString()} (Altitude: ${sunPartialStart.altitude}°)</li>
          <li><strong>Peak:</strong> ${new Date(sunPeak.date).toLocaleString()} (Altitude: ${sunPeak.altitude}°)</li>
          <li><strong>Partial End:</strong> ${new Date(sunPartialEnd.date).toLocaleString()} (Altitude: ${sunPartialEnd.altitude}°)</li>
          <li><strong>Sunrise:</strong> ${new Date(sunRise).toLocaleTimeString()}</li>
          <li><strong>Sunset:</strong> ${new Date(sunSet).toLocaleTimeString()}</li>
          <li><strong>Obscuration:</strong> ${(sunExtraInfo.obscuration * 100).toFixed(2)}%</li>
        </ul>
      </div>
    `;
  
    // Moon
    const moonEvent = moonEvents.table.rows[0].cells[0];
    const { eventHighlights: moonHighlights, rise: moonRise, set: moonSet, extraInfo: moonExtraInfo } = moonEvent;
    const { partialStart: moonPartialStart, peak: moonPeak, partialEnd: moonPartialEnd } = moonHighlights;
  
    const moonContentHTML = `
      <div class="event-details">
        <h2>Moon Events</h2>
        <ul>
          <li><strong>Event Type:</strong> Partial Lunar Eclipse</li>
          <li><strong>Partial Start:</strong> ${new Date(moonPartialStart.date).toLocaleString()} (Altitude: ${moonPartialStart.altitude}°)</li>
          <li><strong>Peak:</strong> ${new Date(moonPeak.date).toLocaleString()} (Altitude: ${moonPeak.altitude}°)</li>
          <li><strong>Partial End:</strong> ${new Date(moonPartialEnd.date).toLocaleString()} (Altitude: ${moonPartialEnd.altitude}°)</li>
          <li><strong>Moonrise:</strong> ${new Date(moonRise).toLocaleTimeString()}</li>
          <li><strong>Moonset:</strong> ${new Date(moonSet).toLocaleTimeString()}</li>
          <li><strong>Obscuration:</strong> ${(moonExtraInfo.obscuration * 100).toFixed(2)}%</li>
        </ul>
      </div>
    `;
  
    eventsContent.innerHTML = sunContentHTML + moonContentHTML;
  });
  
  

  // document.addEventListener("click", function (event) {
  //   if (
  //     !dropdownButton.contains(event.target) &&
  //     !dropdownMenu.contains(event.target)
  //   ) {
  //     closeMenu();
  //   }
  // });

  // document
  //   .getElementById("settings-modal-close")
  //   .addEventListener("click", function (event) {
  //     document.getElementById("settings-modal").classList.add("hidden");
  //   });
}

function openMenu() {
  dropdownMenu.classList.remove("-translate-x-full");
  dropdownMenu.classList.add("translate-x-0");
  dropdownButton.classList.add("tham-active");
  if (firstMenuOpen) {
    eventsTab.click();
    firstMenuOpen = false
  }
}

function closeMenu() {
  dropdownMenu.classList.remove("translate-x-0");
  dropdownButton.classList.remove("tham-active");
  dropdownMenu.classList.add("-translate-x-full");
}
