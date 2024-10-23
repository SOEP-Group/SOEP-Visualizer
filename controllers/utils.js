var SunCalc = require("suncalc");

exports.getSunsPosition = async function (req, res) {
  const now = new Date();
  const sunPos = SunCalc.getPosition(now, 0.0, 0.0);
  res.json({ ...sunPos });
};
