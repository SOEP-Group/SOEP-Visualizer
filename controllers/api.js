const pool = require("../db");
const Astronomy = require("astronomy-engine");

exports.getAllSatellites = async function (req, res) {
  // Suck it Alpha
  try {
    const query = `
      SELECT sd.*, s.name, s.inclination, s.revolution, s.lowest_orbit_distance, s.farthest_orbit_distance,
            s.launch_date, s.launch_site, s.owner
      FROM satellite_data sd
      JOIN satellites s ON s.satellite_id = sd.satellite_id;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};

exports.getFilterData = async function (req, res) {
  try {
    const query = `
      SELECT 
        MIN(revolution) AS min_revolution, MAX(revolution) AS max_revolution,
        MIN(inclination) AS min_inclination, MAX(inclination) AS max_inclination,
        MIN(lowest_orbit_distance) AS min_orbit_distance, MAX(farthest_orbit_distance) AS max_orbit_distance,
        MIN(launch_date) AS min_launch_date, MAX(launch_date) AS max_launch_date,
        ARRAY_AGG(DISTINCT launch_site) AS launch_sites,
        ARRAY_AGG(DISTINCT owner) AS owners
      FROM satellites;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};

exports.getBodyEvents = async function (req, res) {
  const { body } = req.params;
  const { latitude, longitude, start, end } = req.query;

  // Default is San Francisco
  const observer = new Astronomy.Observer(
    parseFloat(latitude) || 37.7749,
    parseFloat(longitude) || -122.4194,
    10 // Elevation in meters
  );

  let startTime = new Date();
  let limitDays = 365;

  if (start) {
    const startParsed = new Date(start);
    if (!isNaN(startParsed)) {
      startTime = startParsed;
    }
  }

  if (end) {
    const endParsed = new Date(end);
    if (!isNaN(endParsed)) {
      const diffMs = endParsed - startTime;
      limitDays = diffMs > 0 ? diffMs / (1000 * 60 * 60 * 24) : 365;
    }
  }

  try {
    const bodyName = body.charAt(0).toUpperCase() + body.slice(1).toLowerCase();
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
      return res.status(400).json({ error: `Invalid celestial body: ${body}` });
    }

    const astroStartTime = new Astronomy.AstroTime(startTime);

    // Common events for all bodies
    const riseEvent = Astronomy.SearchRiseSet(
      bodyName,
      observer,
      +1,
      astroStartTime,
      limitDays
    );
    const setEvent = Astronomy.SearchRiseSet(
      bodyName,
      observer,
      -1,
      astroStartTime,
      limitDays
    );
    const culminationEvent = Astronomy.SearchHourAngle(
      bodyName,
      observer,
      0.0,
      astroStartTime,
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
      const moonPhaseAngle = Astronomy.MoonPhase(astroStartTime);
      const nextNewMoon = Astronomy.SearchMoonPhase(
        0,
        astroStartTime,
        limitDays
      );
      const nextFirstQuarter = Astronomy.SearchMoonPhase(
        90,
        astroStartTime,
        limitDays
      );
      const nextFullMoon = Astronomy.SearchMoonPhase(
        180,
        astroStartTime,
        limitDays
      );
      const nextLastQuarter = Astronomy.SearchMoonPhase(
        270,
        astroStartTime,
        limitDays
      );

      // Lunar Eclipses
      let nextLunarEclipse = null;
      try {
        nextLunarEclipse = Astronomy.SearchLunarEclipse(astroStartTime);
      } catch (e) {
        console.error("No lunar eclipse found:", e);
      }

      // Lunar Perigee and Apogee
      const nextLunarApsis = Astronomy.SearchLunarApsis(astroStartTime);

      data.moonPhaseAngle = moonPhaseAngle;
      data.nextNewMoon = nextNewMoon ? nextNewMoon.date.toISOString() : null;
      data.nextFirstQuarter = nextFirstQuarter
        ? nextFirstQuarter.date.toISOString()
        : null;
      data.nextFullMoon = nextFullMoon ? nextFullMoon.date.toISOString() : null;
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
      // const limitDaysTwilight = 1; // Search within the next day

      // Civil Twilight (-6 degrees)
      const civilDawn = Astronomy.SearchAltitude(
        "Sun",
        observer,
        +1,
        astroStartTime,
        limitDays,
        -6.0
      );
      const civilDusk = Astronomy.SearchAltitude(
        "Sun",
        observer,
        -1,
        astroStartTime,
        limitDays,
        -6.0
      );

      // Nautical Twilight (-12 degrees)
      const nauticalDawn = Astronomy.SearchAltitude(
        "Sun",
        observer,
        +1,
        astroStartTime,
        limitDays,
        -12.0
      );
      const nauticalDusk = Astronomy.SearchAltitude(
        "Sun",
        observer,
        -1,
        astroStartTime,
        limitDays,
        -12.0
      );

      // Astronomical Twilight (-18 degrees)
      const astroDawn = Astronomy.SearchAltitude(
        "Sun",
        observer,
        +1,
        astroStartTime,
        limitDays,
        -18.0
      );
      const astroDusk = Astronomy.SearchAltitude(
        "Sun",
        observer,
        -1,
        astroStartTime,
        limitDays,
        -18.0
      );

      // Solar Eclipses
      let nextSolarEclipse = null;
      try {
        nextSolarEclipse = Astronomy.SearchGlobalSolarEclipse(astroStartTime);
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
    //       astroStartTime
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
    //     Astronomy.SearchRelativeLongitude(bodyName, 0.0, astroStartTime);
    //   const nextSuperiorConjunction =
    //     Astronomy.SearchRelativeLongitude(bodyName, 180.0, astroStartTime);

    //   data.nextInferiorConjunction = nextInferiorConjunction
    //     ? nextInferiorConjunction.date.toISOString()
    //     : null;
    //   data.nextSuperiorConjunction = nextSuperiorConjunction
    //     ? nextSuperiorConjunction.date.toISOString()
    //     : null;

    //   // Transits (for Mercury and Venus)
    //   let nextTransit = null;
    //   try {
    //     nextTransit = Astronomy.SearchTransit(bodyName, astroStartTime);
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
    //   const illumInfo = Astronomy.Illumination(bodyName, astroStartTime);
    //   data.currentMagnitude = illumInfo.mag;
    //   data.currentElongation = Astronomy.AngleFromSun(bodyName, astroStartTime);

    //   // Planetary Perihelion and Aphelion
    //   const nextApsis = Astronomy.SearchPlanetApsis(bodyName, astroStartTime);
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
    //     astroStartTime
    //   );
    //   const nextConjunction = Astronomy.SearchRelativeLongitude(
    //     bodyName,
    //     180.0,
    //     astroStartTime
    //   );

    //   data.nextOpposition = nextOpposition
    //     ? nextOpposition.date.toISOString()
    //     : null;
    //   data.nextConjunction = nextConjunction
    //     ? nextConjunction.date.toISOString()
    //     : null;

    //   // Visual Magnitude and Elongation
    //   const illumInfo = Astronomy.Illumination(bodyName, astroStartTime);
    //   data.currentMagnitude = illumInfo.mag;
    //   data.currentElongation = Astronomy.AngleFromSun(bodyName, astroStartTime);

    //   // Planetary Perihelion and Aphelion
    //   const nextApsis = Astronomy.SearchPlanetApsis(bodyName, astroStartTime);
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

exports.predictCollision = async function (req, res) {
  const { id } = req.params;
  try {
    const query = `
      SELECT *
      FROM top_collision_probabilities
      WHERE satellite_id = ${id};
    `;
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
};
