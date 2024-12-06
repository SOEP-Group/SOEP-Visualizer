import { fetchEvents } from "../api/events.js";
import { getLocation } from "./utils.js";

let cachedEvents = {};

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

export function initEvents() {
  document.getElementById("sun-events-header").addEventListener("click", async () => {
    toggleSection("sun-content", "arrow-sun");
    await fetchAndRenderEvents("sun", "sun-content");
  });

  document.getElementById("moon-events-header").addEventListener("click", async () => {
    toggleSection("moon-content", "arrow-moon");
    await fetchAndRenderEvents("moon", "moon-content");
  });

  document.getElementById("planet-events-header").addEventListener("click", async () => {
    toggleSection("planet-content", "arrow-planet");
    await fetchAndRenderAllPlanets();
  });
}

function toggleSection(contentId, arrowId) {
  const content = document.getElementById(contentId);
  const arrow = document.getElementById(arrowId);

  content.classList.toggle("hidden");
  arrow.classList.toggle("rotate-90");
}

document.addEventListener("click", function (event) {
  let locationField = null;
  if (event.target && event.target.id === "get-location-button-events") {
    locationField = document.getElementById("location-events");

    if (locationField) {
      getLocation(locationField);
    }
  }
});

document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "select-location-button-events") {
    // For future use
  }
});

document.getElementById("toggle-filters").addEventListener("click", () => {
  const filterSection = document.getElementById("filter-section");
  filterSection.classList.toggle("hidden");
});


async function fetchAndRenderEvents(bodyName, contentId) {
  const contentElement = document.getElementById(contentId);

  if (contentElement.dataset.loaded === "true") {
    return;
  }

  contentElement.innerHTML = "<p>Loading events...</p>";

  try {
    //const location = await getLocation();
    const userLatitude = location.latitude;
    const userLongitude = location.longitude;

    const eventData = await fetchEvents(bodyName, userLatitude, userLongitude);
    cachedEvents[bodyName] = eventData;

    const eventDetailsHTML = renderEventDetails(
      `${bodyName.charAt(0).toUpperCase() + bodyName.slice(1)} Events`,
      eventData,
      bodyName
    );

    contentElement.innerHTML = eventDetailsHTML;
    contentElement.dataset.loaded = "true";
  } catch (error) {
    contentElement.innerHTML = `<p>Error loading events: ${error.message}</p>`;
    console.error(`Error fetching ${bodyName} events:`, error);
  }
}

async function fetchAndRenderAllPlanets() {
  const contentElement = document.getElementById("planet-content");

  if (contentElement.dataset.loaded === "true") {
    return;
  }

  contentElement.innerHTML = "<p>Loading planet events...</p>";

  try {
    //const location = await getLocation();
    const userLatitude = location.latitude;
    const userLongitude = location.longitude;

    const planetEvents = await Promise.all(
      bodies.slice(2).map((planet) => fetchEvents(planet, userLatitude, userLongitude))
    );

    let planetHTML = "";
    planetEvents.forEach((eventData, index) => {
      const planetName = bodies[index + 2];
      cachedEvents[planetName] = eventData;
      planetHTML += renderEventDetails(
        `${planetName.charAt(0).toUpperCase() + planetName.slice(1)} Events`,
        eventData,
        planetName
      );
    });

    contentElement.innerHTML = planetHTML;
    contentElement.dataset.loaded = "true";
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
      <li><strong>Rise Time:</strong> ${eventData.rise
      ? new Date(eventData.rise).toLocaleString()
      : "N/A"
    }</li>
      <li><strong>Set Time:</strong> ${eventData.set
      ? new Date(eventData.set).toLocaleString()
      : "N/A"
    }</li>
      <li><strong>Culmination:</strong> ${eventData.culmination
      ? new Date(eventData.culmination).toLocaleString()
      : "N/A"
    }</li>
     <br>
`;

  // Moon
  if (bodyName.toLowerCase() === "moon") {
    content += `
    <li><strong>Moon Phase Angle:</strong> ${eventData.moonPhaseAngle.toFixed(
      2
    )}°</li>
    <li><strong>Next New Moon:</strong> ${new Date(
      eventData.nextNewMoon
    ).toLocaleString()}</li>
    <li><strong>Next First Quarter:</strong> ${new Date(
      eventData.nextFirstQuarter
    ).toLocaleString()}</li>
    <li><strong>Next Full Moon:</strong> ${new Date(
      eventData.nextFullMoon
    ).toLocaleString()}</li>
    <li><strong>Next Last Quarter:</strong> ${new Date(
      eventData.nextLastQuarter
    ).toLocaleString()}</li>
    <li><strong>Next Lunar Eclipse:</strong> ${eventData.nextLunarEclipse
        ? `${eventData.nextLunarEclipse.kind} on ${new Date(
          eventData.nextLunarEclipse.date
        ).toLocaleString()}`
        : "N/A"
      }</li>
    <li><strong>Next Lunar Perigee/Apogee:</strong> ${eventData.nextLunarApsis
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
    <li><strong>Next Solar Eclipse:</strong> ${eventData.nextSolarEclipse
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