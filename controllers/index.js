const { mockSatelliteData, mockOrbitData } = require("../mockData.js");
const pool = require("../db");
const { scalePosition } = require("../public/js/utils/utils");
const path = require("path");
const fs = require("fs");

exports.Home = async function (req, res) {
  // We embedd the svg, which allows us to do stuff like svg animation
  const svgPath = path.join(__dirname, "../public/images/logo/logo.svg");
  const svgContent = fs.readFileSync(svgPath, "utf8");

  const animatedSvgPath = path.join(
    __dirname,
    "../public/images/logo/animated_logo.svg"
  );
  const animatedSvgContent = fs.readFileSync(animatedSvgPath, "utf8");
  return res.render("index", {
    logo: svgContent,
    animated_logo: animatedSvgContent,
  });
};

// New controller function to render the template with data
exports.RenderSatellite = async function (req, res) {
  const satelliteId = req.params.id;

  try {
    const query = `
      SELECT * FROM satellites WHERE satellite_id = ${satelliteId};
    `;

    const result = await pool.query(query);
    if (result.rows.length > 0) {
      res.render("satellite", result.rows[0], (err, html) => {
        if (err) {
          console.error("Error rendering satellite view:", err);
          res.status(500).send("Server Error");
        } else {
          res.send({ body: html });
        }
      });
    } else {
      res.status(404).json({ error: "Satellite not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};

exports.getOrbitData = async (req, res) => {
  const satelliteId = req.params.id;

  const closestTimestampQuery = `
    SELECT timestamp, x_km, y_km, z_km, xdot_km_per_s, ydot_km_per_s, zdot_km_per_s
    FROM satellite_data
    WHERE satellite_id = $1
    ORDER BY ABS(EXTRACT(EPOCH FROM (timestamp - NOW()))) ASC
    LIMIT 1;
  `;

  const orbitDataQuery = `
    SELECT timestamp, x_km, y_km, z_km, xdot_km_per_s, ydot_km_per_s, zdot_km_per_s
    FROM satellite_data 
    WHERE satellite_id = $1
      AND timestamp >= $2
      AND timestamp <= $2 + interval '1 second' * $3
    ORDER BY timestamp ASC;
  `;

  try {
    const closestTimestampResult = await pool.query(closestTimestampQuery, [
      satelliteId,
    ]);
    if (closestTimestampResult.rows.length === 0) {
      return res.status(404).json({ error: "Satellite not found" });
    }

    const row = closestTimestampResult.rows[0];
    const timestamp = row.timestamp;
    const orbitalRadius = Math.sqrt(
      Math.pow(row.x_km, 2) + Math.pow(row.y_km, 2) + Math.pow(row.z_km, 2)
    );
    const totalSpeed = Math.sqrt(
      Math.pow(row.xdot_km_per_s, 2) +
        Math.pow(row.ydot_km_per_s, 2) +
        Math.pow(row.zdot_km_per_s, 2)
    );
    const orbitalPeriodSeconds =
      (2 * Math.PI * orbitalRadius) / totalSpeed + 60;
    const orbitDataResult = await pool.query(orbitDataQuery, [
      satelliteId,
      timestamp,
      orbitalPeriodSeconds,
    ]);

    if (orbitDataResult.rows.length > 0) {
      const transformedRows = orbitDataResult.rows.map((row) => {
        const transformedRow = {
          id: satelliteId,
          timestamp: row.timestamp,
          position: {
            x: row.x_km,
            y: row.y_km,
            z: row.z_km,
          },
        };

        transformedRow.position = scalePosition(transformedRow.position);
        return transformedRow;
      });

      res.json(transformedRows);
    } else {
      res
        .status(404)
        .json({ error: "No orbit data found for the given period" });
    }
  } catch (err) {
    console.error("Error fetching orbit data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
