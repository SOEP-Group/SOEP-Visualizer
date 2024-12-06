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
  baseColor = new Color(1, 0, 0);
  hoverColor = new Color(1, 1, 0);
  hoveredSatellite = -1;
  focusedSatellite = -1;
  isUpdating = false;

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
      this.instanceIdToDataMap[index] = satellite;
    });
  }

  createPoints(data) {
    const colors = new Float32Array(this.instanceCount * 3);

    data.forEach((satellite, index) => {
      const baseColorArray = [
        this.baseColor.r,
        this.baseColor.g,
        this.baseColor.b,
      ];

      this.positions.set([0, 0, 0], index * 3);
      colors.set(baseColorArray, index * 3);

      this.instanceIdToSatelliteIdMap[index] = satellite.satellite_id;
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(this.positions, 3)
    );
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 0.015,
      vertexColors: true,
      map: textureLoader.load("images/satellites/dot_map.png"),
      transparent: true,
      opacity: 1.0,
      alphaTest: 0.1,
    });

    this.points = new Points(geometry, material);
    this.group.add(this.points);
  }

  checkForClick(mouse, camera) {
    this.raycaster.setFromCamera(mouse, camera);

    const intersects = this.raycaster.intersectObject(earth.getGroup());
    for (const interesection of intersects) {
      if (interesection.object.type === "Points") {
        return interesection.index;
      } else if (interesection.object.type === "Mesh") {
        return null;
      }
    }
    return null;
  }

  getIdByInstanceId(id) {
    return this.instanceIdToSatelliteIdMap[id];
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

      colors[colorIndex] = this.hoverColor.r;
      colors[colorIndex + 1] = this.hoverColor.g;
      colors[colorIndex + 2] = this.hoverColor.b;

      this.hoveredSatellite = id;
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

    const positionsBuffer = new SharedArrayBuffer(sharedBufferSize);
    const speedsBuffer = new SharedArrayBuffer(sharedBufferSize);
    const idBuffer = new SharedArrayBuffer(sharedIdBufferSize);

    this.positions_read = new Float32Array(positionsBuffer);
    this.positions_write = new Float32Array(positionsBuffer);
    this.positions_longlatalt = new Float32Array(positionsBuffer);
    this.speeds = new Float32Array(speedsBuffer);
    this.ids = new Int32Array(idBuffer);
    data.forEach((satellite, index) => {
      const tle_lines = {};
      tle_lines.first = satellite.tle_line1;
      tle_lines.second = satellite.tle_line2;

      this.positions_read.set([0, 0, 0], index * 3);
      this.positions_write.set([0, 0, 0], index * 3);
      this.speeds.set([0, 0, 0], index * 3);
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
          latlongalt: this.positions_longlatalt,
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

      this.points.geometry.attributes.position.array = this.positions_read;
      this.points.geometry.attributes.position.needsUpdate = true;
      // This needs to be recomputed everytime. Might be a bottleneck depending on how threejs does this
      this.points.geometry.computeBoundingSphere();
      this.isUpdating = false;
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
      long: this.positions_longlatalt[index],
      lat: this.positions_longlatalt[index + 1],
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
}
