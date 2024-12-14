import { fetchEvents } from "../api/events.js";
import { getLocation } from "./utils.js";
import { globalState } from "../globalState.js";
import { subscribe } from "../eventBuss.js";

let cachedEvents = {};
const selectLocationBtn = document.querySelectorAll(
  ".select-location-button-events"
);
const getLocationBtn = document.querySelectorAll(".get-location-btn-events");

const bodies = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

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
  } else if (changedStates["events_location"]) {
    const events_location = globalState.get("events_location");
    if (events_location !== null) {
      const parent_element = document.getElementById("events-content");
      const locationField = parent_element.querySelector(
        ".location-field-events"
      );
      if (locationField) {
        locationField.value = `${events_location.lat}, ${events_location.long}`;
      }
    }
  }
}

export async function initEvents() {
  subscribe("onGlobalStateChanged", onGlobalStateChanged);

  let loc = globalState.get("events_location");
  if (!loc) {
    try {
      loc = await getLocation();
      if (loc && loc.lat && loc.long) {
        globalState.set({ events_location: loc });
      } else {
        globalState.set({ events_location: { lat: 37.7749, long: -122.4194 } });
      }
    } catch (error) {
      globalState.set({ events_location: { lat: 37.7749, long: -122.4194 } });
    }
  }

  const startDate = document.getElementById("start-date").value;
  const startTime = document.getElementById("start-time").value;
  const endDate = document.getElementById("end-date").value;
  const endTime = document.getElementById("end-time").value;

  let startDateTime;
  if (startDate) {
    startDateTime = startDate + (startTime ? `T${startTime}:00` : "T00:00:00");
  } else {
    startDateTime = new Date().toISOString();
  }

  let endDateTime;
  if (endDate) {
    endDateTime = endDate + (endTime ? `T${endTime}:00` : "T23:59:59");
  } else {
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
    endDateTime = end.toISOString();
  }

  document
    .getElementById("sun-events-header")
    .addEventListener("click", async () => {
      toggleSection("sun-content", "arrow-sun");
      await fetchAndRenderEvents(
        "sun",
        "sun-content",
        startDateTime,
        endDateTime
      );
    });

  document
    .getElementById("moon-events-header")
    .addEventListener("click", async () => {
      toggleSection("moon-content", "arrow-moon");
      await fetchAndRenderEvents(
        "moon",
        "moon-content",
        startDateTime,
        endDateTime
      );
    });

  document
    .getElementById("planet-events-header")
    .addEventListener("click", async () => {
      toggleSection("planet-content", "arrow-planet");
      await fetchAndRenderAllPlanets(startDateTime, endDateTime);
    });

  document
    .getElementById("filter-events")
    .addEventListener("click", async () => {
      const startDate = document.getElementById("start-date").value;
      const startTime = document.getElementById("start-time").value;
      const endDate = document.getElementById("end-date").value;
      const endTime = document.getElementById("end-time").value;

      let startDateTime;
      if (startDate) {
        startDateTime =
          startDate + (startTime ? `T${startTime}:00` : "T00:00:00");
      } else {
        startDateTime = new Date().toISOString();
      }

      let endDateTime;
      if (endDate) {
        endDateTime = endDate + (endTime ? `T${endTime}:00` : "T23:59:59");
      } else {
        const start = new Date(startDateTime);
        const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
        endDateTime = end.toISOString();
      }

      await fetchAndRenderEvents(
        "sun",
        "sun-content",
        startDateTime,
        endDateTime
      );
      await fetchAndRenderEvents(
        "moon",
        "moon-content",
        startDateTime,
        endDateTime
      );
      await fetchAndRenderAllPlanets(startDateTime, endDateTime);
    });

  getLocationBtn.forEach((btn) => {
    btn.addEventListener("click", function (event) {
      getLocation()
        .then((location) => {
          const parent_id = btn.parentElement.id;
          if (parent_id === "events-content") {
            globalState.set({ events_location: location });
          }
        })
        .catch(() => {
          globalState.set({
            events_location: { lat: 37.7749, long: -122.4194 },
          });
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
      let pick_events = false;
      if (!picking) {
        const parent_id = btn.parentElement.id;
        if (parent_id === "events-content") {
          pick_events = true;
        }
      }
      globalState.set({
        pick_events: pick_events,
      });
    });
  });

  function toggleSection(contentId, arrowId) {
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);

    content.classList.toggle("hidden");
    arrow.classList.toggle("rotate-90");
  }

  document
    .getElementById("toggle-filters")
    .addEventListener("click", function () {
      document
        .getElementById("arrow-filter")
        .querySelector("svg")
        .classList.toggle("rotate-180");
      const filterSection = document.getElementById("filter-section");
      filterSection.classList.toggle("hidden");
    });

  function filterEvents() {}
  async function fetchAndRenderEvents(
    bodyName,
    contentId,
    startDateTime,
    endDateTime
  ) {
    const contentElement = document.getElementById(contentId);

    contentElement.innerHTML = "<p>Loading events...</p>";

    try {
      const loc = globalState.get("events_location");
      console.log(loc);

      let userLatitude = 37.7749; // default lat
      let userLongitude = -122.4194; // default long

      if (loc && loc.lat && loc.long) {
        userLatitude = loc.lat;
        userLongitude = loc.long;
      }

      const eventData = await fetchEvents(
        bodyName,
        userLatitude,
        userLongitude,
        startDateTime,
        endDateTime
      );
      cachedEvents[bodyName] = eventData;

      const eventDetailsHTML = renderEventDetails("", eventData, bodyName);

      contentElement.innerHTML = eventDetailsHTML;
    } catch (error) {
      contentElement.innerHTML = `<p>Error loading events: ${error.message}</p>`;
      console.error(`Error fetching ${bodyName} events:`, error);
    }
  }

  async function fetchAndRenderAllPlanets(startDateTime, endDateTime) {
    const contentElement = document.getElementById("planet-content");

    contentElement.innerHTML = "<p>Loading planet events...</p>";

    try {
      const loc = globalState.get("events_location");
      let userLatitude = 37.7749;
      let userLongitude = -122.4194;

      if (loc && loc.lat && loc.long) {
        userLatitude = loc.lat;
        userLongitude = loc.long;
      }

      const planetEvents = await Promise.all(
        bodies
          .slice(2)
          .map((planet) =>
            fetchEvents(
              planet,
              userLatitude,
              userLongitude,
              startDateTime,
              endDateTime
            )
          )
      );

      let planetHTML = "";
      planetEvents.forEach((eventData, index) => {
        const planetName = bodies[index + 2];
        cachedEvents[planetName] = eventData;
        planetHTML += renderEventDetails(
          `${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`,
          eventData,
          planetName
        );
      });

      contentElement.innerHTML = planetHTML;
    } catch (error) {
      contentElement.innerHTML = `<p>Error loading planet events: ${error.message}</p>`;
      console.error("Error fetching planet events:", error);
    }
  }

  function renderEventDetails(title, eventData, bodyName) {
    if (!eventData) {
      return `
      <div class="event-details">
        <h2>${title}</h2>
        <p>No events available.</p>
      </div>
    `;
    }

    let content = `
  <div class="event-details">
    <h2>${title}</h2>
    <ul>
      <li><strong>Rise Time:</strong> ${
        eventData.rise ? new Date(eventData.rise).toLocaleString() : "N/A"
      }</li>
      <li><strong>Set Time:</strong> ${
        eventData.set ? new Date(eventData.set).toLocaleString() : "N/A"
      }</li>
      <li><strong>Culmination:</strong> ${
        eventData.culmination
          ? new Date(eventData.culmination).toLocaleString()
          : "N/A"
      }</li>
     <br>
`;

    // Moon
    const nextNewMoonDate = eventData.nextNewMoon
      ? new Date(eventData.nextNewMoon)
      : null;
    const nextFullMoonDate = eventData.nextFullMoon
      ? new Date(eventData.nextFullMoon)
      : null;
    const nextFirstQuarterDate = eventData.nextFirstQuarter
      ? new Date(eventData.nextFirstQuarter)
      : null;
    if (bodyName.toLowerCase() === "moon") {
      content += `
    <li><strong>Moon Phase Angle:</strong> ${eventData.moonPhaseAngle.toFixed(
      2
    )}°</li>
    <li><strong>Next New Moon:</strong> ${
      nextNewMoonDate && nextNewMoonDate.toString() !== "Invalid Date"
        ? nextNewMoonDate.toLocaleString()
        : "N/A"
    }</li>
    <li><strong>Next First Quarter:</strong> ${
      nextFirstQuarterDate && nextFirstQuarterDate.toString() !== "Invalid Date"
        ? nextFirstQuarterDate.toLocaleString()
        : "N/A"
    }</li>
    <li><strong>Next Full Moon:</strong> ${
      nextFullMoonDate && nextFullMoonDate.toString() !== "Invalid Date"
        ? nextFullMoonDate.toLocaleString()
        : "N/A"
    }</li>
    <li><strong>Next Last Quarter:</strong> ${new Date(
      eventData.nextLastQuarter
    ).toLocaleString()}</li>
    <li><strong>Next Lunar Eclipse:</strong> ${
      eventData.nextLunarEclipse
        ? `${eventData.nextLunarEclipse.kind} on ${new Date(
            eventData.nextLunarEclipse.date
          ).toLocaleString()}`
        : "N/A"
    }</li>
    <li><strong>Next Lunar Perigee/Apogee:</strong> ${
      eventData.nextLunarApsis
        ? `${eventData.nextLunarApsis.kind} on ${new Date(
            eventData.nextLunarApsis.date
          ).toLocaleString()} at ${eventData.nextLunarApsis.distanceKm.toFixed(
            0
          )} km`
        : "N/A"
    }</li>
  `;
    }

    // Sun
    if (bodyName.toLowerCase() === "sun") {
      const twilight = eventData.twilight;
      content += `
    <li><strong>Next Solar Eclipse:</strong> ${
      eventData.nextSolarEclipse
        ? `${eventData.nextSolarEclipse.kind} on ${new Date(
            eventData.nextSolarEclipse.date
          ).toLocaleString()}`
        : "N/A"
    }</li>
  `;
    }

    // if (["mercury", "venus"].includes(bodyName.toLowerCase())) {
    //   const maxElongation = eventData.nextMaxElongation;
    //   if (maxElongation) {
    //     content += `
    //       <li><strong>Next Maximum Elongation:</strong> ${new Date(
    //         maxElongation.date
    //       ).toLocaleString()}</li>
    //       <li><strong>Elongation:</strong> ${maxElongation.elongation.toFixed(
    //         2
    //       )}°</li>
    //       <li><strong>Visibility:</strong> ${maxElongation.visibility}</li>
    //     `;
    //   }
    //   if (eventData.nextInferiorConjunction) {
    //     content += `
    //       <li><strong>Next Inferior Conjunction:</strong> ${new Date(
    //         eventData.nextInferiorConjunction
    //       ).toLocaleString()}</li>
    //     `;
    //   }
    //   if (eventData.nextSuperiorConjunction) {
    //     content += `
    //       <li><strong>Next Superior Conjunction:</strong> ${new Date(
    //         eventData.nextSuperiorConjunction
    //       ).toLocaleString()}</li>
    //     `;
    //   }
    //   if (eventData.nextTransit) {
    //     content += `
    //       <li><strong>Next Transit:</strong> ${new Date(
    //         eventData.nextTransit.date
    //       ).toLocaleString()}</li>
    //       <li><strong>Separation:</strong> ${eventData.nextTransit.separationArcmin.toFixed(
    //         2
    //       )} arcminutes</li>
    //     `;
    //   }
    //   if (eventData.currentMagnitude !== undefined) {
    //     content += `
    //       <li><strong>Current Magnitude:</strong> ${eventData.currentMagnitude.toFixed(
    //         2
    //       )}</li>
    //       <li><strong>Current Elongation:</strong> ${eventData.currentElongation.toFixed(
    //         2
    //       )}°</li>
    //     `;
    //   }
    //   if (eventData.nextApsis) {
    //     content += `
    //       <li><strong>Next Perihelion/Aphelion:</strong> ${
    //         eventData.nextApsis.kind
    //       } on ${new Date(eventData.nextApsis.date).toLocaleString()} at ${
    //       eventData.nextApsis.distanceAu
    //     } AU</li>
    //     `;
    //   }
    // }

    // if (
    //   ["mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(
    //     bodyName.toLowerCase()
    //   )
    // ) {
    //   if (eventData.nextOpposition) {
    //     content += `
    //       <li><strong>Next Opposition:</strong> ${new Date(
    //         eventData.nextOpposition
    //       ).toLocaleString()}</li>
    //     `;
    //   }
    //   if (eventData.nextConjunction) {
    //     content += `
    //       <li><strong>Next Conjunction:</strong> ${new Date(
    //         eventData.nextConjunction
    //       ).toLocaleString()}</li>
    //     `;
    //   }
    //   if (eventData.currentMagnitude !== undefined) {
    //     content += `
    //       <li><strong>Current Magnitude:</strong> ${eventData.currentMagnitude.toFixed(
    //         2
    //       )}</li>
    //       <li><strong>Current Elongation:</strong> ${eventData.currentElongation.toFixed(
    //         2
    //       )}°</li>
    //     `;
    //   }
    //   if (eventData.nextApsis) {
    //     content += `
    //       <li><strong>Next Perihelion/Aphelion:</strong> ${
    //         eventData.nextApsis.kind
    //       } on ${new Date(eventData.nextApsis.date).toLocaleString()} at ${
    //       eventData.nextApsis.distanceAu
    //     } AU</li>
    //     `;
    //   }
    // }

    content += `
      </ul>
    </div>
  `;

    return content;
  }
}
