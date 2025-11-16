const axios = require("axios");

const DEFAULT_BASE_URL = "https://db.satnogs.org/api/satellites";
const baseUrl =
  (process.env.SATNOGS_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
const timeout =
  Number.parseInt(process.env.SATNOGS_API_TIMEOUT_MS, 10) || 5000;

function pickField(record, candidates = []) {
  for (const field of candidates) {
    const value = record[field];
    if (value === undefined || value === null || value === "") continue;
    return value;
  }
  return null;
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapRecordToView(record, fallbackId) {
  const satelliteId =
    pickField(record, ["norad_cat_id", "noradCatId", "norad_id"]) ||
    fallbackId ||
    null;

  const fallbackName = [record.name, record.alternative_names]
    .filter(Boolean)
    .join(" / ");

  return {
    satellite_id: satelliteId,
    name: fallbackName || (satelliteId ? `Satellite ${satelliteId}` : "Unknown"),
    object_id: pickField(record, ["intldes", "object_id", "objectId"]),
    inclination: numberOrNull(
      pickField(record, ["inclination", "orbit_inclination"])
    ),
    revolution: numberOrNull(pickField(record, ["period", "revolution"])),
    launch_date:
      pickField(record, ["launch_date", "launched", "date"]) || "Unknown",
    launch_site:
      pickField(record, ["launch_site", "site", "launch_location"]) || "Unknown",
    owner: pickField(record, ["owner", "operator"]) || "Unknown",
    description:
      pickField(record, ["description", "details", "source"]) ||
      "No description available from SatNOGS.",
    status: pickField(record, ["status"]),
    object_type: pickField(record, ["type", "object_type"]),
    country_code: pickField(record, ["country_code", "country"]),
    image_url: pickField(record, [
      "image",
      "image_url",
      "image_src",
      "thumbnail",
      "main_image",
      "image_link",
    ]),
  };
}

async function fetchSatnogsRecord(noradId) {
  const directUrl = `${baseUrl}/${noradId}/`;
  try {
    const { data } = await axios.get(directUrl, {
      timeout,
      params: { format: "json" },
    });
    if (data) return mapRecordToView(data, noradId);
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }
  }

  const listUrl = `${baseUrl}/`;
  let data;
  try {
    ({ data } = await axios.get(listUrl, {
      timeout,
      params: { format: "json", norad_cat_id: noradId },
    }));
  } catch (error) {
    if (error.response?.status === 404) {
      const notFoundError = new Error(
        `Satellite ${noradId} not found in SatNOGS database`
      );
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    throw error;
  }

  const candidates = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  if (!candidates.length) {
    const notFoundError = new Error(
      `Satellite ${noradId} not found in SatNOGS database`
    );
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return mapRecordToView(candidates[0], noradId);
}

async function fetchSatelliteDetails(id) {
  const normalized = Number.parseInt(id, 10);
  if (!Number.isFinite(normalized)) {
    const error = new Error("Invalid satellite id");
    error.statusCode = 400;
    throw error;
  }

  return fetchSatnogsRecord(normalized);
}

module.exports = { fetchSatelliteDetails };
