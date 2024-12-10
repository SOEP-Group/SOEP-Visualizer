const pool = require("../db");

exports.getAllSatellites = async function (req, res) {
  // Suck it Alpha
  try {
    const query = `
    SELECT sd.*, s.name
    FROM satellite_data sd
    JOIN satellites s ON s.satellite_id = sd.satellite_id;
  `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};

exports.getFilterData = async function (req, res) {
  try {
    const query = `
      SELECT 
        MIN(revolution) AS min_revolution, MAX(revolution) AS max_revolution,
        MIN(inclination) AS min_inclination, MAX(inclination) AS max_inclination,
        MIN(lowest_orbit_distance) AS min_orbit_distance, MAX(farthest_orbit_distance) AS max_orbit_distance,
        ARRAY_AGG(DISTINCT launch_site) AS launch_sites,
        ARRAY_AGG(DISTINCT owner) AS owners
      FROM satellites;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};
