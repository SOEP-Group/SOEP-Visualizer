import * as THREE from "three";
import { currentGraphics } from "./renderer.js";
import { Sun } from "./sun.js";
import { Earth } from "./earth.js";

export let scene = new THREE.Scene();

export let sun;

// Note Ivan: We should maybe rotate the satellites as well with the earth, but im not sure
export let earth;

function loadBackground() {
  const texture_loader = new THREE.CubeTextureLoader();
  texture_loader.setPath(currentGraphics.textures.skybox);
  const texture = texture_loader.load([
    "px.png",
    "nx.png",
    "py.png",
    "ny.png",
    "pz.png",
    "nz.png",
  ]);
  scene.background = texture;
}

export function InitScene() {
  sun = new Sun();
  earth = new Earth({
    planetSize: 0.5,
    planetAngle: (-23.4 * Math.PI) / 180,
    planetRotationDirection: "counterclockwise",
    rotationSpeedMultiplier: 1,
    orbitalSpeedMultiplier: 1,
  });
  scene.add(sun.getSun());
  scene.add(earth.getPlanet());
  loadBackground();
  const light = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(light);
}

export function reloadScene() {
  loadBackground();
}
