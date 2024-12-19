import {
  sgp4,
  propagate,
  twoline2satrec,
  gstime,
  eciToGeodetic,
  eciToEcf,
  degreesLat,
  degreesLong,
} from "../../libs/satellite.js/dist/satellite.es.js";

import { geodeticToThree, scalePosition } from "../utils/utils.js";

let tle_data = [];

const EARTH_RADIUS = 6378;

self.onmessage = async function (event) {
  if (event.data.command === "update") {
    const {
      positions,
      longlatalt,
      ids,
      speeds,
      startIndex,
      endIndex,
      deltaTime,
    } = event.data;

    const positionsWriteView = new Float32Array(positions);
    const geogedicView = new Float32Array(longlatalt);
    const speedsView = new Float32Array(speeds);

    for (let i = 0; i < tle_data.length; i++) {
      const idx = (startIndex + i) * 3;

      const tle = tle_data[i];
      if (!tle) {
        console.warn(
          `Missing TLE data for satellite at index ${startIndex + i}`
        );
        continue;
      }

      const { tle_line1, tle_line2 } = tle;

      const satrec = twoline2satrec(tle_line1, tle_line2);
      const now = new Date();
      const sgp4Result = propagate(satrec, now);

      if (sgp4Result.position && sgp4Result.velocity) {
        let position = sgp4Result.position;
        const gmst = gstime(now);
        let velocity = sgp4Result.velocity;

        const geodeticCoordinates = eciToGeodetic(position, gmst);
        const latitude = geodeticCoordinates.latitude;
        const longitude = geodeticCoordinates.longitude;
        const altitude = geodeticCoordinates.height;
        geogedicView[idx] = degreesLat(latitude);
        geogedicView[idx + 1] = degreesLong(longitude);
        geogedicView[idx + 2] = altitude;

        position = scalePosition(position);
        positionsWriteView[idx] = position.x;
        positionsWriteView[idx + 1] = position.z;
        positionsWriteView[idx + 2] = -position.y;

        speedsView[idx] = velocity.x;
        speedsView[idx + 1] = velocity.z;
        speedsView[idx + 2] = -velocity.y;
      } else {
        // console.error(
        //   `SGP4 error for satellite at index ${startIndex + i}`,
        //   sgp4Result
        // );
      }
    }
    postMessage("Buffers updated!");
  } else if (event.data.command === "update_tle") {
    const { tleLines } = event.data;
    tle_data = tleLines;
    postMessage("Tle data updated!");
  }
};
