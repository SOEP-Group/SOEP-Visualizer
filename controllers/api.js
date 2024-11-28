const pool = require("../db");
const { scalePosition } = require("../public/js/utils/utils");

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
