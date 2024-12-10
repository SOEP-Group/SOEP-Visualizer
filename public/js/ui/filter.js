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

  noUiSlider.create(slider, {
    start: range,
    connect: true,
    range: { min: range[0], max: range[1] },
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

  const launchSiteSelect = document.getElementById("launch-site");
  const ownerSelect = document.getElementById("owner");

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

    minSpeed = Math.min(minSpeed, speed);
    maxSpeed = Math.max(maxSpeed, speed);
    minLat = Math.min(minLat, geodeticCoords.lat);
    maxLat = Math.max(maxLat, geodeticCoords.lat);
    minLong = Math.min(minLong, geodeticCoords.long);
    maxLong = Math.max(maxLong, geodeticCoords.long);
  }

  return {
    minSpeed,
    maxSpeed,
    minLat,
    maxLat,
    minLong,
    maxLong,
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

  filterValues["Launch Date"] =
    document.getElementById("launch-date").value || "Any";
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

  document.getElementById("launch-site").value = "";
  document.getElementById("owner").value = "";
  document.getElementById("launch-date").value = "";
}
