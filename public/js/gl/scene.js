import * as THREE from "three";
import { Sun } from "./sun.js";
import { Earth } from "./earth.js";
import { Satellites } from "./satellite.js";
import { glState, cubeTextureLoader } from "./index.js";
import { fetchSatellites } from "../api/satellites.js";

export let scene = new THREE.Scene();

export let sun;

export let satellites;

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
