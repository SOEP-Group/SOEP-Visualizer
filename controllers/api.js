const pool = require("../db");
const { scalePosition } = require("../public/js/utils/utils");

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
