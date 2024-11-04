const pool = require("../db");
const { scalePosition } = require("../public/js/utils/utils");

const fakeSatelliteData = [
  { id: "satellite_1", position: { x: 2500, y: -1000, z: 1000 } },
  { id: "satellite_2", position: { x: -2000, y: 2000, z: 2000 } },
  { id: "satellite_3", position: { x: 3000, y: 3000, z: -1500 } },
  { id: "satellite_4", position: { x: 3789, y: 2012, z: -5277 } },
];

// Temp
exports.getAllSatellites = function (req, res) {
  // pool.query('SELECT * FROM satellites')
  //   .then(result => {
  //     res.json(result.rows);
  //   })
  //   .catch(err => {
  //     console.error('Error fetching satellites:', err);
  //     res.status(500).send('Error fetching satellites.');
  //   });

  // Use this for now, for the love of god why were there so many different ways to fetch satellites
  const scaledSatellites = fakeSatelliteData.map((satellite) => ({
    ...satellite,
    position: scalePosition(satellite.position),
  }));

  setTimeout(() => {
    res.json(scaledSatellites);
  }, 500);
};
