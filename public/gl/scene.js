import * as THREE from "three";

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
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);
}
