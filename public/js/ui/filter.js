import { satellites } from "../gl/scene.js";

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

export function toggleDropdown(isOpen) {
  const filtersDropdown = document.getElementById("filters-dropdown");
  filtersDropdown.classList.toggle("invisible", !isOpen);
  filtersDropdown.classList.toggle("opacity-0", !isOpen);
  filtersDropdown.classList.toggle("translate-y-2", !isOpen);
  filtersDropdown.classList.toggle("pointer-events-none", !isOpen);
  filtersDropdown.classList.toggle("opacity-100", isOpen);
  filtersDropdown.classList.toggle("translate-y-0", isOpen);

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

export async function initializeFilters(filterData) {
  if (!filterData) return;

  const sliderConfigs = [
    {
      id: "speed-slider",
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
      minLabel: "revolution-time-min-label",
      maxLabel: "revolution-time-max-label",
      range: [
        filterData.min_revolution ?? DEFAULT_SLIDER_RANGES.minRevolution,
        filterData.max_revolution ?? DEFAULT_SLIDER_RANGES.maxRevolution,
      ],
      step: 0.1,
    },
  ];

  sliderConfigs.forEach(({ id, minLabel, maxLabel, range, step }) => {
    const minLabelElem = document.getElementById(minLabel);
    const maxLabelElem = document.getElementById(maxLabel);
    createSlider(id, range, step, minLabelElem, maxLabelElem);
  });

  const launchDateStart = document.getElementById("launch-date-start");
  const launchDateEnd = document.getElementById("launch-date-end");
  const launchSiteSelect = document.getElementById("launch-site");
  const ownerSelect = document.getElementById("owner");

  const minLaunchDate = filterData.min_launch_date || "1957-01-01";
  const maxLaunchDate = filterData.max_launch_date || "2025-12-31";

  launchDateStart.value = minLaunchDate;
  launchDateEnd.value = maxLaunchDate;

  launchDateStart.dataset.minValue = minLaunchDate;
  launchDateEnd.dataset.maxValue = maxLaunchDate;

  const populateSelect = (selectElement, options) => {
    selectElement.innerHTML = '<option value="">Any</option>';
    options.forEach((option) => {
      const optElem = document.createElement("option");
      optElem.value = option;
      optElem.textContent = option;
      selectElement.appendChild(optElem);
    });
  };

  populateSelect(launchSiteSelect, filterData.launch_sites);
  populateSelect(ownerSelect, filterData.owners);
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
  filterValues["Launch Site"] =
    document.getElementById("launch-site").value || "Any";
  filterValues["Owner"] = document.getElementById("owner").value || "Any";

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

  if (launchSiteSelect) launchSiteSelect.value = "";
  if (ownerSelect) ownerSelect.value = "";
}

export function getUnmatchedSatellites(selectedFilters) {
  if (!satellites || typeof satellites.instanceCount === "undefined") {
    console.warn("Satellites are not initialized.");
    return [];
  }

  const unmatchedSatellites = [];

  for (
    let instanceId = 0;
    instanceId < satellites.instanceCount;
    instanceId++
  ) {
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

    const filters = selectedFilters;
    const speedRange = filters["Speed (km/s)"].map(Number);
    const latRange = filters["Latitude (°)"].map(Number);
    const longRange = filters["Longitude (°)"].map(Number);
    const orbitDistanceRange = filters["Orbit Distance (km)"].map(Number);
    const inclinationRange = filters["Inclination (°)"].map(Number);
    const revolutionTimeRange = filters["Revolution Time (hours)"].map(Number);

    const launchDateStart = new Date(filters["Launch Date"].start);
    const launchDateEnd = new Date(filters["Launch Date"].end);
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
      satelliteLaunchDate >= launchDateStart &&
      satelliteLaunchDate <= launchDateEnd &&
      (filters["Owner"] === "Any" || owner === filters["Owner"]) &&
      (filters["Launch Site"] === "Any" ||
        launchSite === filters["Launch Site"]);

    if (!isWithinFilters) {
      unmatchedSatellites.push(instanceId);
    }
  }

  return unmatchedSatellites;
}
