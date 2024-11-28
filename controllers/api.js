const pool = require("../db");
const axios = require("axios");

exports.getAllSatellites = async function (req, res) {
  // Suck it Alpha
  try {
    const query = `
    SELECT *
    FROM satellite_data;
  `;
    const result = await pool.query(query);
    res.json(result.rows);
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