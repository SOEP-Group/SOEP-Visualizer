import { satellites } from "../gl/scene.js";
import { globalState } from "../globalState.js";
import { STATUS_OPTIONS } from "../utils/status.js";

const DEFAULT_SLIDER_RANGES = {
  minSpeed: 0,
  maxSpeed: 12,
  minLat: -90,
  maxLat: 90,
  minLong: -180,
  maxLong: 180,
  minOrbitDistance: 100,
  maxOrbitDistance: 500000,
  minInclination: 0,
  maxInclination: 180,
  minRevolution: 80,
  maxRevolution: 40000,
};

const filtersButton = document.getElementById("filters-button");
const DEFAULT_STATUS_FILTERS = STATUS_OPTIONS;

function escapeRegexCharacter(character) {
  return character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildNameRegex(pattern) {
  if (!pattern) return null;
  const trimmed = pattern.trim();
  if (!trimmed) return null;

  let regexBody = "";
  for (const char of trimmed) {
    if (char === "*") {
      regexBody += ".*";
    } else {
      regexBody += escapeRegexCharacter(char);
    }
  }

  return new RegExp(`^${regexBody}$`, "i");
}

export function toggleDropdown(isOpen) {
  const filtersDropdown = document.getElementById("filters-dropdown");
  filtersDropdown.classList.toggle("invisible", !isOpen);
  filtersDropdown.classList.toggle("opacity-0", !isOpen);
  filtersDropdown.classList.toggle("md:translate-y-2", !isOpen);
  filtersDropdown.classList.toggle("pointer-events-none", !isOpen);
  filtersDropdown.classList.toggle("opacity-100", isOpen);
  filtersDropdown.classList.toggle("md:translate-y-0", isOpen);
  filtersButton.classList.toggle("active", isOpen);

  if (!isOpen) {
    setTimeout(() => filtersDropdown.classList.add("invisible"), 300);
  }
}

export async function fetchFilterData() {
  const response = await fetch("/api/filter-data");
  if (!response.ok) {
    console.error("Failed to fetch filter data");
    return null;
  }

  return await response.json();
}

function createSlider(id, range, step, minLabelElem, maxLabelElem) {
  const slider = document.getElementById(id);
  if (slider.noUiSlider) slider.noUiSlider.destroy();

  const adjustedRange = [
    Math.floor(range[0] * 10) / 10,
    Math.ceil(range[1] * 10) / 10,
  ];

  noUiSlider.create(slider, {
    start: adjustedRange,
    connect: true,
    range: { min: adjustedRange[0], max: adjustedRange[1] },
    step,
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
}

export async function initializeFilters(filterData, selectedFilters = null) {
  if (!filterData) return;

  const sliderConfigs = [
    {
      id: "speed-slider",
      label: "Speed (km/s)",
      minLabel: "speed-min-label",
      maxLabel: "speed-max-label",
      range: [
        filterData.minSpeed ?? DEFAULT_SLIDER_RANGES.minSpeed,
        filterData.maxSpeed ?? DEFAULT_SLIDER_RANGES.maxSpeed,
      ],
      step: 0.1,
    },
    {
      id: "latitude-slider",
      label: "Latitude (°)",
      minLabel: "latitude-min-label",
      maxLabel: "latitude-max-label",
      range: [
        filterData.minLat ?? DEFAULT_SLIDER_RANGES.minLat,
        filterData.maxLat ?? DEFAULT_SLIDER_RANGES.maxLat,
      ],
      step: 0.1,
    },
    {
      id: "longitude-slider",
      label: "Longitude (°)",
      minLabel: "longitude-min-label",
      maxLabel: "longitude-max-label",
      range: [
        filterData.minLong ?? DEFAULT_SLIDER_RANGES.minLong,
        filterData.maxLong ?? DEFAULT_SLIDER_RANGES.maxLong,
      ],
      step: 0.1,
    },
    {
      id: "orbit-distance-slider",
      label: "Orbit Distance (km)",
      minLabel: "orbit-distance-min-label",
      maxLabel: "orbit-distance-max-label",
      range: [
        filterData.min_orbit_distance ?? DEFAULT_SLIDER_RANGES.minOrbitDistance,
        filterData.max_orbit_distance ?? DEFAULT_SLIDER_RANGES.maxOrbitDistance,
      ],
      step: 100,
    },
    {
      id: "inclination-slider",
      label: "Inclination (°)",
      minLabel: "inclination-min-label",
      maxLabel: "inclination-max-label",
      range: [
        filterData.min_inclination ?? DEFAULT_SLIDER_RANGES.minInclination,
        filterData.max_inclination ?? DEFAULT_SLIDER_RANGES.maxInclination,
      ],
      step: 1,
    },
    {
      id: "revolution-time-slider",
      label: "Revolution Time (hours)",
      minLabel: "revolution-time-min-label",
      maxLabel: "revolution-time-max-label",
      range: [
        filterData.min_revolution ?? DEFAULT_SLIDER_RANGES.minRevolution,
        filterData.max_revolution ?? DEFAULT_SLIDER_RANGES.maxRevolution,
      ],
      step: 0.1,
    },
  ];

  sliderConfigs.forEach(({ id, minLabel, maxLabel, range, step, label }) => {
    const minLabelElem = document.getElementById(minLabel);
    const maxLabelElem = document.getElementById(maxLabel);
    createSlider(id, range, step, minLabelElem, maxLabelElem);
    if (
      selectedFilters &&
      selectedFilters[label] &&
      Array.isArray(selectedFilters[label])
    ) {
      document.getElementById(id).noUiSlider.set(selectedFilters[label]);
    }
  });

  const launchDateStart = document.getElementById("launch-date-start");
  const launchDateEnd = document.getElementById("launch-date-end");
  const launchSiteSelect = document.getElementById("launch-site");
  const ownerSelect = document.getElementById("owner");
  const statusSelect = document.getElementById("status-filter");
  const namePatternInput = document.getElementById("name-pattern");

  const minLaunchDate = filterData.min_launch_date || "1957-01-01";
  const maxLaunchDate = filterData.max_launch_date || "2025-12-31";

  const selectedStart =
    selectedFilters?.["Launch Date"]?.start || minLaunchDate;
  const selectedEnd = selectedFilters?.["Launch Date"]?.end || maxLaunchDate;

  launchDateStart.value = selectedStart;
  launchDateEnd.value = selectedEnd;

  launchDateStart.dataset.minValue = minLaunchDate;
  launchDateEnd.dataset.maxValue = maxLaunchDate;

  const populateSelect = (selectElement, options = []) => {
    selectElement.innerHTML = '<option value="">Any</option>';
    options.forEach((option) => {
      if (!option) return;
      const optElem = document.createElement("option");
      const value =
        typeof option === "string" ? option : option.value ?? option.label;
      const label =
        typeof option === "string" ? option : option.label ?? option.value;

      optElem.value = value;
      optElem.textContent = label;
      selectElement.appendChild(optElem);
    });
  };

  populateSelect(launchSiteSelect, filterData.launch_sites);
  populateSelect(ownerSelect, filterData.owners);
  populateSelect(statusSelect, DEFAULT_STATUS_FILTERS);

  const selectedOwner = selectedFilters?.["Owner"];
  const selectedSite = selectedFilters?.["Launch Site"];
  const selectedStatus = selectedFilters?.["Status"];

  if (selectedSite && selectedSite !== "Any") {
    launchSiteSelect.value = selectedSite;
  } else {
    launchSiteSelect.value = "";
  }

  if (selectedOwner && selectedOwner !== "Any") {
    ownerSelect.value = selectedOwner;
  } else {
    ownerSelect.value = "";
  }

  if (selectedStatus) {
    statusSelect.value = selectedStatus;
  } else {
    statusSelect.value = "";
  }

  if (namePatternInput) {
    namePatternInput.value = selectedFilters?.["Name Pattern"] || "";
  }
}

export async function getFilterData() {
  if (!satellites || typeof satellites.instanceCount === "undefined") {
    console.warn("satellites are not initialized");
    return null;
  }

  let minSpeed = Infinity,
    maxSpeed = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;
  let minLong = Infinity,
    maxLong = -Infinity;

  const ids = [];

  for (
    let instanceId = 0;
    instanceId < satellites.instanceCount;
    instanceId++
  ) {
    const geodeticCoords = satellites.getGeodeticCoordinates(instanceId);
    const speedVector = satellites.getSpeed(instanceId);
    const id = satellites.getIdByInstanceId(instanceId);

    const speed = Math.sqrt(
      speedVector.x ** 2 + speedVector.y ** 2 + speedVector.z ** 2
    );

    minSpeed = Math.min(minSpeed, speed);
    maxSpeed = Math.max(maxSpeed, speed);
    minLat = Math.min(minLat, geodeticCoords.lat);
    maxLat = Math.max(maxLat, geodeticCoords.lat);
    minLong = Math.min(minLong, geodeticCoords.long);
    maxLong = Math.max(maxLong, geodeticCoords.long);
    ids.push(id);
  }

  return {
    minSpeed,
    maxSpeed,
    minLat,
    maxLat,
    minLong,
    maxLong,
    ids,
  };
}

export function getFilterValues() {
  const sliders = [
    { id: "speed-slider", label: "Speed (km/s)" },
    { id: "latitude-slider", label: "Latitude (°)" },
    { id: "longitude-slider", label: "Longitude (°)" },
    { id: "orbit-distance-slider", label: "Orbit Distance (km)" },
    { id: "inclination-slider", label: "Inclination (°)" },
    { id: "revolution-time-slider", label: "Revolution Time (hours)" },
  ];

  const filterValues = {};

  sliders.forEach(({ id, label }) => {
    const slider = document.getElementById(id).noUiSlider;
    if (slider) {
      filterValues[label] = slider.get();
    }
  });

  filterValues["Launch Date"] = {
    start: document.getElementById("launch-date-start").value || "1957-01-01",
    end: document.getElementById("launch-date-end").value || "2025-12-31",
  };
  const launchSiteValue = document.getElementById("launch-site").value;
  const ownerValue = document.getElementById("owner").value;
  const statusValue = document.getElementById("status-filter").value;
  const namePattern = document.getElementById("name-pattern").value.trim();

  filterValues["Launch Site"] = launchSiteValue || "Any";
  filterValues["Owner"] = ownerValue || "Any";
  if (statusValue) {
    filterValues["Status"] = statusValue;
  } else {
    delete filterValues["Status"];
  }

  if (namePattern) {
    filterValues["Name Pattern"] = namePattern;
  } else {
    delete filterValues["Name Pattern"];
  }

  return filterValues;
}

export function resetFiltersToDefault() {
  const sliders = [
    {
      id: "speed-slider",
      range: [DEFAULT_SLIDER_RANGES.minSpeed, DEFAULT_SLIDER_RANGES.maxSpeed],
    },
    {
      id: "latitude-slider",
      range: [DEFAULT_SLIDER_RANGES.minLat, DEFAULT_SLIDER_RANGES.maxLat],
    },
    {
      id: "longitude-slider",
      range: [DEFAULT_SLIDER_RANGES.minLong, DEFAULT_SLIDER_RANGES.maxLong],
    },
    {
      id: "orbit-distance-slider",
      range: [
        DEFAULT_SLIDER_RANGES.minOrbitDistance,
        DEFAULT_SLIDER_RANGES.maxOrbitDistance,
      ],
    },
    {
      id: "inclination-slider",
      range: [
        DEFAULT_SLIDER_RANGES.minInclination,
        DEFAULT_SLIDER_RANGES.maxInclination,
      ],
    },
    {
      id: "revolution-time-slider",
      range: [
        DEFAULT_SLIDER_RANGES.minRevolution,
        DEFAULT_SLIDER_RANGES.maxRevolution,
      ],
    },
  ];

  sliders.forEach(({ id, range }) => {
    const slider = document.getElementById(id).noUiSlider;
    if (slider) {
      slider.set(range);
    }
  });

  const launchDateStart = document.getElementById("launch-date-start");
  const launchDateEnd = document.getElementById("launch-date-end");

  if (launchDateStart && launchDateEnd) {
    launchDateStart.value = launchDateStart.dataset.minValue || "1957-01-01";
    launchDateEnd.value = launchDateEnd.dataset.maxValue || "2025-12-31";
  }

  const launchSiteSelect = document.getElementById("launch-site");
  const ownerSelect = document.getElementById("owner");
  const statusSelect = document.getElementById("status-filter");
  const namePatternInput = document.getElementById("name-pattern");

  if (launchSiteSelect) launchSiteSelect.value = "";
  if (ownerSelect) ownerSelect.value = "";
  if (statusSelect) statusSelect.value = "";
  if (namePatternInput) namePatternInput.value = "";
}

export function isFiltered(selectedFilters, instanceId) {
  if (!selectedFilters || Object.keys(selectedFilters).length <= 0) {
    return false;
  }
  const speedRange = selectedFilters?.["Speed (km/s)"]?.map(Number) || [
    -Infinity,
    Infinity,
  ];

  const latRange = selectedFilters?.["Latitude (°)"]?.map(Number) || [-90, 90];

  const longRange = selectedFilters?.["Longitude (°)"]?.map(Number) || [
    -180, 180,
  ];

  const orbitDistanceRange = selectedFilters?.["Orbit Distance (km)"]?.map(
    Number
  ) || [-Infinity, Infinity];

  const inclinationRange = selectedFilters?.["Inclination (°)"]?.map(
    Number
  ) || [-Infinity, Infinity];

  const revolutionTimeRange = selectedFilters?.["Revolution Time (hours)"]?.map(
    Number
  ) || [-Infinity, Infinity];

  const launchDateRange = selectedFilters?.["Launch Date"]
    ? [
        new Date(selectedFilters["Launch Date"].start),
        new Date(selectedFilters["Launch Date"].end),
      ]
    : [new Date(-8640000000000000), new Date(8640000000000000)];

  const geodeticCoords = satellites.getGeodeticCoordinates(instanceId);
  const speedVector = satellites.getSpeed(instanceId);
  const speed = Math.sqrt(
    speedVector.x ** 2 + speedVector.y ** 2 + speedVector.z ** 2
  );
  const orbitDistance = satellites.getOrbitDistance(instanceId);
  const inclination = satellites.getInclination(instanceId);
  const revolutionTime = satellites.getRevolutionTime(instanceId);
  const launchDate = satellites.getLaunchDate(instanceId);
  const owner = satellites.getOwner(instanceId);
  const launchSite = satellites.getLaunchSite(instanceId);
  const statusState = satellites.getStatusState(instanceId);
  const name = satellites.getName(instanceId) || "";

  const satelliteLaunchDate = new Date(launchDate);
  const filterStatus = selectedFilters["Status"] || null;
  const nameRegex = buildNameRegex(selectedFilters["Name Pattern"]);
  const isWithinFilters =
    speed >= speedRange[0] &&
    speed <= speedRange[1] &&
    geodeticCoords.lat >= latRange[0] &&
    geodeticCoords.lat <= latRange[1] &&
    geodeticCoords.long >= longRange[0] &&
    geodeticCoords.long <= longRange[1] &&
    orbitDistance.min >= orbitDistanceRange[0] &&
    orbitDistance.max <= orbitDistanceRange[1] &&
    inclination >= inclinationRange[0] &&
    inclination <= inclinationRange[1] &&
    revolutionTime >= revolutionTimeRange[0] &&
    revolutionTime <= revolutionTimeRange[1] &&
    satelliteLaunchDate >= launchDateRange[0] &&
    satelliteLaunchDate <= launchDateRange[1] &&
    (selectedFilters["Owner"] === "Any" ||
      owner === selectedFilters["Owner"]) &&
    (selectedFilters["Launch Site"] === "Any" ||
      launchSite === selectedFilters["Launch Site"]) &&
    (!filterStatus || statusState === filterStatus) &&
    (!nameRegex || nameRegex.test(name));

  return !isWithinFilters;
}

export function getMatchedSatellites(selectedFilters, ignore_list) {
  if (!satellites || typeof satellites.instanceCount === "undefined") {
    console.warn("Satellites are not initialized.");
    return [];
  }
  const matchedSatellites = [];
  const ignore_list_set = new Set(ignore_list);

  const speedRange = selectedFilters?.["Speed (km/s)"]?.map(Number) || [
    -Infinity,
    Infinity,
  ];

  const latRange = selectedFilters?.["Latitude (°)"]?.map(Number) || [-90, 90];

  const longRange = selectedFilters?.["Longitude (°)"]?.map(Number) || [
    -180, 180,
  ];

  const orbitDistanceRange = selectedFilters?.["Orbit Distance (km)"]?.map(
    Number
  ) || [-Infinity, Infinity];

  const inclinationRange = selectedFilters?.["Inclination (°)"]?.map(
    Number
  ) || [-Infinity, Infinity];

  const revolutionTimeRange = selectedFilters?.["Revolution Time (hours)"]?.map(
    Number
  ) || [-Infinity, Infinity];

  const launchDateRange = selectedFilters?.["Launch Date"]
    ? [
        new Date(selectedFilters["Launch Date"].start),
        new Date(selectedFilters["Launch Date"].end),
      ]
    : [new Date(-8640000000000000), new Date(8640000000000000)];

  const nameRegex = buildNameRegex(selectedFilters?.["Name Pattern"]);

  for (
    let instanceId = 0;
    instanceId < satellites.instanceCount;
    instanceId++
  ) {
    if (ignore_list_set.has(instanceId)) {
      continue;
    }

    if (!selectedFilters || Object.keys(selectedFilters).length <= 0) {
      matchedSatellites.push(instanceId);
      continue;
    }

    const geodeticCoords = satellites.getGeodeticCoordinates(instanceId);
    const speedVector = satellites.getSpeed(instanceId);
    const speed = Math.sqrt(
      speedVector.x ** 2 + speedVector.y ** 2 + speedVector.z ** 2
    );
    const orbitDistance = satellites.getOrbitDistance(instanceId);
    const inclination = satellites.getInclination(instanceId);
    const revolutionTime = satellites.getRevolutionTime(instanceId);
    const launchDate = satellites.getLaunchDate(instanceId);
    const owner = satellites.getOwner(instanceId);
    const launchSite = satellites.getLaunchSite(instanceId);
    const statusState = satellites.getStatusState(instanceId);
    const filterStatus = selectedFilters["Status"] || null;
    const name = satellites.getName(instanceId) || "";

    const satelliteLaunchDate = new Date(launchDate);
    const isWithinFilters =
      speed >= speedRange[0] &&
      speed <= speedRange[1] &&
      geodeticCoords.lat >= latRange[0] &&
      geodeticCoords.lat <= latRange[1] &&
      geodeticCoords.long >= longRange[0] &&
      geodeticCoords.long <= longRange[1] &&
      orbitDistance.min >= orbitDistanceRange[0] &&
      orbitDistance.max <= orbitDistanceRange[1] &&
      inclination >= inclinationRange[0] &&
      inclination <= inclinationRange[1] &&
      revolutionTime >= revolutionTimeRange[0] &&
      revolutionTime <= revolutionTimeRange[1] &&
      satelliteLaunchDate >= launchDateRange[0] &&
      satelliteLaunchDate <= launchDateRange[1] &&
      (selectedFilters["Owner"] === "Any" ||
        owner === selectedFilters["Owner"]) &&
      (selectedFilters["Launch Site"] === "Any" ||
        launchSite === selectedFilters["Launch Site"]) &&
      (!filterStatus || statusState === filterStatus) &&
      (!nameRegex || nameRegex.test(name));

    if (isWithinFilters) {
      matchedSatellites.push(instanceId);
    }
  }
  return matchedSatellites;
}
