export async function fetchSatellites() {
  const response = await fetch("api/satellites");
  const result = await response.json();

  return result;
}

export async function fetchSatellite(id) {
  const response = await fetch(`satellite/${id}`);
  if (!response.ok) {
    const message =
      response.status === 404
        ? "Satellite not found."
        : "Failed to load satellite details.";
    throw new Error(message);
  }

  const result = await response.json();
  return result.body;
}
