import { subscribe, publish } from "../eventBuss.js";
import {
  TextureLoader,
  LoadingManager,
  CubeTextureLoader,
  Vector2,
} from "three";
import { State, globalState } from "../globalState.js";
import { initDebug } from "./debug.js";
import {
  initRenderer,
  graphicalSettings,
  finishedLoadingImages,
  camera,
} from "./renderer.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { initScene, earth, satellites, rebuildSatellitesWithSubset, addSatellites } from "./scene.js";
export * from "./renderer.js";
export * from "./scene.js";
export * from "./debug.js";
export * from "./earth.js";
export * from "./sun.js";
export * from "./model-viewer.js";

subscribe("appStartup", onStart);
subscribe("glStateChanged", onStateChanged);
subscribe("onGlobalStateChanged", onGlobalStateChanged);

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

let isDraggingMouse = false;
let startMouseX = 0;
let startMouseY = 0;

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
      if (globalState.get("pickingLocation")) {
        const res = earth.checkForClick(mouse, camera);
        if (res !== null) {
          document.body.style.cursor = "crosshair";
        } else {
          document.body.style.cursor = "default";
        }
        return;
      }
      if (!satellites) {
        return;
      }
      let hovered_satellite = satellites.checkForClick(mouse, camera);
      if (hovered_satellite !== null) {
        document.body.style.cursor = "pointer";
        satellites.setHovered(hovered_satellite);
        publish("hoveredSatellite", {
          instanceId: hovered_satellite,
          mouseX: event.clientX,
          mouseY: event.clientY,
        });
      } else {
        document.body.style.cursor = "default";
        satellites.setHovered(-1);
        publish("hoveredSatellite", { instanceId: -1 });
      }
    },
    false
  );
  gl_viewport.addEventListener("mousedown", (event) => {
    isDraggingMouse = false;
    startMouseX = event.clientX;
    startMouseY = event.clientY;
  });

  gl_viewport.addEventListener("mousemove", (event) => {
    const moveX = Math.abs(event.clientX - startMouseX);
    const moveY = Math.abs(event.clientY - startMouseY);
    const dragThreshold = 5;

    if (moveX > dragThreshold || moveY > dragThreshold) {
      isDraggingMouse = true;
    }
  });

  gl_viewport.addEventListener("mouseup", (event) => {
    if (!isDraggingMouse) {
      onViewportClick(event);
    }
  });
}

function onViewportClick(event) {
  const mouse = new Vector2();
  const rect = gl_viewport.getBoundingClientRect(); // Get viewport bounds
  mouse.x = ((event.clientX - rect.left) / gl_viewport.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / gl_viewport.clientHeight) * 2 + 1;
  if (globalState.get("pickingLocation")) {
    const res = earth.getLocation(mouse, camera);
    if (res !== null) {
      const { lat, long } = res;
      if (globalState.get("pick_passing")) {
        globalState.set({ passing_location: { lat, long } });
      } else if (globalState.get("pick_pass_prediction")) {
        globalState.set({ pass_prediction_location: { lat, long } });
      }
      globalState.set({ pickingLocation: false });
    }
    return;
  }
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

function onGlobalStateChanged(changedStates) {
  if (changedStates["pickingLocation"]) {
    const picking = globalState.get("pickingLocation");
    //satellites.hide(picking);
    earth.togglePickingLocation(picking);
  }
  if (changedStates["togglePassing"]) {
    const isDisplayingPassing = globalState.get("togglePassing");
    const location = globalState.get("passing_location");

    if (isDisplayingPassing && location) {
      const radius = 500;
      const passingSatellites = satellites.getPassingSatellites(location, radius);
      console.log(passingSatellites);
      /*for (var i=1;i<=500;i++) {
        passingSatellites[i] = i;
      }*/
      rebuildSatellitesWithSubset(passingSatellites);
    } else {
      addSatellites(globalState.get("satellites"));
    }
  }
}
