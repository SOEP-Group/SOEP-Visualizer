import * as THREE from "three";
import { Sun } from "./sun.js";
import { Earth } from "./earth.js";
import { Satellites } from "./satellite.js";
import { subscribe } from "../eventBuss.js";
import { glState, cubeTextureLoader } from "./index.js";
import { fetchOrbit, fetchSatellites } from "../api/satellites.js";

export let scene = new THREE.Scene();

export let sun;

export let satellites;

export let currentOrbitLine = null;

// Note Ivan: We should maybe rotate the satellites as well with the earth, but im not sure
export let earth;

function loadBackground() {
  const curr_path = glState.get("currentGraphics").textures.skybox;
  const texture = cubeTextureLoader.load([
    curr_path + "px.png",
    curr_path + "nx.png",
    curr_path + "py.png",
    curr_path + "ny.png",
    curr_path + "pz.png",
    curr_path + "nz.png",
  ]);
  scene.background = texture;
}

function loadObjects() {
  if (sun) {
    sun.dispose();
  }
  if (earth) {
    earth.dispose();
  }

  sun = new Sun();
  earth = new Earth({
    planetSize: 0.5,
    planetAngle: (-23.4 * Math.PI) / 180,
    planetRotationDirection: "counterclockwise",
    rotationSpeedMultiplier: 1,
    orbitalSpeedMultiplier: 1,
  });

  scene.add(sun.getGroup());
  scene.add(earth.getGroup());
}

export function initOrbit() {
  subscribe("glStateChanged", onGlStateChanged);
}

function onGlStateChanged(changedStates) {
if (changedStates["clickedSatellite"]) {
  const clicked_satellite = glState.get("clickedSatellite");
  if (clicked_satellite !== undefined && clicked_satellite !== null) {
  displayOrbit(satellites.getIdByInstanceId(clicked_satellite));
  } else {
  stopDisplayingOrbit()
  }
}
}

export async function displayOrbit(satellite) {
  stopDisplayingOrbit();

  // get data for this satellite from db
  const data = await fetchOrbit(satellite);

  const orbitPathGeometry = new THREE.BufferGeometry();
  const vertices = [];
  const tolerance = 0.005; // might have to update and scale according to startposition
  const loopPosition = {
      x: data[0].position.x,
      y: data[0].position.y,
      z: data[0].position.z,
  };
  let loopCompleted = false

  for (const entry of data) {
      if (entry.tsince > 30) {
          // go 30 steps forward before looking for the closing of the loop
          if (
              entry.position.x >= loopPosition.x - tolerance &&
              entry.position.x <= loopPosition.x + tolerance &&
              entry.position.y >= loopPosition.y - tolerance &&
              entry.position.y <= loopPosition.y + tolerance &&
              entry.position.z >= loopPosition.z - tolerance &&
              entry.position.z <= loopPosition.z + tolerance
          ) {
              loopCompleted = true
              break; // Exit the loop entirely
          }
      }

      vertices.push(
        entry.position.x,
        entry.position.y,
        entry.position.z
      );
}

// To close the loop
if (loopCompleted){
vertices.push(
  loopPosition.x,
  loopPosition.y,
  loopPosition.z
);
}

orbitPathGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x3CEBF0 }); // Light blue with green tint
const orbitLine = new THREE.Line(orbitPathGeometry, orbitMaterial);

currentOrbitLine = orbitLine;
earth.getGroup().add(orbitLine);
}

export function stopDisplayingOrbit() {
if (currentOrbitLine) {
  earth.getGroup().remove(currentOrbitLine);
}
}

export function initScene() {
  loadObjects();
  loadBackground();
  const light = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(light);

  fetchSatellites().then((res) => {
    satellites = new Satellites(res);
    earth.getGroup().add(satellites.getGroup());
  });
}

export function reloadScene() {
  loadObjects();
  loadBackground();
}
