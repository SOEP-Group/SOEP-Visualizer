const { time } = require('console');
const path = require('path');

exports.Home = async function(req, res){
  return res.render("index"); 
}

exports.Dynamic = async function(req, res){
  // process.env.INIT_CWD is the root folder
  return res.sendFile(path.join(process.env.INIT_CWD, 'views/test.html')); 
}


const mockSatelliteData = {
  'satellite_1': {
      name: 'Satellite Alpha',
      launchDate: '2020-01-01',
      orbitData: [
          { x: 0.5, y: -1.0, z: 0.1 },   // Initial position (matches the existing format)
          { x: 1.2, y: -0.8, z: 0.3 },   // Subsequent positions forming a simple orbit
          { x: 1.8, y: -0.3, z: 0.5 },
          { x: 1.5, y: 0.5, z: 0.7 },
          { x: 0.8, y: 1.0, z: 0.5 },
          { x: 0.0, y: 1.2, z: 0.2 },
          { x: -0.5, y: 0.7, z: 0.0 },
          { x: -0.8, y: -0.3, z: -0.1 },
          { x: -0.5, y: -1.0, z: -0.2 },
          { x: 0.5, y: -1.0, z: 0.1 }    // Completing the orbit loop
      ]
  },
  'satellite_2': {
      name: 'Satellite Beta',
      launchDate: '2021-05-15',
      orbitData: [
          { x: -2.0, y: 0.2, z: 0.2 },   // Initial position
          { x: -1.5, y: 0.5, z: 0.5 },
          { x: -1.0, y: 1.0, z: 0.7 },
          { x: -0.5, y: 1.5, z: 0.4 },
          { x: 0.2, y: 1.8, z: 0.0 },
          { x: 1.0, y: 1.5, z: -0.3 },
          { x: 1.5, y: 0.8, z: -0.5 },
          { x: 1.8, y: 0.0, z: -0.2 },
          { x: 1.0, y: -0.5, z: 0.1 },
          { x: -2.0, y: 0.2, z: 0.2 }    // Completing the orbit loop
      ]
  },
  'satellite_3': {
      name: 'Satellite Gamma',
      launchDate: '2022-12-15',
      orbitData: [
          { x: 0.3, y: 0.3, z: -1.5 },   // Initial position
          { x: 0.7, y: 0.8, z: -1.2 },
          { x: 1.2, y: 1.2, z: -0.8 },
          { x: 1.7, y: 1.0, z: -0.3 },
          { x: 2.0, y: 0.5, z: 0.0 },
          { x: 1.7, y: -0.2, z: 0.3 },
          { x: 1.0, y: -0.7, z: 0.5 },
          { x: 0.5, y: -1.0, z: 0.2 },
          { x: 0.0, y: -1.3, z: -0.5 },
          { x: 0.3, y: 0.3, z: -1.5 }    // Completing the orbit loop
      ]
  }
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
