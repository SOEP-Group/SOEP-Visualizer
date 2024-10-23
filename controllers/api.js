const pool = require('../db');

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
  