const db = require("../db");
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
      SELECT * FROM satellites WHERE satellite_id = ?;
    `;

    const result = await db.query(query, [satelliteId]);
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
