import { getLocation } from "./utils.js";
import { globalState } from "../globalState.js";
import { subscribe } from "../eventBuss.js";

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
    if (passing_location !== null) {
      const grandparent_element = document.getElementById("passing-content");
      console.log(grandparent_element.children);
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
  }
}

export function initPredictions() {
  subscribe("onGlobalStateChanged", onGlobalStateChanged);
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
    .addEventListener("click", function () {

    });

  document
    .getElementById("calculate-re-entry-button")
    .addEventListener("click", function () {
      // Future use
    });

  const location_btns = document.querySelectorAll(".get-location-btn");

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
  document.addEventListener("click", function (event) {
    if (event.target.closest("#toggle-section")) {
      toggleIconState();
    }
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

  if (toggleText.innerText === "Displaying All Satellites") {
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
}
