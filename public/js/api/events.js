export async function fetchEvents(body) {
    try {
      const response = await fetch(`/api/bodies/events/${body}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching events:", error.message);
      return [];
    }
  }