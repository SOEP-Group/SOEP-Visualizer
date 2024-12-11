import { getLocation } from "./utils.js";
import { globalState } from "../globalState.js";
import { subscribe } from "../eventBuss.js";
import { satellites } from "../gl/scene.js";
import { glState } from "../gl/index.js";

const selectLocationBtn = document.querySelectorAll(".select-location-button");

function onGlobalStateChanged(changedStates) {
  if (changedStates["pickingLocation"]) {
    const picking = globalState.get("pickingLocation");

    for (let i = 0; i < selectLocationBtn.length; i++) {
      if (!picking) {
        selectLocationBtn[i].innerText = "Select Location";
      } else {
        selectLocationBtn[i].innerText =
          "Click on earth (Press here to Cancel)";
      }
    }
  } else if (changedStates["passing_location"]) {
    const passing_location = globalState.get("passing_location");
    const toggleButton = document.getElementById("toggle-section");

    if (passing_location) {
      toggleButton.classList.remove("opacity-50");
    } else {
      toggleButton.classList.add("opacity-50");
    }

    if (passing_location !== null) {
      const grandparent_element = document.getElementById("passing-content");
      for (const child of grandparent_element.children) {
        child.getElementsByClassName(
          "location-field"
        )[0].value = `${passing_location.lat}, ${passing_location.long}`;
        break;
      }
    }
  } else if (changedStates["pass_prediction_location"]) {
    const pass_prediction_location = globalState.get(
      "pass_prediction_location"
    );
    if (pass_prediction_location !== null) {
      const grandparent_element = document.getElementById("pass-content");
      for (const child of grandparent_element.children) {
        child.getElementsByClassName(
          "location-field"
        )[0].value = `${pass_prediction_location.lat}, ${pass_prediction_location.long}`;
        break;
      }
    }
  } else if (changedStates["togglePassing"]) {
    toggleIconState();
    const isDisplayingPassing = globalState.get("togglePassing");
    const dropdown = document.getElementById("passing-satellites-dropdown");
    if (isDisplayingPassing) {
      onNewVisibleSatellites();
      dropdown.classList.remove("hidden");
    } else {
      dropdown.classList.add("hidden");
    }
  }
}

function populateDropdown(satellite_ids, dropdown) {
  dropdown.innerHTML = "";

  if (!satellite_ids || satellite_ids.length === 0) {
    const noPassingSatellites = document.createElement("a");
    noPassingSatellites.textContent = "No passing satellites";
    noPassingSatellites.classList.add("block", "px-4", "py-2", "text-gray-500");
    dropdown.appendChild(noPassingSatellites);
    return;
  }
  const satellite_data = globalState.get("satellites");
  satellite_ids.forEach((satellite) => {
    const option = document.createElement("a");
    option.textContent = satellite_data[satellite].name;
    option.dataset.satelliteId = satellites.getInstanceIdById(satellite);
    option.classList.add(
      "block",
      "px-4",
      "py-2",
      "hover:bg-gray-700",
      "cursor-pointer"
    );
    option.addEventListener("click", () => focusSatellite(satellite));
    dropdown.appendChild(option);
  });
}

function focusSatellite(id) {
  let clicked_satellite = id;
  glState.set({
    clickedSatellite: clicked_satellite,
  });
}

function onNewVisibleSatellites() {
  const dropdown = document.getElementById("passing-satellites-dropdown");
  const passingSatellites = satellites ? satellites.getVisible() : [];
  populateDropdown(passingSatellites, dropdown);
}

export function initPredictions() {
  subscribe("onGlobalStateChanged", onGlobalStateChanged);
  subscribe("newVisibleSatellites", onNewVisibleSatellites);

  const toggleButton = document.getElementById("toggle-section");
  const passing_location = globalState.get("passing_location");

  if (passing_location) {
    toggleButton.classList.remove("opacity-50");
  } else {
    toggleButton.classList.add("opacity-50");
  }
  document
    .getElementById("passing-prediction-header")
    .addEventListener("click", function () {
      toggleSection("passing-content", "arrow-passing");
    });

  document
    .getElementById("pass-prediction-header")
    .addEventListener("click", function () {
      toggleSection("pass-content", "arrow-pass");
    });

  document
    .getElementById("re-entry-prediction-header")
    .addEventListener("click", function () {
      toggleSection("re-entry-content", "arrow-re-entry");
    });

  document
    .getElementById("calculate-pass-button")
    .addEventListener("click", function () {});

  document
    .getElementById("calculate-re-entry-button")
    .addEventListener("click", function () {
      // Future use
    });

  const location_btns = document.querySelectorAll(".get-location-btn");

  const dropdown = document.getElementById("passing-satellites-dropdown");
  dropdown.classList.add("hidden");

  location_btns.forEach(async (btn) => {
    btn.addEventListener("click", function (event) {
      getLocation().then((location) => {
        const grandparent_id = btn.parentElement.parentElement.id;
        if (grandparent_id === "passing-content") {
          globalState.set({ passing_location: location });
        } else if (grandparent_id === "pass-content") {
          globalState.set({ pass_prediction_location: location });
        }
      });
    });
  });

  selectLocationBtn.forEach((btn) => {
    btn.addEventListener("click", function (event) {
      let picking = globalState.get("pickingLocation");
      if (picking == null) {
        picking = false;
      }
      globalState.set({ pickingLocation: !picking });
      let pick_passing = false;
      let pick_pass_prediction = false;
      if (!picking) {
        const grandparent_id = btn.parentElement.parentElement.id;
        if (grandparent_id === "passing-content") {
          pick_passing = true;
        } else if (grandparent_id === "pass-content") {
          pick_pass_prediction = true;
        }
      }
      globalState.set({
        pick_passing: pick_passing,
        pick_pass_prediction: pick_pass_prediction,
      });
    });
  });

  // Fix for later
  document
    .getElementById("toggle-section")
    .addEventListener("click", function (event) {
      globalState.set({ togglePassing: !globalState.get("togglePassing") });
    });
}

function toggleSection(contentId, arrowId) {
  const contentElement = document.getElementById(contentId);
  const arrowElement = document.getElementById(arrowId);

  contentElement.classList.toggle("hidden");

  // Rotate the arrow icon based on visibility
  if (contentElement.classList.contains("hidden")) {
    arrowElement.querySelector("svg").classList.remove("rotate-90");
  } else {
    arrowElement.querySelector("svg").classList.add("rotate-90");
  }
}

export function toggleIconState() {
  const toggleText = document.getElementById("toggle-text");
  const togglePath = document.getElementById("toggle-path");
  const isDisplayingPassing = globalState.get("togglePassing");

  if (isDisplayingPassing) {
    const location = globalState.get("passing_location");
    if (!location) {
      return;
    }
    toggleText.innerText = "Displaying Passing Satellites";
    togglePath.setAttribute(
      "d",
      "M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
    );
  } else {
    toggleText.innerText = "Displaying All Satellites";
    togglePath.setAttribute(
      "d",
      "M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"
    );
  }
  glState.set({ clickedSatellite: null });
}
