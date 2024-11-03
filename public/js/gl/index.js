import { subscribe, publish } from "../eventBuss.js";
import {
  TextureLoader,
  LoadingManager,
  CubeTextureLoader,
  Vector2,
} from "three";
import { State } from "../globalState.js";
import { initDebug } from "./debug.js";
import {
  initRenderer,
  graphicalSettings,
  finishedLoadingImages,
  camera,
} from "./renderer.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { initScene, earth, satellites } from "./scene.js";
import { initViewer } from "./model-viewer.js";
export * from "./renderer.js";
export * from "./scene.js";
export * from "./debug.js";
export * from "./earth.js";
export * from "./sun.js";
export * from "./model-viewer.js";

subscribe("appStartup", onStart);
subscribe("glStateChanged", onStateChanged);

const initialGlState = {
  rendererInfo: { frames: 0, fps: 0 },
  currentGraphics: graphicalSettings.ultra_low,
  focusedTarget: { target: undefined },
  realTimeDump: undefined,
  clickedSatellite: undefined,
};

const modelPaths = ["models/satellites/satellite.gltf"];

export const glState = new State("glStateChanged", initialGlState);
const loadingManager = new LoadingManager();
export let textureLoader = new TextureLoader(loadingManager);
export let cubeTextureLoader = new CubeTextureLoader(loadingManager);
export let gltfLoader = new GLTFLoader(loadingManager);
// not sure if this is good, since if we have alot of models it might over take the ram
export let modelLibrary = {}; // path: model

function onStart() {
  loadingManager.onStart = () => {};
  loadingManager.onLoad = onLoadFinished;
  loadingManager.onProgress = onLoadProgress;
  loadingManager.onError = onLoadError;
  initScene();
  initRenderer();
  initDebug();
  // loadAllModels();
  // initViewer();

  glState.set({
    focusedTarget: { target: earth.getGroup().id },
  });

  const gl_viewport = document.getElementById("gl_viewport");
  gl_viewport.addEventListener(
    "mousemove",
    (event) => {
      const mouse = new Vector2();
      const rect = gl_viewport.getBoundingClientRect(); // Get viewport bounds
      mouse.x = ((event.clientX - rect.left) / gl_viewport.clientWidth) * 2 - 1;
      mouse.y =
        -((event.clientY - rect.top) / gl_viewport.clientHeight) * 2 + 1;
      let hovered_satellite = satellites.checkForClick(mouse, camera);
      if (hovered_satellite !== null) {
        document.body.style.cursor = "pointer";
        satellites.setHovered(hovered_satellite);
      } else {
        document.body.style.cursor = "default";
        satellites.setHovered(-1);
      }
    },
    false
  );
  gl_viewport.addEventListener("click", onViewportClick, false);
}

function onViewportClick(event) {
  const mouse = new Vector2();
  const rect = gl_viewport.getBoundingClientRect(); // Get viewport bounds
  mouse.x = ((event.clientX - rect.left) / gl_viewport.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / gl_viewport.clientHeight) * 2 + 1;
  let clicked_satellite = satellites.checkForClick(mouse, camera);
  if (clicked_satellite !== null) {
    glState.set({
      clickedSatellite: clicked_satellite,
    });
  }
}

function onLoadFinished() {
  finishedLoadingImages();
  publish("initalLoadingDone");
}

function onLoadProgress(url, itemsLoaded, itemsTotal) {
  console.log(
    `Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`
  );
}

function loadAllModels() {
  modelPaths.forEach((path) => {
    gltfLoader.load(
      path,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.metalness = 0.8;
            child.material.roughness = 0.3;
          }
        });
        modelLibrary[path] = gltf.scene;
      },
      undefined,
      (error) => console.error(error)
    );
  });
}

function onLoadError(url) {
  console.error("There was an error loading " + url);
}

function onStateChanged(changedStates) {
  if (changedStates["clickedSatellite"]) {
    const clicked_satellite = glState.get("clickedSatellite");
    if (clicked_satellite === undefined || clicked_satellite === null) {
      glState.set({
        focusedTarget: { target: earth.getGroup().id },
      });
      satellites.setFocused(-1);
    } else {
      glState.set({
        focusedTarget: {
          target: satellites.getGroup().id,
          instanceIndex: clicked_satellite,
        },
      });
      satellites.setFocused(clicked_satellite);
    }
  }
}