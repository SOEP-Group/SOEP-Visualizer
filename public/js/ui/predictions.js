import { getLocation } from "./utils.js";
import { globalState } from "../globalState.js";
import { subscribe } from "../eventBuss.js";
import { satellites } from "../gl/scene.js";
import { glState } from "../gl/index.js";

const selectLocationBtn = document.querySelectorAll(".select-location-button");
const selectSatelliteBtn = document.querySelectorAll(
  ".select-satellite-button"
);

function onGlobalStateChanged(prevState) {
  if ("pickingLocation" in prevState) {
    const picking = globalState.get("pickingLocation");

    for (let i = 0; i < selectLocationBtn.length; i++) {
      if (!picking) {
        selectLocationBtn[i].innerText = "Select Location";
      } else {
        selectLocationBtn[i].innerText =
          "Click on earth (Press here to Cancel)";
      }
    }
  }
  if ("passing_location" in prevState) {
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
  }
  if ("pass_prediction_location" in prevState) {
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
  if ("togglePassing" in prevState) {
    toggleIconState();
  }

  if ("pickingSatellite" in prevState) {
    const picking = globalState.get("pickingSatellite");

    for (let i = 0; i < selectSatelliteBtn.length; i++) {
      if (!picking) {
        selectSatelliteBtn[i].innerText = "Select Satellite";
      } else {
        selectSatelliteBtn[i].innerText =
          "Click on a satellite (Press here to Cancel)";
      }
    }
  }

  if ("collision_prediction_satellite" in prevState) {
    const sat_name = globalState.get("collision_prediction_satellite");
    document.getElementById("satellite-collision").value = sat_name;
  }
}

export function initPredictions() {
  subscribe("onGlobalStateChanged", onGlobalStateChanged);

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

  // document
  //   .getElementById("pass-prediction-header")
  //   .addEventListener("click", function () {
  //     toggleSection("pass-content", "arrow-pass");
  //   });

  document
    .getElementById("collision-prediction-header")
    .addEventListener("click", function () {
      toggleSection("collision-content", "arrow-collision");
    });

  // document
  //   .getElementById("calculate-pass-button")
  //   .addEventListener("click", function () {});

  document
    .getElementById("calculate-collision-button")
    .addEventListener("click", function () {
      const sat_name = document.getElementById("satellite-collision").value;
      let noradId = null;
      for (const [instanceId, data] of Object.entries(
        satellites.instanceIdToDataMap
      )) {
        if (data.name === sat_name) {
          noradId = data.satellite_id;
          break;
        }
      }
      fetch(`/api/predictions/predict_collision/${noradId}`)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          let other_sat_name;
          for (const [instanceId, instance_data] of Object.entries(
            satellites.instanceIdToDataMap
          )) {
            if (instance_data.satellite_id === data.other_satellite_id) {
              other_sat_name = instance_data.name;
              break;
            }
          }
          document.getElementById(
            "collision-prediction-result"
          ).innerHTML = `Has a ${data["probability"]}% chance to collide with ${other_sat_name}`;
        })
        .catch((error) => {
          console.error("Error fetching collision prediction:", error);
          document.getElementById("collision-prediction-result").innerHTML =
            "No collisions detected";
        });
    });

  document
    .getElementById("pick-satellite-collision-button")
    .addEventListener("click", (event) => {
      globalState.set({
        pickingSatellite: !globalState.get("pickingSatellite"),
        pickingLocation: false,
      });
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
      globalState.set({ pickingLocation: !picking, pickingSatellite: false });
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

  document
    .getElementById("toggle-section")
    .addEventListener("hover", function (event) {
      const passing_location = globalState.get("passing_location");
      if (!passing_location) {
        document.body.style.cursor = "default";
      }
    });

  document
    .getElementById("toggle-section")
    .addEventListener("click", function (event) {
      const passing_location = globalState.get("passing_location");
      if (passing_location) {
        globalState.set({ togglePassing: !globalState.get("togglePassing") });
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
