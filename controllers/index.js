const path = require('path');

// Existing controllers
exports.Home = async function(req, res) {
  return res.render("index");
}

exports.Dynamic = async function(req, res) {
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
