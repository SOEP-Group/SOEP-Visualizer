const db = require("../db");
const path = require("path");
const fs = require("fs");
const { determineStatus } = require("../utils/status");

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
      SELECT * FROM satellites WHERE satellite_id = ?;
    `;
    const result = await db.query(query, [satelliteId]);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Satellite not found" });
    }

    const record = result.rows[0];
    const statusInfo = determineStatus(
      record.status_message || record.status || null
    );
    const model = {
      ...record,
      status_state: statusInfo.state,
      status_label: record.status_message || statusInfo.label,
      image_url: record.image_url || null,
      description: record.description || "No description available.",
    };

    res.render("satellite", model, (err, html) => {
      if (err) {
        console.error("Error rendering satellite view:", err);
        return res.status(500).json({ error: "Server Error" });
      }
      res.send({ body: html });
    });
  } catch (err) {
    console.error("Failed to load satellite from database:", err);
    res.status(500).json({ error: err.stack });
  }
};
