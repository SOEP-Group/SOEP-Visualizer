onmessage = function (e) {
  const { start, end, ignoreList, filters } = e.data;
  const ignoreSet = new Set(ignoreList);

  const matchedSatellites = [];

  for (let instanceId = start; instanceId < end; instanceId++) {
    if (ignoreSet.has(instanceId)) {
      continue;
    }

    // Perform satellite property checks
    const geodeticCoords = satellites.getGeodeticCoordinates(instanceId);
    const speedVector = satellites.getSpeed(instanceId);
    const speed = Math.sqrt(
      speedVector.x ** 2 + speedVector.y ** 2 + speedVector.z ** 2
    );
    const orbitDistance = satellites.getOrbitDistance(instanceId);
    const inclination = satellites.getInclination(instanceId);
    const revolutionTime = satellites.getRevolutionTime(instanceId);
    const launchDate = satellites.getLaunchDate(instanceId);
    const owner = satellites.getOwner(instanceId);
    const launchSite = satellites.getLaunchSite(instanceId);

    const speedRange = filters?.["Speed (km/s)"]?.map(Number) || [
      -Infinity,
      Infinity,
    ];
    const latRange = filters?.["Latitude (°)"]?.map(Number) || [
      -Infinity,
      Infinity,
    ];
    const longRange = filters?.["Longitude (°)"]?.map(Number) || [
      -Infinity,
      Infinity,
    ];
    const orbitDistanceRange = filters?.["Orbit Distance (km)"]?.map(
      Number
    ) || [-Infinity, Infinity];
    const inclinationRange = filters?.["Inclination (°)"]?.map(Number) || [
      -Infinity,
      Infinity,
    ];
    const revolutionTimeRange = filters?.["Revolution Time (hours)"]?.map(
      Number
    ) || [-Infinity, Infinity];
    const launchDateStart = filters?.["Launch Date"]?.start
      ? new Date(filters["Launch Date"].start)
      : new Date(-8640000000000000);
    const launchDateEnd = filters?.["Launch Date"]?.end
      ? new Date(filters["Launch Date"].end)
      : new Date(8640000000000000);
    const satelliteLaunchDate = new Date(launchDate);
    const filterOwner = filters?.["Owner"] || "Any";
    const filterLaunchSite = filters?.["Launch Site"] || "Any";

    const isWithinFilters =
      speed >= speedRange[0] &&
      speed <= speedRange[1] &&
      geodeticCoords.lat >= latRange[0] &&
      geodeticCoords.lat <= latRange[1] &&
      geodeticCoords.long >= longRange[0] &&
      geodeticCoords.long <= longRange[1] &&
      orbitDistance.min >= orbitDistanceRange[0] &&
      orbitDistance.max <= orbitDistanceRange[1] &&
      inclination >= inclinationRange[0] &&
      inclination <= inclinationRange[1] &&
      revolutionTime >= revolutionTimeRange[0] &&
      revolutionTime <= revolutionTimeRange[1] &&
      satelliteLaunchDate >= launchDateStart &&
      satelliteLaunchDate <= launchDateEnd &&
      (filterOwner === "Any" || owner === filterOwner) &&
      (filterLaunchSite === "Any" || launchSite === filterLaunchSite);

    if (isWithinFilters) {
      matchedSatellites.push(instanceId);
    }
  }

  postMessage(matchedSatellites);
};
