import { fetchEvents } from "../api/events.js";
import { getLocation } from "./utils.js";

export function initEvents() {
    const eventsTab = document.getElementById("events-tab");
    const eventsContent = document.querySelector(
      ".tab-content .tab-panel"
    );
  
    eventsTab.addEventListener("click", async () => {
      eventsContent.innerHTML = "<p>Loading events...</p>";
  
      try {
        const location = await getLocation(null);
        const userLatitude = location.latitude;
        const userLongitude = location.longitude;
  
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
  
        const eventsPromises = bodies.map((body) =>
          fetchEvents(
            body,
            userLatitude || 37.7749,
            userLongitude || -122.4194
          )
        );
  
        const eventsData = await Promise.all(eventsPromises);
  
        let contentHTML = "";
  
        eventsData.forEach((eventData, index) => {
          const bodyName = bodies[index];
          contentHTML += renderEventDetails(
            `${bodyName.charAt(0).toUpperCase() + bodyName.slice(1)} Events`,
            eventData,
            bodyName
          );
        });
  
        eventsContent.innerHTML = contentHTML;
      } catch (error) {
        eventsContent.innerHTML = `<p>Error loading events: ${error.message}</p>`;
        console.error("Error fetching events:", error);
      }
    });
  }
  
  function renderEventDetails(title, eventData, bodyName) {
    if (!eventData) {
      return `<div class="event-details"><h2>${title}</h2><p>No events available.</p></div>`;
    }
  
    let content = `
      <div class="event-details">
        <h2>${title}</h2>
        <ul>
          <li><strong>Rise Time:</strong> ${
            eventData.rise
              ? new Date(eventData.rise).toLocaleString()
              : "N/A"
          }</li>
          <li><strong>Set Time:</strong> ${
            eventData.set
              ? new Date(eventData.set).toLocaleString()
              : "N/A"
          }</li>
          <li><strong>Culmination:</strong> ${
            eventData.culmination
              ? new Date(eventData.culmination).toLocaleString()
              : "N/A"
          }</li>
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