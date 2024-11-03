import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { glState } from "./index.js";
import { subscribe } from "../eventBuss.js";
import { modelLibrary } from "./index.js";

// From Ivan:
// deprecated: Probably a bad idea. Takes long to load and upload to the GPU

let satellite;
let viewer_renderer;
let viewer_camera;
let viewer_controls;
let viewer_scene;

const model_viewport = document.getElementById("satellite-model-viewport");

function animate() {
  requestAnimationFrame(animate);
  viewer_controls.update();
  viewer_renderer.render(viewer_scene, viewer_camera);
}

export function initViewer() {
  // Renderer setup
  viewer_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  viewer_renderer.setSize(
    model_viewport.clientWidth,
    model_viewport.clientHeight
  );
  viewer_renderer.setPixelRatio(window.devicePixelRatio);
  model_viewport.appendChild(viewer_renderer.domElement);

  viewer_scene = new THREE.Scene();
  viewer_scene.background = new THREE.Color(0x000000);
  viewer_camera = new THREE.PerspectiveCamera(
    50,
    model_viewport.clientWidth / model_viewport.clientHeight,
    0.1,
    1000
  );
  viewer_camera.position.set(0, 0, 10);
  viewer_controls = new OrbitControls(
    viewer_camera,
    viewer_renderer.domElement
  );
  viewer_controls.enableDamping = true;
  viewer_controls.enablePan = false;
  viewer_controls.minDistance = 3.9;
  viewer_controls.maxDistance = 10;
  const ambientLight = new THREE.AmbientLight(0xffffff, 5);
  viewer_scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  viewer_scene.add(directionalLight);
  animate();
  window.addEventListener("resize", () => {
    viewer_renderer.setSize(
      model_viewport.clientWidth,
      model_viewport.clientHeight
    );
    viewer_camera.aspect =
      model_viewport.clientWidth / model_viewport.clientHeight;
    viewer_camera.updateProjectionMatrix();
  });

  subscribe("glStateChanged", (changedStates) => {
    if (changedStates["clickedSatellite"]) {
      const satellite = glState.get("clickedSatellite");
      if (satellite === undefined || satellite === null) {
        loadNewSatelliteModel(undefined);
      } else {
        loadNewSatelliteModel("models/satellites/satellite.gltf");
      }
    }
  });
}

async function loadNewSatelliteModel(path) {
  if (satellite) {
    viewer_scene.remove(satellite);
    satellite.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
    satellite = undefined;
  }
  if (path !== undefined) {
    satellite = modelLibrary[path];
    viewer_scene.add(satellite);
  }
}
