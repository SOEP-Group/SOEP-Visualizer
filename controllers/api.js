const pool = require("../db");

function scalePosition(satellitePosition) {
  const scaleFactor = 1 / (6378 * 2); // 1 unit is 6,378 (earth equatorial radius) *2 km
  const scaledPosition = {
    x: satellitePosition.x * scaleFactor,
    y: satellitePosition.y * scaleFactor,
    z: satellitePosition.z * scaleFactor,
  };

  // Calculate absolut distance from center
  let distanceFromCenter = Math.sqrt(
    scaledPosition.x ** 2 + scaledPosition.y ** 2 + scaledPosition.z ** 2
  );

  // Sets minimal distance if too close
  const minimalDist = 0.54;
  if (distanceFromCenter < minimalDist) {
    const scalingAdjustment = minimalDist / distanceFromCenter;
    scaledPosition.x *= scalingAdjustment;
    scaledPosition.y *= scalingAdjustment;
    scaledPosition.z *= scalingAdjustment;
  }

  return scaledPosition;
}

exports.getAllSatellites = async function (req, res) {
  // Suck it Alpha
  try {
    const query = `
      SELECT DISTINCT ON (satellite_id) 
        satellite_id, timestamp, x_km, y_km, z_km, xdot_km_per_s, ydot_km_per_s, zdot_km_per_s
      FROM satellite_data
      ORDER BY satellite_id, timestamp DESC;
    `;

    const result = await pool.query(query);

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
      return transformedRow;
    });
    res.json(transformedRows);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};
