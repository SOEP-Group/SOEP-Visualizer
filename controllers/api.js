const pool = require("../db");
const { scalePosition } = require("../public/js/utils/utils");
const axios = require("axios");

exports.getAllSatellites = async function (req, res) {
  // Suck it Alpha
  try {
    const query = `
    SELECT DISTINCT ON (satellite_id) 
      satellite_id, timestamp, x_km, y_km, z_km, xdot_km_per_s, ydot_km_per_s, zdot_km_per_s
    FROM satellite_data
    ORDER BY satellite_id, ABS(EXTRACT(EPOCH FROM (timestamp - NOW()))) ASC;
  `; // Closest timestamp to today
    let query_start_timestamp = Date.now();
    console.log("Getting satellites");
    const result = await pool.query(query);
    console.log(`Query took ${Date.now() - query_start_timestamp}ms`);
    let transform_start_timestamp = Date.now();
    const transformedRows = result.rows.map((row) => {
      const transformedRow = {
        id: row.satellite_id,
        timestamp: row.timestamp,
        position: {
          x: row.x_km,
          y: row.y_km,
          z: row.z_km,
        },
        speed: {
          x: row.xdot_km_per_s,
          y: row.ydot_km_per_s,
          z: row.zdot_km_per_s,
        },
      };
      transformedRow.position = scalePosition(transformedRow.position);
      transformedRow.speed = scalePosition(transformedRow.speed);
      return transformedRow;
    });
    console.log(
      `Transformation took ${Date.now() - transform_start_timestamp}ms`
    );
    res.json(transformedRows);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};

exports.getBodyEvents = async function (req, res) {
  const { body } = req.params;
  const { latitude, longitude } = req.query;
  const apiKey = process.env.ASTRONOMY_API_KEY;
  const apiSecret = process.env.ASTRONOMY_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: "API credentials are missing" });
  }

  const params = {
    // Default to San Francisco
    latitude: 37.7749, // 37.7749,
    longitude: -122.4194, // -122.4194,
    elevation: 10,
    from_date: new Date().toISOString().split("T")[0],
    to_date: new Date().toISOString().split("T")[0],
    time: "00:00:00",
  };

  // const params = {
  //   // Default to San Francisco
  //   latitude: parseFloat(latitude), // 37.7749,
  //   longitude: parseFloat(longitude), // -122.4194,
  //   elevation: 10,
  //   from_date: new Date().toISOString().split("T")[0],
  //   to_date: new Date().toISOString().split("T")[0],
  //   time: "00:00:00",
  // };

  try {
    const encodedCredentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await axios.get(
      `https://api.astronomyapi.com/api/v2/bodies/events/${body}`,
      {
        params,
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
      }
    );

    const { data } = response.data;

    console.log(JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events from AstronomyAPI" });
  }
};