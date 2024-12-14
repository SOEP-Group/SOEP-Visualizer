export async function fetchEvents(
  body,
  latitude,
  longitude,
  startDateTime,
  endDateTime
) {
  try {
    const params = new URLSearchParams({
      latitude,
      longitude,
    });
    if (startDateTime) params.set("start", startDateTime);
    if (endDateTime) params.set("end", endDateTime);

    const response = await fetch(
      `/api/bodies/events/${body}?` + params.toString()
    );
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return null;
  }
}
