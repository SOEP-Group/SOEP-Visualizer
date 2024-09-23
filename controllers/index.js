const path = require('path');

exports.Home = async function(req, res){
  return res.render("index"); 
}

exports.Dynamic = async function(req, res){
  // process.env.INIT_CWD is the root folder
  return res.sendFile(path.join(process.env.INIT_CWD, 'views/test.html')); 
}

// exports.Popup = async function(req, res){
//   return res.sendFile(path.join(process.env.INIT_CWD, 'views/popup.html')); 
// }


// const mockSatelliteData = {
//     'satellite_69': {
//         name: 'Satellite Alpha',
//         launchDate: '2020-01-01',
//     },
//     'satellite_2': {
//         name: 'Satellite Beta',
//         launchDate: '2021-05-15',
//     },
//     'satellite_3': {
//         name: 'Satellite C',
//         launchDate: '2022-12-15',
//     },
// };

// exports.getSatelliteInfo = (req, res) => {
//   const satelliteId = req.params.id;
//   // Fetch real satellite data in future
//   const satelliteData = mockSatelliteData[satelliteId]
//   console.log("HI");
//   if (satelliteData) {
//       res.json(satelliteData);
//   } else {
//     res.status(404).json({ error: 'Satellite not found' });
//   }
// };