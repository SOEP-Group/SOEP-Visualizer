const { mockSatelliteData, mockOrbitData } = require("../mockData.js");
const pool = require("../db");

exports.Home = async function (req, res) {
  return res.render("index");
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
