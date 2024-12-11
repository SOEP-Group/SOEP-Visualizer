export function scalePosition(satellitePosition) {
  const scaleFactor = 1 / (6378 * 2); // 1 unit is 6,378 (earth equatorial radius) *2 km
  const scaledPosition = {
    x: satellitePosition.x * scaleFactor,
    y: satellitePosition.y * scaleFactor,
    z: satellitePosition.z * scaleFactor,
  };

  return scaledPosition;
}
