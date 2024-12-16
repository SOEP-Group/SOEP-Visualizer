import { subscribe } from "../eventBuss.js";
import { globalState } from "../globalState.js";
import { isMobileScreen } from "./utils.js";
import { satellites } from "../gl/scene.js";
import { glState } from "../gl/index.js";
import {
  toggleDropdown,
  fetchFilterData,
  initializeFilters,
  getFilterData,
  getFilterValues,
  resetFiltersToDefault,
} from "./filter.js";

// burger menu

const dropdownButton = document.getElementById("menu__toggle");
const dropdownMenu = document.getElementById("ham_menu");
const eventsTab = document.getElementById("events-tab");
const filtersButton = document.getElementById("filters-button");
const filtersDropdown = document.getElementById("filters-dropdown");
const closeFiltersButton = document.getElementById("close-filters-button");
const clearFiltersButton = document.getElementById("clear-filters-button");
const applyFiltersButton = document.getElementById("apply-filters-button");
const satelliteDropdown = document.getElementById("satellite-dropdown");
const searchInput = document.getElementById("satellite-search");

let firstMenuOpen = true;

function onGlobalStateChanged(prevState) {
  if ("pickingLocation" in prevState || "pickingSatellite" in prevState) {
    const picking_location = globalState.get("pickingLocation");
    const picking_sat = globalState.get("pickingSatellite");
    if (isMobileScreen()) {
      if (!picking_location && !picking_sat) {
        openMenu();
      } else {
        closeMenu();
      }
    }
  }

  if (
    "visible_satellites" in prevState &&
    !satelliteDropdown.classList.contains("hidden")
  ) {
    const query = searchInput.value.trim();
    handleFilter(query);
  }
}

function getAllSatellites() {
  if (!satellites || typeof satellites.instanceCount === "undefined") {
    console.warn("satellites are not initialized");
    return [];
  }

  const satelliteList = [];
  const visible_satellites = globalState.get("visible_satellites");
  for (let instanceId of visible_satellites) {
    const id = satellites.getIdByInstanceId(instanceId);
    const name = satellites.instanceIdToDataMap[instanceId]?.name || `${id}`;
    satelliteList.push({ id, name });
  }
  return satelliteList;
}

export function initHeader() {
  subscribe("onGlobalStateChanged", onGlobalStateChanged);

  searchInput.addEventListener("input", (event) => {
    event.stopPropagation();
    const query = searchInput.value.trim();
    handleFilter(query);
  });

  searchInput.addEventListener("focus", (event) => {
    event.stopPropagation();
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

  dropdownButton.addEventListener("click", function (event) {
    event.stopPropagation();
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

  updatePlaceholder();
  window.addEventListener("resize", updatePlaceholder);
}

function focusSatellite(id) {
  let clicked_satellite = satellites.getInstanceIdById(id);
  if (globalState.get("pickingSatellite")) {
    const sat_name = satellites.getName(clicked_satellite);
    globalState.set({
      collision_prediction_satellite: sat_name,
      pickingSatellite: false,
    });
  } else {
    glState.set({
      clickedSatellite: clicked_satellite,
    });
  }

  const searchInput = document.getElementById("satellite-search");
  if (searchInput) {
    searchInput.value = "";
  }
  satelliteDropdown.classList.add("hidden");
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

  // const satellitesToShow = filteredSatellites.slice(0, 20);
  filteredSatellites.forEach((satellite) => {
    const option = document.createElement("a");
    option.textContent = satellite.name;
    option.dataset.satelliteId = satellite.id;
    option.classList.add(
      "block",
      "px-4",
      "py-2",
      "hover:bg-gray-700",
      "cursor-pointer"
    );
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      focusSatellite(satellite.id);
    });
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

function handleFilter(query) {
  const filtered = filterSatellites(query);
  populateDropdown(filtered);
}

function updatePlaceholder() {
  const searchInput = document.getElementById("satellite-search");
  if (window.innerWidth >= 768) {
    searchInput.placeholder = searchInput.dataset.placeholderMd;
  } else {
    searchInput.placeholder = searchInput.dataset.placeholderSm;
  }
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

filtersButton.addEventListener("click", async (event) => {
  event.stopPropagation();
  const isCurrentlyClosed = filtersDropdown.classList.contains("invisible");
  toggleDropdown(isCurrentlyClosed);

  if (isCurrentlyClosed) {
    const filterData = await getFilterData();
    const apiFilterData = await fetchFilterData();

    if (filterData && apiFilterData) {
      const mergedFilterData = { ...apiFilterData, ...filterData };
      initializeFilters(mergedFilterData);
    }
  }
});

closeFiltersButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(false);
});

clearFiltersButton.addEventListener("click", (event) => {
  event.stopPropagation();
  resetFiltersToDefault();
});

applyFiltersButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const selectedFilters = getFilterValues();
  globalState.set({ filter_parameters: selectedFilters });
});

clearFiltersButton.addEventListener("click", (event) => {
  event.stopPropagation();
  resetFiltersToDefault();
  globalState.set({ filter_parameters: {} });
});
