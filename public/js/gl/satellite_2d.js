import {
  Group,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  Vector3,
  Color,
  Raycaster,
} from "three";

import { textureLoader } from "./index.js";
import { clock } from "./renderer.js";
import { earth } from "./scene.js";

export class Satellites {
  points;
  instanceCount;
  group;
  raycaster;
  workers = [];
  positions_read;
  positions_write;
  positions_longlatalt;
  tle_lines = [];
  ids;
  speeds;
  instanceIdToSatelliteIdMap = {};
  baseColor = new Color().setHex(0x289dba);
  hoverColor = new Color(1, 1, 0);
  hoveredSatellite = -1;
  focusedSatellite = -1;
  isUpdating = false;
  isHidden = false;
  visible_satellites = new Set();

  constructor(data) {
    this.instanceCount = data.length;
    this.group = new Group();
    this.group.position.set(0, 0, 0);
    this.raycaster = new Raycaster();
    this.raycaster.params.Points.threshold = 0.015;

    this.positions = new Float32Array(this.instanceCount * 3); // Initialize positions array
    this.createPoints(data);
    this.createWorkers(2, data);

    this.animate = this.createAnimateFunction();
    this.animate();

    this.instanceIdToDataMap = {};
    data.forEach((satellite, index) => {
      this.instanceIdToDataMap[index] = {
        name: satellite.name,
        inclination: satellite.inclination,
        revolution: satellite.revolution,
        lowest_orbit_distance: satellite.lowest_orbit_distance,
        farthest_orbit_distance: satellite.farthest_orbit_distance,
        launch_date: satellite.launch_date,
        launch_site: satellite.launch_site,
        owner: satellite.owner,
        satellite_id: satellite.satellite_id,
        tle_line1: satellite.tle_line1,
        tle_line2: satellite.tle_line2,
      };
    });
  }

  dispose() {
    // ever heard of the tragedy of darth plagueis the wise?
    this.workers.forEach(({ worker }) => worker.terminate());
    this.workers = [];

    // we want to dispose the geometry ivan thought
    if (this.points) {
      this.points.geometry.dispose();
      this.points.material.dispose();
      this.group.remove(this.points);
      this.points = null;
    }

    // and we also want to clear other references ivan imagined
    this.positions = null;
    this.positions_read = null;
    this.positions_write = null;
    this.positions_longlatalt = null;
    this.speeds = null;
    this.ids = null;
    this.tle_lines = [];
    this.instanceIdToSatelliteIdMap = {};
  }

  createPoints(data) {
    const colors = new Float32Array(this.instanceCount * 3);
    const alphas = new Float32Array(this.instanceCount);

    data.forEach((satellite, index) => {
      const baseColorArray = [
        this.baseColor.r,
        this.baseColor.g,
        this.baseColor.b,
      ];

      this.positions.set([0, 0, 0], index * 3);
      colors.set(baseColorArray, index * 3);
      alphas.set([1.0], index);

      this.instanceIdToSatelliteIdMap[index] = satellite.satellite_id;
      this.visible_satellites.add(index);
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(this.positions, 3)
    );
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("alpha", new Float32BufferAttribute(alphas, 1));

    const material = new PointsMaterial({
      size: 0.015,
      vertexColors: true,
      map: textureLoader.load("images/satellites/dot_map.png"),
      transparent: true,
      opacity: 1.0,
      alphaTest: 0.1,
    });

    material.onBeforeCompile = function (shader) {
      shader.vertexShader = shader.vertexShader.replace(
        `uniform float size;`,
        `uniform float size;
        attribute float alpha;
        varying float vAlpha;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        `#include <color_vertex>`,
        `#include <color_vertex>
        vAlpha = alpha;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <color_pars_fragment>`,
        `#include <color_pars_fragment>
        varying float vAlpha;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `vec4 diffuseColor = vec4( diffuse, opacity * vAlpha );`
      );
    };

    this.points = new Points(geometry, material);
    this.group.add(this.points);
  }

  checkForClick(mouse, camera) {
    if (this.isHidden) return null;
    this.raycaster.setFromCamera(mouse, camera);

    const intersects = this.raycaster.intersectObject(earth.getGroup());
    for (const interesection of intersects) {
      if (interesection.object.type === "Points") {
        const satellite_index = interesection.index;
        if (this.visible_satellites.has(satellite_index)) {
          return satellite_index;
        }
      } else if (interesection.object.type === "Mesh") {
        return null;
      }
    }
    return null;
  }

  getIdByInstanceId(id) {
    return this.instanceIdToSatelliteIdMap[id];
  }

  getInstanceIdById(id) {
    for (const [key, val] of Object.entries(this.instanceIdToSatelliteIdMap)) {
      if (val == id) {
        return key;
      }
    }
    return null;
  }

  resetColors() {
    const colors = this.points.geometry.attributes.color.array;

    for (let i = 0; i < this.instanceCount; i++) {
      if (i === this.focusedSatellite) continue;

      const colorIndex = i * 3;
      colors[colorIndex] = this.baseColor.r;
      colors[colorIndex + 1] = this.baseColor.g;
      colors[colorIndex + 2] = this.baseColor.b;
    }

    this.points.geometry.attributes.color.needsUpdate = true;
  }

  getTLEData(id) {
    return this.tle_lines[id];
  }

  setHovered(id) {
    if (this.hoveredSatellite > -1 && this.hoveredSatellite !== id) {
      this.resetColors();
    }

    if (id > -1) {
      const colorIndex = id * 3;
      const colors = this.points.geometry.attributes.color.array;

      if (id !== this.focusedSatellite) {
        colors[colorIndex] = this.hoverColor.r;
        colors[colorIndex + 1] = this.hoverColor.g;
        colors[colorIndex + 2] = this.hoverColor.b;
      }
      this.hoveredSatellite = id;
      this.points.geometry.attributes.color.needsUpdate = true;
    }

    if (this.focusedSatellite > -1) {
      const focusedIndex = this.focusedSatellite * 3;
      const colors = this.points.geometry.attributes.color.array;
      colors[focusedIndex] = this.hoverColor.r;
      colors[focusedIndex + 1] = this.hoverColor.g;
      colors[focusedIndex + 2] = this.hoverColor.b;
      this.points.geometry.attributes.color.needsUpdate = true;
    }
  }

  // We will be utilizing double buffering in order update the positions of the satellites. Using webworkers we can make it so fast that even your grandmas phone can run it
  // We will swap the buffers every frame, but with further testing maybe we could swap the buffers every 3rd frame or something if the first option becomes too burdensome on some devices
  createWorkers(workerCount, data) {
    const chunkSize = Math.ceil(this.instanceCount / workerCount);
    const bufferSize = this.instanceCount * 3;
    const sharedBufferSize = bufferSize * Float32Array.BYTES_PER_ELEMENT;
    const sharedIdBufferSize =
      this.instanceCount * Int32Array.BYTES_PER_ELEMENT;

    const readPositionsBuffer = new SharedArrayBuffer(sharedBufferSize);
    const writePositionsBuffer = new SharedArrayBuffer(sharedBufferSize);
    const speedsBuffer = new SharedArrayBuffer(sharedBufferSize);
    const geogedicBuffer = new SharedArrayBuffer(sharedBufferSize);
    const idBuffer = new SharedArrayBuffer(sharedIdBufferSize);

    this.positions_read = new Float32Array(readPositionsBuffer);
    this.positions_write = new Float32Array(writePositionsBuffer);
    this.positions_longlatalt = new Float32Array(geogedicBuffer);
    this.speeds = new Float32Array(speedsBuffer);
    this.ids = new Int32Array(idBuffer);
    data.forEach((satellite, index) => {
      const tle_lines = {};
      tle_lines.first = satellite.tle_line1;
      tle_lines.second = satellite.tle_line2;

      this.positions_read.set([0, 0, 0], index * 3);
      this.positions_write.set([0, 0, 0], index * 3);
      this.speeds.set([0, 0, 0], index * 3);
      this.positions_longlatalt.set([0, 0, 0], index * 3);
      this.ids.set(satellite.satellite_id, index);
      this.tle_lines.push(tle_lines);
    });

    this.workers = [];
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        new URL("../workers/satellite_worker.js", import.meta.url),
        { type: "module" }
      );
      const startIndex = i * chunkSize;
      const endIndex = Math.min((i + 1) * chunkSize, this.instanceCount);

      worker.onerror = (error) => {
        console.error(`Worker ${i} encountered an error:`, error);
      };
      const worker_data = {
        command: "update_tle",
        tleLines: data.slice(startIndex, endIndex).map((satellite) => ({
          tle_line1: satellite.tle_line1,
          tle_line2: satellite.tle_line2,
        })),
      };

      worker.postMessage(worker_data);

      this.workers.push({ worker, startIndex, endIndex });
    }
  }

  updatePositions(deltaTime) {
    // For some reason sharing buffers across threads is the equvalent to knowing what the dog doing...next to impossible
    // Update: I did it, I know what the fuck the dog is doing
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;
    const promises = this.workers.map(({ worker, startIndex, endIndex }) => {
      return new Promise((resolve) => {
        worker.onmessage = () => resolve();

        worker.postMessage({
          command: "update",
          deltaTime,
          startIndex,
          endIndex,
          positions: this.positions_write.buffer,
          longlatalt: this.positions_longlatalt.buffer,
          speeds: this.speeds.buffer,
          ids: this.ids.buffer,
        });
      });
    });

    Promise.all(promises).then(() => {
      [this.positions_read, this.positions_write] = [
        this.positions_write,
        this.positions_read,
      ];

      if (this.points && this.points.geometry) {
        this.points.geometry.attributes.position.array = this.positions_read;
        this.points.geometry.attributes.position.needsUpdate = true;
        // This needs to be recomputed everytime. Might be a bottleneck depending on how threejs does this
        this.points.geometry.computeBoundingSphere();
        this.isUpdating = false;
      }
    });
  }

  setFocused(id) {
    if (this.hoveredSatellite > -1 && this.hoveredSatellite !== id) {
      this.focusedSatellite = -1;
      this.resetColors();
    }

    if (id > -1) {
      const colorIndex = id * 3;
      const colors = this.points.geometry.attributes.color.array;

      colors[colorIndex] = this.hoverColor.r;
      colors[colorIndex + 1] = this.hoverColor.g;
      colors[colorIndex + 2] = this.hoverColor.b;

      this.focusedSatellite = id;
      this.points.geometry.attributes.color.needsUpdate = true;
    }
  }

  getGroup() {
    return this.group;
  }

  createAnimateFunction() {
    return () => {
      if (this.animate) {
        requestAnimationFrame(this.animate);
        const dt = clock.getDelta();
        this.updatePositions(dt);
      }
    };
  }

  getPosition(instanceId) {
    const index = instanceId * 3;
    return new Vector3(
      this.positions_read[index],
      this.positions_read[index + 1],
      this.positions_read[index + 2]
    );
  }

  getGeodeticCoordinates(instanceId) {
    const index = instanceId * 3;
    return {
      lat: this.positions_longlatalt[index],
      long: this.positions_longlatalt[index + 1],
      alt: this.positions_longlatalt[index + 2],
    };
  }

  getSpeed(instanceId) {
    const index = instanceId * 3;
    return new Vector3(
      this.speeds[index],
      this.speeds[index + 1],
      this.speeds[index + 2]
    );
  }

  getOrbitDistance(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data
      ? { min: data.lowest_orbit_distance, max: data.farthest_orbit_distance }
      : null;
  }

  getInclination(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.inclination : null;
  }

  getRevolutionTime(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.revolution : null;
  }

  getLaunchDate(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.launch_date : null;
  }

  getOwner(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.owner : null;
  }

  getLaunchSite(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.launch_site : null;
  }

  getOrbitDistance(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data
      ? { min: data.lowest_orbit_distance, max: data.farthest_orbit_distance }
      : null;
  }

  getInclination(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.inclination : null;
  }

  getRevolutionTime(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.revolution : null;
  }

  getLaunchDate(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.launch_date : null;
  }

  getOwner(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.owner : null;
  }

  getLaunchSite(instanceId) {
    const data = this.instanceIdToDataMap[instanceId];
    return data ? data.launch_site : null;
  }

  getVisible() {
    return Array.from(this.visible_satellites);
  }

  mask(satellites) {
    const alphaArray = this.points.geometry.attributes.alpha.array;

    satellites.forEach((satelliteIndex) => {
      if (satelliteIndex >= 0 && satelliteIndex < this.instanceCount) {
        alphaArray[satelliteIndex] = 0.0;
        this.visible_satellites.delete(satelliteIndex);
      }
    });

    this.points.geometry.attributes.alpha.needsUpdate = true;
  }

  unmask(satellites) {
    const alphaArray = this.points.geometry.attributes.alpha.array;

    satellites.forEach((satelliteIndex) => {
      if (satelliteIndex >= 0 && satelliteIndex < this.instanceCount) {
        alphaArray[satelliteIndex] = 1.0;
        this.visible_satellites.add(satelliteIndex);
      }
    });

    this.points.geometry.attributes.alpha.needsUpdate = true;
  }

  hide() {
    const alphaArray = this.points.geometry.attributes.alpha.array;

    for (let i = 0; i < this.instanceCount; i++) {
      alphaArray[i] = 0.0;
      this.visible_satellites.delete(i);
    }
    this.points.geometry.attributes.alpha.needsUpdate = true;
  }

  show() {
    const alphaArray = this.points.geometry.attributes.alpha.array;

    for (let i = 0; i < this.instanceCount; i++) {
      alphaArray[i] = 1.0;
      this.visible_satellites.add(i);
    }
    this.points.geometry.attributes.alpha.needsUpdate = true;
  }

  getPassingSatellites(location, radius) {
    const passingSatellites = [];
    for (let i = 0; i < this.instanceCount; i++) {
      const { lat, long } = this.getGeodeticCoordinates(i);
      if (this.isWithinRadius(location, { lat, long }, radius)) {
        passingSatellites.push(i);
      }
    }
    return passingSatellites;
  }

  getSatellitesOutOfRange(location, radius) {
    const out_of_range = [];
    for (let i = 0; i < this.instanceCount; i++) {
      const { lat, long } = this.getGeodeticCoordinates(i);
      if (!this.isWithinRadius(location, { lat, long }, radius)) {
        out_of_range.push(i);
      }
    }
    return out_of_range;
  }

  toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  isWithinRadius(location1, location2, radius) {
    const R = 6371;

    const lat1 = this.toRad(location1.lat);
    const lon1 = this.toRad(location1.long);
    const lat2 = this.toRad(location2.lat);
    const lon2 = this.toRad(location2.long);

    const dLat = lat2 - lat1;
    const dLong = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLong / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    //console.log(`Distance between:`, {lat1, lon1}, location2, `is:`, distance);

    return distance <= radius;
  }
}
