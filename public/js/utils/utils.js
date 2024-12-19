export const EARTH_RADIUS = 6378;

export const EARTH_SCALE_FACTOR = 0.5 / EARTH_RADIUS; // 1 unit is 6,378 (earth equatorial radius) *2 km

export function scalePosition(satellitePosition) {
  const scaledPosition = {
    x: satellitePosition.x * EARTH_SCALE_FACTOR,
    y: satellitePosition.y * EARTH_SCALE_FACTOR,
    z: satellitePosition.z * EARTH_SCALE_FACTOR,
  };

  return scaledPosition;
}

export function toJulianDate(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  return (
    367 * year -
    Math.floor((7 * (year + Math.floor((month + 9) / 12))) / 4) +
    Math.floor((275 * month) / 9) +
    day +
    (hours + minutes / 60 + seconds / 3600) / 24 +
    1721013.5
  );
}

// Arguments are in radians
export function geodeticToThree(lat, long, alt) {
  const radius = EARTH_RADIUS + alt;

  const x = radius * Math.cos(lat) * Math.cos(long);
  const y = radius * Math.sin(lat);
  const z = -radius * Math.cos(lat) * Math.sin(long);

  return { x, y, z };
}

function defaultHash(x) {
  return x;
}

// For quick mask intersection
export function fastIntersect(arrays, hash = defaultHash) {
  if (arrays.length === 0) return [];

  for (let i = 1; i < arrays.length; i++) {
    if (arrays[i].length < arrays[0].length) {
      let tmp = arrays[0];
      arrays[0] = arrays[i];
      arrays[i] = tmp;
    }
  }
  const set = new Map();
  for (const elem of arrays[0]) {
    set.set(hash(elem), 1);
  }
  for (let i = 1; i < arrays.length; i++) {
    let found = 0;
    for (const elem of arrays[i]) {
      const hashed = hash(elem);
      const count = set.get(hashed);
      if (count === i) {
        set.set(hashed, count + 1);
        found++;
      }
    }
    if (found === 0) return [];
  }
  return arrays[0].filter((e) => {
    const hashed = hash(e);
    const count = set.get(hashed);
    if (count !== undefined) set.set(hashed, 0);
    return count === arrays.length;
  });
}
