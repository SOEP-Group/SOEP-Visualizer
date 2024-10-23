const { time } = require('console');
const path = require('path');
const pool = require('../db');
const { mockSatelliteData, mockOrbitData } = require('../mockData.js');



exports.Home = async function(req, res){
  return res.render("index"); 
}

exports.Dynamic = async function(req, res){
  // process.env.INIT_CWD is the root folder
  return res.sendFile(path.join(process.env.INIT_CWD, 'views/test.html')); 
}

// New controller function to render the template with data
exports.RenderSatellite = async function(req, res) {
  // Example data to pass to the EJS template
  const satelliteData = {
    name: 'Hubble Space Telescope',
    launchDate: 'April 24, 1990',
    orbitType: 'Low Earth Orbit'
  };

  // Render the EJS template (e.g., satellite.ejs) with the data
  res.render('satellite', satelliteData); // Ensure 'satellite.ejs' is inside the 'views' folder
}

exports.getSatelliteInfo = (req, res) => {
  const satelliteId = req.params.id;
  // Fetch real satellite data in future
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  delay(1000).then(() => {
    const satelliteData = mockSatelliteData[satelliteId];
    if (satelliteData) {
        res.json(satelliteData);
    } else {
        res.status(404).json({ error: 'Satellite not found' });
    }
  }).catch(error => {
    console.error('Error in delay:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};

exports.getOrbitData = (req, res) => {
  const satelliteId = req.params.id;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  delay(200).then(() => {
    let orbitData = null
    mockOrbitData.forEach((satelliteData) => {
      if (satelliteData.satelliteName === satelliteId) {
        orbitData = satelliteData.orbit;
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

// Temp
exports.getAllSatellites = function (req, res) {
  pool.query('SELECT * FROM satellites')
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error('Error fetching satellites:', err);
      res.status(500).send('Error fetching satellites.');
    });
};

