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
      option.classList.add("block", "px-4", "py-2", "hover:bg-gray-700", "cursor-pointer");
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
