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
