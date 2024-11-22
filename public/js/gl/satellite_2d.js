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
  speeds;
  instanceIdToSatelliteIdMap = {};
  baseColor = new Color(1, 0, 0);
  hoverColor = new Color(1, 1, 0);
  hoveredSatellite = -1;
  focusedSatellite = -1;

  constructor(data) {
    this.instanceCount = data.length;
    this.group = new Group();
    this.group.position.set(0, 0, 0);
    this.raycaster = new Raycaster();
    this.raycaster.params.Points.threshold = 0.009;

    this.positions = new Float32Array(this.instanceCount * 3); // Initialize positions array
    this.speeds = new Float32Array(this.instanceCount * 3); // Initialize speeds array

    this.createPoints(data);
    this.createWorkers(2, data);

    this.animate = this.createAnimateFunction();
    this.animate();
  }

  createPoints(data) {
    const colors = new Float32Array(this.instanceCount * 3);

    data.forEach((satellite, index) => {
      const { x, y, z } = satellite.position;
      const { x: vx, y: vy, z: vz } = satellite.speed; // Assume speed is present in satellite object
      const baseColorArray = [
        this.baseColor.r,
        this.baseColor.g,
        this.baseColor.b,
      ];

      this.positions.set([x, y, z], index * 3); // Populate positions array
      this.speeds.set([vx, vy, vz], index * 3); // Populate speeds array
      colors.set(baseColorArray, index * 3);

      this.instanceIdToSatelliteIdMap[index] = satellite.id;
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(this.positions, 3)
    ); // Use shared positions array
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 0.01,
      vertexColors: true,
      map: textureLoader.load("images/satellites/dot_map.png"),
      transparent: true,
      opacity: 1.0,
    });

    this.points = new Points(geometry, material);
    this.group.add(this.points);
  }

  checkForClick(mouse, camera) {
    this.raycaster.setFromCamera(mouse, camera);

    const intersects = this.raycaster.intersectObject(earth.getGroup());
    if (intersects.length > 0 && intersects[0].object.type === "Points") {
      return intersects[0].index;
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
    this.positions_read = new Float32Array(bufferSize);

    this.positions_write = new Float32Array(bufferSize);

    this.speeds = new Float32Array(bufferSize);

    data.forEach((satellite, index) => {
      const { x, y, z } = satellite.position;
      const { x: vx, y: vy, z: vz } = satellite.speed;

      this.positions_read.set([x, y, z], index * 3);
      this.positions_write.set([x, y, z], index * 3);
      this.speeds.set([vx, vy, vz], index * 3);
    });

    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        new URL("../workers/satellite_worker.js", import.meta.url)
      );
      const startIndex = i * chunkSize;
      const endIndex = Math.min((i + 1) * chunkSize, this.instanceCount);
      worker.onerror = (error) => {
        console.error(`Worker ${i} encountered an error:`, error);
      };
      this.workers.push({ worker, startIndex, endIndex });
    }
  }

  updatePositions(deltaTime) {
    // For some reason sharing buffers across threads is the equvalent to knowing what the dog doing...next to impossible
    // const promises = this.workers.map(({ worker, startIndex, endIndex }) => {
    //   return new Promise((resolve) => {
    //     worker.onmessage = (event) => {
    //       // Reassign positions_write to the updated buffer
    //       this.positions_write = new Float32Array(event.data.buffer);
    //       resolve();
    //     };

    //     // Transfer positions_write buffer to the worker
    //     worker.postMessage(
    //       {
    //         command: "update",
    //         deltaTime,
    //         startIndex,
    //         endIndex,
    //         positions: this.positions_write.buffer,
    //         speeds: this.speeds.buffer, // This buffer is shared, so no transfer
    //       },
    //       [this.positions_write.buffer] // Transfer ownership
    //     );
    //   });
    // });

    // Promise.all(promises).then(() => {
    //   // Swap buffers after all workers are done
    //   [this.positions_read, this.positions_write] = [
    //     this.positions_write,
    //     this.positions_read,
    //   ];

    //   // Update Three.js geometry with the new positions
    //   this.points.geometry.attributes.position.array = this.positions_read;
    //   this.points.geometry.attributes.position.needsUpdate = true;

    //   // Continue animation
    //   requestAnimationFrame(this.animate);
    // });

    // Currently doesn't work... speeds are maybe messed up and not accurate. We probably want realtime sgp analysis on a seperate thread
    // for (let i = 0; i < this.instanceCount; i++) {
    //   const idx = i * 3;

    //   // Update position using speeds
    //   this.positions_write[idx] =
    //     this.positions_read[idx] + this.speeds[idx] * deltaTime; // X
    //   this.positions_write[idx + 1] =
    //     this.positions_read[idx + 1] + this.speeds[idx + 1] * deltaTime; // Y
    //   this.positions_write[idx + 2] =
    //     this.positions_read[idx + 2] + this.speeds[idx + 2] * deltaTime; // Z
    // }

    // // Swap buffers after the update
    // [this.positions_read, this.positions_write] = [
    //   this.positions_write,
    //   this.positions_read,
    // ];

    // // Update Three.js geometry with the new positions
    // this.points.geometry.attributes.position.array = this.positions_read;
    // this.points.geometry.attributes.position.needsUpdate = true;

    requestAnimationFrame(this.animate);
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
        const dt = clock.getDelta();
        this.updatePositions(dt);
      }
    };
  }

  getPosition(instanceId) {
    const index = instanceId * 3;
    return new Vector3(
      this.positions[index],
      this.positions[index + 1],
      this.positions[index + 2]
    );
  }
}
