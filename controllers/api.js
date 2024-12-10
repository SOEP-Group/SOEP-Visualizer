const pool = require("../db");
const Astronomy = require("astronomy-engine");

exports.getAllSatellites = async function (req, res) {
  // Suck it Alpha
  try {
    const query = `
    SELECT sd.*, s.name
    FROM satellite_data sd
    JOIN satellites s ON s.satellite_id = sd.satellite_id;
  `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};

exports.getBodyEvents = async function (req, res) {
  const { body } = req.params;
  const { latitude, longitude } = req.query;

  // Default is San Francisco
  const observer = new Astronomy.Observer(
    parseFloat(latitude) || 37.7749,
    parseFloat(longitude) || -122.4194,
    10 // Elevation in meters
  );

  const date = new Date();

  try {
    const bodyName =
      body.charAt(0).toUpperCase() + body.slice(1).toLowerCase();
    const validBodies = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
    ];

    if (!validBodies.includes(bodyName)) {
      return res
        .status(400)
        .json({ error: `Invalid celestial body: ${body}` });
    }

    const startTime = new Astronomy.AstroTime(date);
    const limitDays = 365; // Days

    // Common events for all bodies
    const riseEvent = Astronomy.SearchRiseSet(
      bodyName,
      observer,
      +1,
      startTime,
      limitDays
    );
    const setEvent = Astronomy.SearchRiseSet(
      bodyName,
      observer,
      -1,
      startTime,
      limitDays
    );
    const culminationEvent = Astronomy.SearchHourAngle(
      bodyName,
      observer,
      0.0,
      startTime,
      limitDays
    );

    const data = {
      rise: riseEvent ? riseEvent.date.toISOString() : null,
      set: setEvent ? setEvent.date.toISOString() : null,
      culmination: culminationEvent
        ? culminationEvent.time.date.toISOString()
        : null,
    };

    // Moon
    if (bodyName === "Moon") {
      const moonPhaseAngle = Astronomy.MoonPhase(startTime);
      const nextNewMoon = Astronomy.SearchMoonPhase(0, startTime, 40);
      const nextFirstQuarter = Astronomy.SearchMoonPhase(90, startTime, 40);
      const nextFullMoon = Astronomy.SearchMoonPhase(180, startTime, 40);
      const nextLastQuarter = Astronomy.SearchMoonPhase(270, startTime, 40);

      // Lunar Eclipses
      let nextLunarEclipse = null;
      try {
        nextLunarEclipse = Astronomy.SearchLunarEclipse(startTime);
      } catch (e) {
        console.error("No lunar eclipse found:", e);
      }

      // Lunar Perigee and Apogee
      const nextLunarApsis = Astronomy.SearchLunarApsis(startTime);

      data.moonPhaseAngle = moonPhaseAngle;
      data.nextNewMoon = nextNewMoon
        ? nextNewMoon.date.toISOString()
        : null;
      data.nextFirstQuarter = nextFirstQuarter
        ? nextFirstQuarter.date.toISOString()
        : null;
      data.nextFullMoon = nextFullMoon
        ? nextFullMoon.date.toISOString()
        : null;
      data.nextLastQuarter = nextLastQuarter
        ? nextLastQuarter.date.toISOString()
        : null;
      data.nextLunarEclipse = nextLunarEclipse
        ? {
            kind: nextLunarEclipse.kind,
            date: nextLunarEclipse.peak.date.toISOString(),
          }
        : null;
      data.nextLunarApsis = nextLunarApsis
        ? {
            kind: nextLunarApsis.kind,
            date: nextLunarApsis.time.date.toISOString(),
            distanceKm: nextLunarApsis.dist_km,
          }
        : null;
    }

    // Sun
    if (bodyName === "Sun") {
      // Twilight Times
      const limitDaysTwilight = 1; // Search within the next day

      // Civil Twilight (-6 degrees)
      const civilDawn = Astronomy.SearchAltitude(
        "Sun",
        observer,
        +1,
        startTime,
        limitDaysTwilight,
        -6.0
      );
      const civilDusk = Astronomy.SearchAltitude(
        "Sun",
        observer,
        -1,
        startTime,
        limitDaysTwilight,
        -6.0
      );

      // Nautical Twilight (-12 degrees)
      const nauticalDawn = Astronomy.SearchAltitude(
        "Sun",
        observer,
        +1,
        startTime,
        limitDaysTwilight,
        -12.0
      );
      const nauticalDusk = Astronomy.SearchAltitude(
        "Sun",
        observer,
        -1,
        startTime,
        limitDaysTwilight,
        -12.0
      );

      // Astronomical Twilight (-18 degrees)
      const astroDawn = Astronomy.SearchAltitude(
        "Sun",
        observer,
        +1,
        startTime,
        limitDaysTwilight,
        -18.0
      );
      const astroDusk = Astronomy.SearchAltitude(
        "Sun",
        observer,
        -1,
        startTime,
        limitDaysTwilight,
        -18.0
      );

      // Solar Eclipses
      let nextSolarEclipse = null;
      try {
        nextSolarEclipse = Astronomy.SearchGlobalSolarEclipse(startTime);
      } catch (e) {
        console.error("No solar eclipse found:", e);
      }

      data.nextSolarEclipse = nextSolarEclipse
        ? {
            kind: nextSolarEclipse.kind,
            date: nextSolarEclipse.peak.date.toISOString(),
          }
        : null;
    }

    // /*** Additional Events for Planets ***/
    // if (["Mercury", "Venus"].includes(bodyName)) {
    //   // Maximum Elongation
    //   let nextMaxElongation = null;
    //   try {
    //     nextMaxElongation = Astronomy.SearchMaxElongation(
    //       bodyName,
    //       startTime
    //     );
    //   } catch (e) {
    //     console.error("No maximum elongation found:", e);
    //   }

    //   data.nextMaxElongation = nextMaxElongation
    //     ? {
    //         date: nextMaxElongation.time.date.toISOString(),
    //         elongation: nextMaxElongation.elongation,
    //         visibility: nextMaxElongation.visibility,
    //       }
    //     : null;

    //   // Inferior and Superior Conjunctions
    //   const nextInferiorConjunction =
    //     Astronomy.SearchRelativeLongitude(bodyName, 0.0, startTime);
    //   const nextSuperiorConjunction =
    //     Astronomy.SearchRelativeLongitude(bodyName, 180.0, startTime);

    //   data.nextInferiorConjunction = nextInferiorConjunction
    //     ? nextInferiorConjunction.date.toISOString()
    //     : null;
    //   data.nextSuperiorConjunction = nextSuperiorConjunction
    //     ? nextSuperiorConjunction.date.toISOString()
    //     : null;

    //   // Transits (for Mercury and Venus)
    //   let nextTransit = null;
    //   try {
    //     nextTransit = Astronomy.SearchTransit(bodyName, startTime);
    //   } catch (e) {
    //     console.error("No transit found:", e);
    //   }

    //   data.nextTransit = nextTransit
    //     ? {
    //         date: nextTransit.start.date.toISOString(),
    //         separationArcmin: nextTransit.separation,
    //       }
    //     : null;

    //   // Visual Magnitude and Elongation
    //   const illumInfo = Astronomy.Illumination(bodyName, startTime);
    //   data.currentMagnitude = illumInfo.mag;
    //   data.currentElongation = Astronomy.AngleFromSun(bodyName, startTime);

    //   // Planetary Perihelion and Aphelion
    //   const nextApsis = Astronomy.SearchPlanetApsis(bodyName, startTime);
    //   data.nextApsis = nextApsis
    //     ? {
    //         kind: nextApsis.kind,
    //         date: nextApsis.time.date.toISOString(),
    //         distanceAu: nextApsis.dist_au,
    //       }
    //     : null;
    // }

    // if (
    //   ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(
    //     bodyName
    //   )
    // ) {
    //   // Opposition and Conjunction
    //   const nextOpposition = Astronomy.SearchRelativeLongitude(
    //     bodyName,
    //     0.0,
    //     startTime
    //   );
    //   const nextConjunction = Astronomy.SearchRelativeLongitude(
    //     bodyName,
    //     180.0,
    //     startTime
    //   );

    //   data.nextOpposition = nextOpposition
    //     ? nextOpposition.date.toISOString()
    //     : null;
    //   data.nextConjunction = nextConjunction
    //     ? nextConjunction.date.toISOString()
    //     : null;

    //   // Visual Magnitude and Elongation
    //   const illumInfo = Astronomy.Illumination(bodyName, startTime);
    //   data.currentMagnitude = illumInfo.mag;
    //   data.currentElongation = Astronomy.AngleFromSun(bodyName, startTime);

    //   // Planetary Perihelion and Aphelion
    //   const nextApsis = Astronomy.SearchPlanetApsis(bodyName, startTime);
    //   data.nextApsis = nextApsis
    //     ? {
    //         kind: nextApsis.kind,
    //         date: nextApsis.time.date.toISOString(),
    //         distanceAu: nextApsis.dist_au,
    //       }
    //     : null;
    // }

    res.json(data);
  } catch (error) {
    console.error("Error calculating events:", error);
    res.status(500).json({
      error: "Failed to calculate events using Astronomy Engine",
    });
  }
};