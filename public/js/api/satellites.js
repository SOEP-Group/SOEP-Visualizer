export async function fetchSatellites() {
  const response = await fetch("api/satellites");
  const result = await response.json();

  return result;
}

export async function fetchSatellite(id) {
  const response = await fetch(`satellite/${id}`);
  const result = await response.json();
  return result.body;
}
