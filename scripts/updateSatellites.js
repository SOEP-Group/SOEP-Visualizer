#!/usr/bin/env node

const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { fetchSatelliteDetails } = require("../services/satnogs");
const { determineStatus } = require("../utils/status");
const { ensureLocalImage } = require("./lib/imageStore");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const envPath =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

if (fs.existsSync(path.join(__dirname, "..", envPath))) {
  require("dotenv").config({ path: path.join(__dirname, "..", envPath) });
}

const db = require("../db");

const DEFAULT_GROUP = process.env.CELESTRAK_GROUP || "active";
const DEFAULT_URL =
  process.env.CELESTRAK_URL ||
  `https://celestrak.org/NORAD/elements/gp.php?GROUP=${DEFAULT_GROUP}&FORMAT=json`;
const DEFAULT_TLE_URL =
  process.env.CELESTRAK_TLE_URL ||
  `https://celestrak.org/NORAD/elements/gp.php?GROUP=${DEFAULT_GROUP}&FORMAT=tle`;
const REQUEST_TIMEOUT_MS = Number(process.env.CELESTRAK_TIMEOUT_MS || 30000);
const MAX_SATELLITES = Number(process.env.CELESTRAK_MAX_SATELLITES || 0);
const METADATA_PATH =
  process.env.SATELLITE_METADATA_PATH ||
  path.join(__dirname, "..", "resources", "satellite_data.json");
const SATNOGS_CONCURRENCY = Number(process.env.SATNOGS_CONCURRENCY || 5);
const REFRESH_INTERVAL_HOURS = Number(
  process.env.SATELLITE_REFRESH_INTERVAL_HOURS || 24
);
const FORCE_REFRESH =
  String(process.env.FORCE_SATELLITE_REFRESH || "false").toLowerCase() ===
  "true";
const DEFAULT_DESCRIPTION = "No description available.";

function numberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function coalesce(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function loadMetadata() {
  try {
    const raw = fs.readFileSync(METADATA_PATH, "utf8");
    if (!raw) {
      console.warn(
        `Metadata file ${METADATA_PATH} is empty; continuing with remote data only.`
      );
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(
        `Metadata file ${METADATA_PATH} is not an array; continuing with remote data only.`
      );
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn(
      `Failed to load metadata from ${METADATA_PATH}: ${error.message}. Continuing with remote data only.`
    );
    return [];
  }
}

function parseMetadataEntry(entry) {
  const satelliteId = Number(entry?.norad_id);
  if (!Number.isFinite(satelliteId)) {
    return null;
  }

  return {
    satellite_id: satelliteId,
    name: entry.name || null,
    object_id: entry.object_id || null,
    object_type: entry.object_type || null,
    status: entry.status || null,
    owner: entry.owner || null,
    launch_date: entry.launch_date || null,
    launch_site: entry.launch_site || null,
    revolution: numberOrNull(entry.revolution),
    inclination: numberOrNull(entry.inclination),
    farthest_orbit_distance: numberOrNull(entry.farthest_orbit_distance),
    lowest_orbit_distance: numberOrNull(entry.lowest_orbit_distance),
    rcs: numberOrNull(entry.RCS),
    description: entry.description || null,
    country_code: entry.owner || null,
  };
}

function mapSatellite(raw) {
  const perigee = coalesce(raw.PERIAPSIS, raw.PERIGEE, raw.PERIAPSIS_KM);
  const apogee = coalesce(raw.APOAPSIS, raw.APOGEE, raw.APOAPSIS_KM);
  const satelliteId = Number(raw.NORAD_CAT_ID);

  return {
    satellite_id: Number.isFinite(satelliteId) ? satelliteId : null,
    name: raw.OBJECT_NAME || null,
    inclination: numberOrNull(raw.INCLINATION),
    revolution: numberOrNull(raw.MEAN_MOTION),
    lowest_orbit_distance: numberOrNull(perigee),
    farthest_orbit_distance: numberOrNull(apogee),
    launch_date: raw.LAUNCH_DATE || null,
    launch_site: raw.SITE || null,
    owner: coalesce(raw.COUNTRY_CODE, raw.OPERATOR),
    tle_line1: raw.TLE_LINE1 || null,
    tle_line2: raw.TLE_LINE2 || null,
    epoch: raw.EPOCH || null,
    mean_motion_dot: numberOrNull(raw.MEAN_MOTION_DOT),
    mean_motion_ddot: numberOrNull(raw.MEAN_MOTION_DDOT),
    eccentricity: numberOrNull(raw.ECCENTRICITY),
    ra_of_asc_node: numberOrNull(raw.RA_OF_ASC_NODE),
    arg_of_pericenter: numberOrNull(raw.ARG_OF_PERICENTER),
    mean_anomaly: numberOrNull(raw.MEAN_ANOMALY),
    bstar: numberOrNull(raw.BSTAR),
    object_type: raw.OBJECT_TYPE || null,
    rcs: numberOrNull(raw.RCS_SIZE),
    country_code: raw.COUNTRY_CODE || null,
    object_id: raw.OBJECT_ID || null,
  };
}

function parseTleCatalog(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length);

  const catalog = new Map();

  for (let i = 0; i < lines.length; ) {
    let name = null;
    let line1 = null;
    let line2 = null;

    const current = lines[i];

    if (current.startsWith("1 ") || current.startsWith("2 ")) {
      line1 = current;
      line2 = lines[i + 1];
      i += 2;
    } else {
      name = current;
      line1 = lines[i + 1];
      line2 = lines[i + 2];
      i += 3;
    }

    if (!line1 || !line2 || !line1.startsWith("1 ") || !line2.startsWith("2 ")) {
      continue;
    }

    const idSegment = line1.substring(2, 7).trim();
    const satelliteId = Number.parseInt(idSegment, 10);
    if (!Number.isFinite(satelliteId)) {
      continue;
    }

    catalog.set(satelliteId, {
      name,
      line1,
      line2,
    });
  }

  return catalog;
}

async function fetchSatnogsMetadata(ids) {
  const uniqueIds = Array.from(
    new Set(ids.filter((id) => Number.isFinite(id)))
  );
  if (!uniqueIds.length) {
    return new Map();
  }

  const results = new Map();
  let index = 0;
  const concurrency = Math.max(1, SATNOGS_CONCURRENCY);

  async function worker() {
    while (index < uniqueIds.length) {
      const currentIndex = index;
      index += 1;
      const noradId = uniqueIds[currentIndex];
      try {
        const data = await fetchSatelliteDetails(noradId);
        if (data) {
          results.set(noradId, data);
        }
      } catch (error) {
        const message = error?.message || error;
        console.warn(`SatNOGS lookup failed for ${noradId}: ${message}`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fetchSatellites() {
  const [jsonResponse, tleResponse] = await Promise.all([
    axios.get(DEFAULT_URL, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "json",
    }),
    axios.get(DEFAULT_TLE_URL, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "text",
    }),
  ]);

  if (!Array.isArray(jsonResponse.data)) {
    throw new Error("Unexpected response from Celestrak API");
  }

  const slice =
    MAX_SATELLITES > 0
      ? jsonResponse.data.slice(0, MAX_SATELLITES)
      : jsonResponse.data;

  const tleCatalog = parseTleCatalog(tleResponse.data || "");

  return slice
    .map((raw) => {
      const record = mapSatellite(raw);
      const tle = tleCatalog.get(record.satellite_id);

      if (tle) {
        record.tle_line1 = record.tle_line1 || tle.line1;
        record.tle_line2 = record.tle_line2 || tle.line2;
        if (!record.name && tle.name) {
          record.name = tle.name;
        }
      }

      return record;
    })
    .filter((record) => record.satellite_id !== null && record.name);
}

function mergeMetadata(staticEntries, dynamicMap, satnogMap) {
  const metadataMap = new Map();
  const merged = [];

  for (const entry of staticEntries) {
    const parsed = parseMetadataEntry(entry);
    if (!parsed) continue;

    const dynamic = dynamicMap.get(parsed.satellite_id);
    const satnog = satnogMap.get(parsed.satellite_id);
    if (dynamic) {
      parsed.revolution = dynamic.revolution ?? parsed.revolution;
      parsed.inclination = dynamic.inclination ?? parsed.inclination;
      parsed.farthest_orbit_distance =
        dynamic.farthest_orbit_distance ?? parsed.farthest_orbit_distance;
      parsed.lowest_orbit_distance =
        dynamic.lowest_orbit_distance ?? parsed.lowest_orbit_distance;
      parsed.launch_date = dynamic.launch_date || parsed.launch_date;
      parsed.launch_site = dynamic.launch_site || parsed.launch_site;
      parsed.object_type = parsed.object_type || dynamic.object_type;
      parsed.country_code = parsed.country_code || dynamic.country_code;
    }

    if (satnog) {
      parsed.name = parsed.name || satnog.name || dynamic?.name || null;
      parsed.object_id =
        parsed.object_id || satnog.object_id || dynamic?.object_id || null;
      parsed.object_type =
        parsed.object_type || satnog.object_type || dynamic?.object_type || null;
      parsed.owner = satnog.owner || parsed.owner || dynamic?.owner || null;
      parsed.launch_site =
        parsed.launch_site || satnog.launch_site || dynamic?.launch_site || null;
      parsed.launch_date =
        parsed.launch_date || satnog.launch_date || dynamic?.launch_date || null;
      parsed.description = satnog.description || parsed.description || null;
      parsed.country_code =
        satnog.country_code || parsed.country_code || dynamic?.country_code || null;
      parsed.image_url = satnog.image_url || null;

      const statusMessage = satnog.status || parsed.status || null;
      const statusInfo = determineStatus(statusMessage);
      parsed.status = statusInfo.state;
      parsed.status_message = statusMessage || null;
    } else {
      parsed.name = parsed.name || dynamic?.name || null;
      parsed.owner = parsed.owner || dynamic?.owner || null;
      parsed.description = parsed.description || null;
      parsed.country_code = parsed.country_code || dynamic?.country_code || null;
      parsed.image_url = null;

      const fallbackStatus = parsed.status || null;
      const statusInfo = determineStatus(fallbackStatus);
      parsed.status = statusInfo.state;
      parsed.status_message = fallbackStatus || null;
    }

    parsed.description = parsed.description || DEFAULT_DESCRIPTION;

    metadataMap.set(parsed.satellite_id, parsed);
    merged.push(parsed);
  }

  for (const [satelliteId, dynamic] of dynamicMap.entries()) {
    if (metadataMap.has(satelliteId)) continue;

    const satnog = satnogMap.get(satelliteId);
    const statusMessage = satnog?.status || null;
    const statusInfo = determineStatus(statusMessage);

    merged.push({
      satellite_id: satelliteId,
      name: dynamic.name || satnog?.name || `Satellite ${satelliteId}`,
      object_id: dynamic.object_id || satnog?.object_id || null,
      object_type: dynamic.object_type || satnog?.object_type || null,
      status: statusInfo.state,
      status_message: statusMessage || null,
      owner: satnog?.owner || dynamic.owner || null,
      launch_date: dynamic.launch_date || satnog?.launch_date || null,
      launch_site: dynamic.launch_site || satnog?.launch_site || null,
      revolution: dynamic.revolution,
      inclination: dynamic.inclination,
      farthest_orbit_distance: dynamic.farthest_orbit_distance,
      lowest_orbit_distance: dynamic.lowest_orbit_distance,
      rcs: dynamic.rcs,
      description:
        satnog?.description || DEFAULT_DESCRIPTION,
      country_code: satnog?.country_code || dynamic.country_code || null,
      image_url: satnog?.image_url || null,
    });
  }

  return merged;
}

async function ensureImages(mergedRecords, satnogMap) {
  for (const record of mergedRecords) {
    const satnog = satnogMap.get(record.satellite_id);
    // eslint-disable-next-line no-await-in-loop
    const localImage = await ensureLocalImage(record, satnog, {
      timeoutMs: REQUEST_TIMEOUT_MS,
    });

    if (localImage) {
      record.image_url = localImage;
    } else if (record.image_url && !record.image_url.startsWith("/images/")) {
      record.image_url = null;
    }
  }
}

function runAsync(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function callback(err) {
      if (err) {
        return reject(err);
      }
      resolve(this);
    });
  });
}

function runBatch(database, sql, rows) {
  return new Promise((resolve, reject) => {
    if (!rows.length) {
      return resolve();
    }

    let hasErrored = false;

    const statement = database.prepare(sql, (prepareErr) => {
      if (prepareErr) {
        hasErrored = true;
        return reject(prepareErr);
      }

      let pending = rows.length;

      const finalize = (err) => {
        statement.finalize((finalizeErr) => {
          if (err) {
            reject(err);
          } else if (finalizeErr) {
            reject(finalizeErr);
          } else {
            resolve();
          }
        });
      };

      rows.forEach((params) => {
        statement.run(params, (runErr) => {
          if (runErr && !hasErrored) {
            hasErrored = true;
            return finalize(runErr);
          }

          if (!hasErrored) {
            pending -= 1;
            if (pending === 0) {
              finalize();
            }
          }
        });
      });
    });
  });
}

function fetchExistingImages(database) {
  return new Promise((resolve, reject) => {
    database.all(
      "SELECT satellite_id, image_url FROM satellites",
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

async function persistMetadata(records) {
  const database = db.getDatabase();

  try {
    await runAsync(database, "BEGIN IMMEDIATE TRANSACTION");
    const existingImageRows = await fetchExistingImages(database).catch(() => []);
    const existingImages = new Map(
      existingImageRows.map((row) => [row.satellite_id, row.image_url])
    );
    await runAsync(database, "DELETE FROM satellites");

    const insertSql = `
      INSERT INTO satellites (
        satellite_id,
        name,
        object_id,
        object_type,
        status,
        status_message,
        owner,
        launch_date,
        launch_site,
        revolution,
        inclination,
        farthest_orbit_distance,
        lowest_orbit_distance,
        rcs,
        description,
        country_code,
        image_url,
        updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
      );
    `;

    const metadataRows = records.map((record) => {
      const existingImage = existingImages.get(record.satellite_id) || null;
      const hasLocalImage =
        existingImage && existingImage.startsWith("/images/");
      const imageUrl = hasLocalImage
        ? existingImage
        : record.image_url || existingImage || null;

      return [
        record.satellite_id,
        record.name,
        record.object_id,
        record.object_type,
        record.status,
        record.status_message || null,
        record.owner,
        record.launch_date,
        record.launch_site,
        record.revolution,
        record.inclination,
        record.farthest_orbit_distance,
        record.lowest_orbit_distance,
        record.rcs,
        record.description || DEFAULT_DESCRIPTION,
        record.country_code,
        imageUrl,
      ];
    });

    await runBatch(database, insertSql, metadataRows);

    await runAsync(database, "COMMIT");
  } catch (error) {
    await runAsync(database, "ROLLBACK").catch(() => {});
    throw error;
  }
}

async function persistTle(records) {
  const database = db.getDatabase();

  try {
    await runAsync(database, "BEGIN IMMEDIATE TRANSACTION");
    await runAsync(database, "DELETE FROM satellite_data");

    const insertSql = `
      INSERT INTO satellite_data (
        satellite_id,
        tle_line1,
        tle_line2,
        epoch,
        mean_motion_dot,
        mean_motion_ddot,
        eccentricity,
        ra_of_asc_node,
        arg_of_pericenter,
        mean_anomaly,
        bstar,
        updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
      );
    `;

    const tleRows = records.map((record) => [
      record.satellite_id,
      record.tle_line1,
      record.tle_line2,
      record.epoch,
      record.mean_motion_dot,
      record.mean_motion_ddot,
      record.eccentricity,
      record.ra_of_asc_node,
      record.arg_of_pericenter,
      record.mean_anomaly,
      record.bstar,
    ]);

    await runBatch(database, insertSql, tleRows);

    await runAsync(database, "COMMIT");
  } catch (error) {
    await runAsync(database, "ROLLBACK").catch(() => {});
    throw error;
  }
}

async function getLastUpdatedAt(tableName) {
  try {
    const result = await db.query(
      `SELECT MAX(updated_at) AS last_updated FROM ${tableName}`
    );
    const value = result?.rows?.[0]?.last_updated;
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.warn(`Failed to read last updated timestamp for ${tableName}:`, error);
    return null;
  }
}

async function shouldSkipUpdate() {
  if (FORCE_REFRESH) {
    return false;
  }

  const [satUpdated, tleUpdated] = await Promise.all([
    getLastUpdatedAt("satellites"),
    getLastUpdatedAt("satellite_data"),
  ]);

  const latest = [satUpdated, tleUpdated]
    .filter((date) => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  if (!latest) {
    return false;
  }

  const ageHours = (Date.now() - latest.getTime()) / (1000 * 60 * 60);
  return ageHours < REFRESH_INTERVAL_HOURS;
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] Refreshing satellite catalogue from Celestrak...`);

  try {
    if (await shouldSkipUpdate()) {
      console.log(
        `Last update was performed less than ${REFRESH_INTERVAL_HOURS} hours ago. Skipping refresh.`
      );
      return;
    }

    const [dynamicSatellites, staticMetadata] = await Promise.all([
      fetchSatellites(),
      Promise.resolve(loadMetadata()),
    ]);

    console.log(`Fetched ${dynamicSatellites.length} satellites from Celestrak.`);
    const satnogIds = dynamicSatellites
      .map((sat) => sat.satellite_id)
      .filter((id) => Number.isFinite(id));
    console.log(
      `Fetching SatNOGS metadata for ${satnogIds.length} tracked satellites...`
    );
    const satnogMap = await fetchSatnogsMetadata(satnogIds);
    console.log(`Fetched ${satnogMap.size} SatNOGS metadata records.`);

    const dynamicMap = new Map(
      dynamicSatellites.map((sat) => [sat.satellite_id, sat])
    );
    const mergedMetadata = mergeMetadata(staticMetadata, dynamicMap, satnogMap);
    await ensureImages(mergedMetadata, satnogMap);
    const tleRecords = dynamicSatellites.filter(
      (record) => record.tle_line1 && record.tle_line2
    );

    console.log(`Persisting ${mergedMetadata.length} metadata records.`);
    await persistMetadata(mergedMetadata);

    console.log(`Persisting ${tleRecords.length} TLE records.`);
    await persistTle(tleRecords);

    console.log(
      `SQLite database updated at ${db.databasePath} with ${tleRecords.length} tracked satellites.`
    );
  } catch (error) {
    console.error("Failed to refresh satellite data", error);
    process.exitCode = 1;
  } finally {
    try {
      await db.close();
    } catch (error) {
      console.error("Error closing sqlite connection", error);
    }
  }
}

main();
