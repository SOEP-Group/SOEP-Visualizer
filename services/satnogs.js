const axios = require("axios");

const DEFAULT_BASE_URL = "https://db.satnogs.org/api/satellites";
const DEFAULT_MEDIA_BASE_URL = "https://db.satnogs.org/media";
const baseUrl =
  (process.env.SATNOGS_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
const mediaBaseUrl = (
  process.env.SATNOGS_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL
).replace(/\/$/, "");
const timeout =
  Number.parseInt(process.env.SATNOGS_API_TIMEOUT_MS, 10) || 5000;

const NULL_STRINGS = new Set(["", "n/a", "none", "null", "unknown"]);

function sanitizeString(value) {
  if (value === undefined || value === null) return null;
  const stringValue = String(value).trim();
  if (!stringValue) return null;
  if (NULL_STRINGS.has(stringValue.toLowerCase())) return null;
  return stringValue;
}

function pickField(record, candidates = []) {
  for (const field of candidates) {
    const value = record[field];
    if (value === undefined || value === null || value === "") continue;
    return value;
  }
  return null;
}

function pickText(record, candidates = []) {
  for (const field of candidates) {
    const sanitized = sanitizeString(record[field]);
    if (sanitized) {
      return sanitized;
    }
  }
  return null;
}

function numberOrNull(value) {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function resolveImageUrl(value) {
  const sanitized = sanitizeString(value);
  if (!sanitized) {
    return null;
  }
  if (/^https?:\/\//i.test(sanitized)) {
    return sanitized;
  }
  const trimmed = sanitized.replace(/^\/+/, "");
  return `${mediaBaseUrl}/${trimmed}`;
}

function mapRecordToView(record, fallbackId) {
  const satelliteId =
    pickField(record, ["norad_cat_id", "noradCatId", "norad_id"]) ||
    fallbackId ||
    null;

  const fallbackName = [record.name, record.alternative_names]
    .filter(Boolean)
    .join(" / ");

  const owner = pickText(record, ["owner", "operator", "operators"]) || null;

  const country =
    pickText(record, ["country_code", "countries", "country"]) || null;

  let description =
    pickText(record, [
      "description",
      "details",
      "source",
      "citation",
      "website",
      "info",
      "info_url",
      "notes",
    ]) || null;

  if (description && /^https?:\/\//i.test(description)) {
    description = null;
  }

  return {
    satellite_id: satelliteId,
    name: fallbackName || (satelliteId ? `Satellite ${satelliteId}` : "Unknown"),
    object_id: pickText(record, ["intldes", "object_id", "objectId"]),
    inclination: numberOrNull(
      pickField(record, ["inclination", "orbit_inclination"])
    ),
    revolution: numberOrNull(pickField(record, ["period", "revolution"])),
    launch_date: pickText(record, ["launch_date", "launched", "date"]),
    launch_site: pickText(record, ["launch_site", "site", "launch_location"]),
    owner,
    description,
    status: pickText(record, ["status"]),
    object_type: pickText(record, ["type", "object_type"]),
    country_code: country,
    image_url: resolveImageUrl(
      pickField(record, [
        "image",
        "image_url",
        "image_src",
        "thumbnail",
        "main_image",
        "image_link",
      ])
    ),
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
    // A 404 from the list endpoint may indicate an API issue, not just "not found"
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
  if (!Number.isFinite(normalized) || normalized <= 0) {
    const error = new Error("Invalid satellite id");
    error.statusCode = 400;
    throw error;
  }

  return fetchSatnogsRecord(normalized);
}

module.exports = { fetchSatelliteDetails };
