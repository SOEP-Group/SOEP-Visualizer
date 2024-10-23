const { time } = require('console');
const path = require('path');

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

const mockSatelliteData = {
    'satellite_1': {
        name: 'Satellite Alpha',
        speed: 'Super fast',
        position: 'N 6504089, E 278978',
        launchDate: '2020-01-01',
    },
    'satellite_2': {
        name: 'Satellite Beta',
        speed: 'Super fast',
        position: 'N 5489223, E 854213',
        launchDate: '2021-05-15',
    },
    'satellite_3': {
        name: 'Satellite C',
        speed: 'Super fast',
        position: 'N 5648215, E 458512',
        launchDate: '2022-12-15',
    },
};

exports.getSatelliteInfo = (req, res) => {
  const satelliteId = req.params.id;
  // Fetch real satellite data in future
  // time.sleep
  // const satelliteData = mockSatelliteData[satelliteId]
  // if (satelliteData) {
  //     res.json(satelliteData);
  // } else {
  //   res.status(404).json({ error: 'Satellite not found' });
  // }
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  delay(2000).then(() => {
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