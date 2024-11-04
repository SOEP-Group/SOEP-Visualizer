export function scalePosition(satellitePosition) {
    const scaleFactor = 1 / (6378 * 2); // 1 unit is 6,378 (earth equatorial radius) *2 km
    const scaledPosition = {
      x: satellitePosition.x * scaleFactor,
      y: satellitePosition.y * scaleFactor,
      z: satellitePosition.z * scaleFactor
    };
  
    // Calculate absolut distance from center
    let distanceFromCenter = Math.sqrt(
      scaledPosition.x ** 2 +
      scaledPosition.y ** 2 +
      scaledPosition.z ** 2
    );
  
    // Sets minimal distance if too close
    const minimalDist = 0.54
    if (distanceFromCenter < minimalDist) {
      const scalingAdjustment = minimalDist / distanceFromCenter;
      scaledPosition.x *= scalingAdjustment;
      scaledPosition.y *= scalingAdjustment;
      scaledPosition.z *= scalingAdjustment;
    }
  
    return scaledPosition;
  }