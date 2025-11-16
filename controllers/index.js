const db = require("../db");
const path = require("path");
const fs = require("fs");
const { fetchSatelliteDetails } = require("../services/satnogs");
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

  async function renderRecord(record) {
    const statusInfo = determineStatus(record?.status);
    const model = {
      status_state: statusInfo.state,
      status_label: statusInfo.label,
      image_url: null,
      ...record,
    };
    return new Promise((resolve, reject) => {
      res.render("satellite", model, (err, html) => {
        if (err) return reject(err);
        resolve(html);
      });
    });
  }

  async function renderResponse(record) {
    try {
      const html = await renderRecord(record);
      res.send({ body: html });
    } catch (error) {
      console.error("Error rendering satellite view:", error);
      res.status(500).json({ error: "Server Error" });
    }
  }

  async function fallbackToDatabase() {
    const query = `
      SELECT * FROM satellites WHERE satellite_id = ?;
    `;
    const result = await db.query(query, [satelliteId]);
    if (!result.rows.length) {
      return null;
    }
    return result.rows[0];
  }

  try {
    const satnogsRecord = await fetchSatelliteDetails(satelliteId);
    return renderResponse(satnogsRecord);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: "Invalid satellite id" });
    }

    const contextMessage =
      error.statusCode === 404
        ? "SatNOGS did not have data for this satellite; attempting local fallback."
        : `SatNOGS lookup failed for satellite ${satelliteId}, falling back to local data.`;

    console.warn(contextMessage, error.message || error);

    try {
      const localRecord = await fallbackToDatabase();
      if (localRecord) {
        return renderResponse(localRecord);
      }
      return res.status(404).json({ error: "Satellite not found" });
    } catch (dbError) {
      console.error("Failed to fetch satellite from fallback database:", dbError);
      return res.status(500).json({ error: "Failed to load satellite" });
    }
  }
};
