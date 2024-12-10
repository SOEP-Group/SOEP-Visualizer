import { subscribe } from "../eventBuss.js";
import { globalState } from "../globalState.js";
import { isMobileScreen } from "./utils.js";
import { satellites } from "../gl/scene.js";
import { glState } from "../gl/index.js";

// burger menu
const dropdownButton = document.getElementById("menu__toggle");
const dropdownMenu = document.getElementById("ham_menu");

const eventsTab = document.getElementById("events-tab");

let firstMenuOpen = true;

function onGlobalStateChanged(changedStates) {
  if (changedStates["pickingLocation"]) {
    const picking = globalState.get("pickingLocation");
    if (isMobileScreen()) {
      if (!picking) {
        openMenu();
      } else {
        closeMenu();
      }
    }
  }
}

export function initHeader() {
  subscribe("onGlobalStateChanged", onGlobalStateChanged);
  const satelliteDropdown = document.getElementById("satellite-dropdown");
  const searchInput = document.getElementById("satellite-search");

  function getAllSatellites() {
    if (!satellites || typeof satellites.instanceCount === "undefined") {
      //console.warn("satellites are not initialized");
      return [];
    }

    const satelliteList = [];
    for (
      let instanceId = 0;
      instanceId < satellites.instanceCount;
      instanceId++
    ) {
      const id = satellites.getIdByInstanceId(instanceId);
      const name = satellites.instanceIdToDataMap[instanceId]?.name || `${id}`;
      satelliteList.push({ id, name });
    }
    return satelliteList;
  }

  function populateDropdown(filteredSatellites) {
    satelliteDropdown.innerHTML = "";

    if (!filteredSatellites || filteredSatellites.length === 0) {
      const noResult = document.createElement("a");
      noResult.textContent = "No satellites found";
      noResult.classList.add("block", "px-4", "py-2", "text-gray-500");
      satelliteDropdown.appendChild(noResult);
      satelliteDropdown.classList.remove("hidden");
      return;
    }

    const satellitesToShow = filteredSatellites.slice(0, 20);
    satellitesToShow.forEach((satellite) => {
      const option = document.createElement("a");
      option.textContent = satellite.name;
      option.dataset.satelliteId = satellite.id;
      option.classList.add("block", "px-4", "py-2", "hover:bg-gray-700");
      option.addEventListener("click", () => focusSatellite(satellite.id));
      satelliteDropdown.appendChild(option);
    });

    satelliteDropdown.classList.remove("hidden");
  }

  function filterSatellites(query) {
    const allSatellites = getAllSatellites();
    return allSatellites.filter((satellite) =>
      satellite.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  function focusSatellite(id) {
    let clicked_satellite = satellites.getInstanceIdById(id);
    glState.set({
      clickedSatellite: clicked_satellite,
    });

    const searchInput = document.getElementById("satellite-search");
    if (searchInput) {
      searchInput.value = "";
    }
    satelliteDropdown.classList.add("hidden");
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    const filtered = filterSatellites(query);
    populateDropdown(filtered);
  });

  searchInput.addEventListener("focus", () => {
    const allSatellites = getAllSatellites();
    populateDropdown(allSatellites);
  });

  document.addEventListener("click", (event) => {
    if (
      !satelliteDropdown.contains(event.target) &&
      !searchInput.contains(event.target)
    ) {
      satelliteDropdown.classList.add("hidden");
    }
  });

  dropdownButton.addEventListener("click", function () {
    const menuClosed = dropdownMenu.classList.contains("-translate-x-full");
    if (menuClosed) {
      return openMenu();
    }
    closeMenu();
  });

  dropdownMenu.addEventListener("mouseup", (event) => {
    event.stopPropagation();
  });
  dropdownMenu.addEventListener("mousemove", (event) => {
    document.body.style.cursor = "default";
    event.stopPropagation();
  });
  dropdownMenu.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });
}

function openMenu() {
  dropdownMenu.classList.remove("-translate-x-full");
  dropdownMenu.classList.add("translate-x-0");
  dropdownButton.classList.add("tham-active");
  if (firstMenuOpen) {
    eventsTab.click();
    firstMenuOpen = false;
  }
}

function closeMenu() {
  dropdownMenu.classList.remove("translate-x-0");
  dropdownButton.classList.remove("tham-active");
  dropdownMenu.classList.add("-translate-x-full");
}

// Filter
const filtersButton = document.getElementById("filters-button");
const filtersDropdown = document.getElementById("filters-dropdown");
const closeFiltersButton = document.getElementById("close-filters-button");

function toggleDropdown(isOpen) {
  if (isOpen) {
    filtersDropdown.classList.remove(
      "invisible",
      "opacity-0",
      "translate-y-2",
      "pointer-events-none"
    );
    filtersDropdown.classList.add("opacity-100", "translate-y-0");
  } else {
    filtersDropdown.classList.remove("opacity-100", "translate-y-0");
    filtersDropdown.classList.add(
      "opacity-0",
      "translate-y-2",
      "pointer-events-none"
    );
    setTimeout(() => filtersDropdown.classList.add("invisible"), 300); // Match duration
  }
}

function logEvent(event, value) {
  console.log(`${event}: ${value}`);
}

filtersButton.addEventListener("click", () => {
  const isCurrentlyClosed = filtersDropdown.classList.contains("invisible");
  toggleDropdown(isCurrentlyClosed);
  console.log("Filters button clicked");
});

closeFiltersButton.addEventListener("click", () => {
  toggleDropdown(false);
  console.log("Close filters panel");
});

// const inputs = [
//   { id: "speed-range", event: "Speed range" },
//   { id: "longitude-range", event: "Longitude range" },
//   { id: "latitude-range", event: "Latitude range" },
//   { id: "orbit-distance", event: "Orbit distance" },
//   { id: "inclination", event: "Inclination" },
//   { id: "revolution-time", event: "Revolution Time" },
//   { id: "launch-date", event: "Launch Date" },
//   { id: "launch-site", event: "Launch Site" },
//   { id: "owner", event: "Owner" },
// ];

// inputs.forEach(({ id, event }) => {
//   document.getElementById(id).addEventListener("change", function () {
//     logEvent(event, this.value);
//   });
// });

const buttons = [
  { id: "clear-filters-button", action: "Clear filters clicked" },
  { id: "apply-filters-button", action: "Apply filters clicked" },
];

buttons.forEach(({ id, action }) => {
  document.getElementById(id).addEventListener("click", () => {
    console.log(action);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const sliderConfigs = [
    {
      id: "speed-slider",
      minLabel: "speed-min-label",
      maxLabel: "speed-max-label",
      range: [0, 12],
      step: 0.1,
    },
    {
      id: "longitude-slider",
      minLabel: "longitude-min-label",
      maxLabel: "longitude-max-label",
      range: [-180, 180],
      step: 1,
    },
    {
      id: "latitude-slider",
      minLabel: "latitude-min-label",
      maxLabel: "latitude-max-label",
      range: [-90, 90],
      step: 1,
    },
    {
      id: "orbit-distance-slider",
      minLabel: "orbit-distance-min-label",
      maxLabel: "orbit-distance-max-label",
      range: [100, 500000],
      step: 100,
    },
    {
      id: "inclination-slider",
      minLabel: "inclination-min-label",
      maxLabel: "inclination-max-label",
      range: [0, 180],
      step: 1,
    },
    {
      id: "revolution-time-slider",
      minLabel: "revolution-time-min-label",
      maxLabel: "revolution-time-max-label",
      range: [80, 40000],
      step: 10,
    },
  ];

  sliderConfigs.forEach(({ id, minLabel, maxLabel, range, step }) => {
    const slider = document.getElementById(id);
    const minLabelElem = document.getElementById(minLabel);
    const maxLabelElem = document.getElementById(maxLabel);

    if (slider.noUiSlider) {
      console.warn(`Slider with ID "${id}" is already initialized.`);
      return;
    }

    noUiSlider.create(slider, {
      start: range,
      connect: true,
      range: {
        min: range[0],
        max: range[1],
      },
      step: step,
      tooltips: false,
      format: {
        to: (value) => parseFloat(value).toFixed(step < 1 ? 1 : 0),
        from: (value) => parseFloat(value),
      },
    });

    slider.noUiSlider.on("update", (values) => {
      minLabelElem.textContent = values[0];
      maxLabelElem.textContent = values[1];
    });
  });
});
