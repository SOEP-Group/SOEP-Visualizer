import * as THREE from "three";
import { glState } from "../gl/index.js";
import { subscribe } from "../eventBuss.js";
import { satellites } from "../gl/scene.js";
import {
  propagate,
  twoline2satrec,
} from "../../libs/satellite.js/dist/satellite.es.js";
import { scalePosition } from "../utils/utils.js";

export let currentOrbitLine = null;
export let currentSatelliteCenterLine = null;
export let velocityArrow = null;

const sgp4_errors = {
  1: "mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er",
  2: "mean motion less than 0.0",
  3: "pert elements, ecc < 0.0  or  ecc > 1.0",
  4: "semi-latus rectum < 0.0",
  5: "epoch elements are sub-orbital",
  6: "satellite has decayed",
};

export function initOrbit() {
  subscribe("glStateChanged", onGlStateChanged);
}

function onGlStateChanged(changedStates) {
  if (changedStates["clickedSatellite"]) {
    const clicked_satellite = glState.get("clickedSatellite");
    if (clicked_satellite !== undefined && clicked_satellite !== null) {
      displayOrbit(clicked_satellite);
    } else {
      stopDisplayingOrbit();
    }
  }
}

let orbitAnimating = false; // Flag to control animation

export function displayOrbit(satellite) {
  stopDisplayingOrbit();

  const orbitPathGeometry = new THREE.BufferGeometry();
  const orbitVertices = []; // For the orbit path
  const dynamicLineGeometry = new THREE.BufferGeometry();
  const dynamicVertices = [0, 0, 0, 0, 0, 0]; // Earth center [0, 0, 0] + satellite dynamic position
  const tle_lines = satellites.getTLEData(satellite);

  // Validate TLE data
  if (!tle_lines || !tle_lines.first || !tle_lines.second) {
    console.error("Invalid TLE data:", tle_lines);
    return;
  }

  const satrec = twoline2satrec(tle_lines.first, tle_lines.second);
  if (!satrec) {
    console.error("Failed to parse satellite record!", satrec.error);
    return;
  }

  const meanMotion = satrec.no;
  const orbitalPeriod = (2 * Math.PI) / meanMotion + 1; // Orbital period in minutes
  const timeStep = 1; // Minutes
  const startTime = new Date(); // Current time

  // Add Earth center to the dynamic line geometry
  dynamicLineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(dynamicVertices, 3)
  );

  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Yellow for orbit
  const dynamicLineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Yellow for dynamic line

  currentOrbitLine = new THREE.Line(orbitPathGeometry, orbitMaterial);
  currentSatelliteCenterLine = new THREE.Line(
    dynamicLineGeometry,
    dynamicLineMaterial
  );

  satellites.getGroup().add(currentOrbitLine);
  satellites.getGroup().add(currentSatelliteCenterLine);

  // Calculate orbit path
  for (let t = 0; t <= orbitalPeriod; t += timeStep) {
    const time = new Date(startTime.getTime() + t * 60 * 1000); // Increment time by timeStep
    const positionAndVelocity = propagate(satrec, time);

    if (!positionAndVelocity.position) {
      console.warn(`Propagation failed at step ${t}`);
      continue;
    }

    let { x, y, z } = positionAndVelocity.position;
    const scaledPosition = scalePosition({ x: x, y: z, z: -y });

    orbitVertices.push(scaledPosition.x, scaledPosition.y, scaledPosition.z);
  }

  orbitPathGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(orbitVertices, 3)
  );

  // Satellite position and velocity
  let satelliteVel = scalePosition(satellites.getSpeed(satellite));
  satelliteVel = new THREE.Vector3(
    satelliteVel.x * 50,
    satelliteVel.y * 50,
    satelliteVel.z * 50
  );

  orbitAnimating = true;

  // Function to update the dynamic line
  function updateDynamicLine() {
    if (!orbitAnimating) return;

    const currentPosition = satellites.getPosition(satellite);
    const currentVel = scalePosition(satellites.getSpeed(satellite));

    if (!currentPosition) {
      console.warn("Failed to get satellite position");
      return;
    }

    // Update satellite position in the dynamic line geometry
    dynamicVertices[3] = currentPosition.x; // Satellite X
    dynamicVertices[4] = currentPosition.y; // Satellite Y
    dynamicVertices[5] = currentPosition.z;

    dynamicLineGeometry.attributes.position.array = new Float32Array(
      dynamicVertices
    );

    dynamicLineGeometry.attributes.position.needsUpdate = true;

    requestAnimationFrame(updateDynamicLine);
  }

  updateDynamicLine();
}

export function stopDisplayingOrbit() {
  orbitAnimating = false;
  if (currentOrbitLine) {
    satellites.getGroup().remove(currentOrbitLine);
    satellites.getGroup().remove(currentSatelliteCenterLine);
    currentOrbitLine = null;
    currentSatelliteCenterLine = null;
  }
}
