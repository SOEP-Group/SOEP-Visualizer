import { fetchEvents } from "../api/events.js";
import { getLocation } from "./utils.js";

export function initEvents() {
    const eventsTab = document.getElementById("events-tab");
    const eventsContent = document.querySelector(".tab-content .tab-panel");

    eventsTab.addEventListener("click", async () => {
        eventsContent.innerHTML = "<p>Loading events...</p>";

        try {
            // const { latitude, longitude } = await getLocation();

            const [sunEvents, moonEvents] = await Promise.all([
                // fetchEvents("sun", latitude, longitude),
                // fetchEvents("moon", latitude, longitude),
                fetchEvents("sun"), // Remove location if not applicable
                fetchEvents("moon"),
            ]);

            if ((!sunEvents || sunEvents.length === 0) && (!moonEvents || moonEvents.length === 0)) {
                eventsContent.innerHTML = "<p>No events found for Sun or Moon.</p>";
                return;
            }

            const sunContentHTML = renderEventDetails("Sun Events", sunEvents);
            const moonContentHTML = renderEventDetails("Moon Events", moonEvents);

            eventsContent.innerHTML = sunContentHTML + moonContentHTML;
        } catch (error) {
            eventsContent.innerHTML = `<p>Error loading events: ${error.message}</p>`;
            console.error("Error fetching events:", error);
        }
    });
}

function renderEventDetails(title, eventData) {
    if (!eventData || eventData.length === 0) {
        return `<div class="event-details"><h2>${title}</h2><p>No events available.</p></div>`;
    }

    const event = eventData.table.rows[0].cells[0];
    const {
        eventHighlights,
        rise,
        set,
        extraInfo,
    } = event;
    const { partialStart, peak, partialEnd } = eventHighlights;

    return `
        <div class="event-details">
            <h2>${title}</h2>
            <ul>
                <li><strong>Event Type:</strong> Partial Eclipse</li>
                <li><strong>Partial Start:</strong> ${new Date(partialStart.date).toLocaleString()} (Altitude: ${partialStart.altitude}°)</li>
                <li><strong>Peak:</strong> ${new Date(peak.date).toLocaleString()} (Altitude: ${peak.altitude}°)</li>
                <li><strong>Partial End:</strong> ${new Date(partialEnd.date).toLocaleString()} (Altitude: ${partialEnd.altitude}°)</li>
                <li><strong>Rise:</strong> ${new Date(rise).toLocaleTimeString()}</li>
                <li><strong>Set:</strong> ${new Date(set).toLocaleTimeString()}</li>
                <li><strong>Obscuration:</strong> ${(extraInfo.obscuration * 100).toFixed(2)}%</li>
            </ul>
        </div>
    `;
}
