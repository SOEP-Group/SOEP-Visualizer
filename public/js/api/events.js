export async function fetchEvents(body, latitude, longitude) {
  try {
    const response = await fetch(
      `/api/bodies/events/${body}?latitude=${latitude}&longitude=${longitude}`
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