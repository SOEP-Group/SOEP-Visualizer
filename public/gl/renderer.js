import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { scene } from "./scene.js";

export let renderer;
export let controls;
export let camera;
export const clock = new THREE.Clock();
clock.start();
export let composer; // Use this to add render passes for different post processing effects

function animate() {
  composer.render();
  requestAnimationFrame(animate);
}

export function InitRenderer() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const viewport_div = document.getElementById("gl_viewport");
  viewport_div.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 0.6;
  controls.maxDistance = 10;

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    1.1 // Everything that goes outside of this rgb threadhold will glow
  );
  composer.addPass(bloomPass);

  const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight); // Better than FXAA, remember all the homies hate FXAA
  composer.addPass(smaaPass);

  animate();
}
