import * as THREE from "three";
import { Sun } from "./sun.js";
import { Earth } from "./earth.js";

export let scene;

export function InitScene() {
  scene = new THREE.Scene();
  const texture_loader = new THREE.CubeTextureLoader();
  texture_loader.setPath("images/skybox/");
  const texture = texture_loader.load([
    "px.png",
    "nx.png",
    "py.png",
    "ny.png",
    "pz.png",
    "nz.png",
  ]);
  scene.background = texture;

  // Create sun
  const sun = new Sun().getSun();
  scene.add(sun);

  const earth = new Earth({
    planetSize: 0.5,
    planetAngle: (-23.4 * Math.PI) / 180,
    planetRotationSpeed: 0.01,
    planetRotationDirection: "counterclockwise",
  }).getPlanet();

  scene.add(earth);

  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);
}
