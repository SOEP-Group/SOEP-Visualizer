const { mockSatelliteData, mockOrbitData } = require("../mockData.js");

exports.Home = async function (req, res) {
  return res.render("index");
};

// New controller function to render the template with data
exports.RenderSatellite = async function (req, res) {
  const satelliteId = req.params.id;
  // Fetch real satellite data in future
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  delay(1000)
    .then(() => {
      const satelliteData = mockSatelliteData[satelliteId];
      if (satelliteData) {
        res.render("satellite", satelliteData, (err, html) => {
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
    })
    .catch((error) => {
      console.error("Error in delay:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};


exports.getOrbitData = (req, res) => {
  const satelliteId = req.params.id;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  delay(200).then(() => {
      let orbitData = null;
      mockOrbitData.forEach((satelliteData) => {
          if (satelliteData.satelliteName === satelliteId) {
              orbitData = satelliteData.orbit.map((point) => {
                  return {
                      ...point,
                      position: scalePosition(point.position)
                  };
              });
          }
      });
      if (orbitData) {
          res.json(orbitData);
      } else {
          res.status(404).json({ error: 'Satellite not found' });
      }
  }).catch(error => {
      console.error('Error in delay:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  });
};

