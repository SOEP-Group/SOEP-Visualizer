import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";
import { scene, reloadScene, sun, satellites } from "./scene.js";
import { glState } from "./index.js";
import { publish, subscribe } from "../eventBuss.js";
import { LensFlarePass } from "./lensflare.js";
import { ViewportGizmo } from "../utils/custom-gizmo.js";

export const graphicalSettings = {
  ultra_low: {
    tag: "Ultra Low",
    textures: {
      skybox: "/images/skybox/Mobile/",
      earth: "/images/earth/Mobile/",
    },
    resolution_divider: 2, // How much will the resolution be divided to when doing post process effects, higher number means lower quality, better performance
    optional_render_passes: { SSAA: false, Bloom: true }, // Post processing really messes the fps on mobile
  },
  low: {
    tag: "Low",
    textures: {
      skybox: "/images/skybox/1k/",
      earth: "/images/earth/1k/",
    },
    resolution_divider: 2,
    optional_render_passes: { SSAA: false, Bloom: true },
  },
  medium: {
    tag: "Medium",
    textures: {
      skybox: "/images/skybox/2k/",
      earth: "/images/earth/2k/",
    },
    resolution_divider: 2,
    optional_render_passes: { SSAA: true, Bloom: true },
  },
  high: {
    tag: "High",
    textures: {
      skybox: "/images/skybox/2k/",
      earth: "/images/earth/4k/",
    },
    resolution_divider: 1,
    optional_render_passes: { SSAA: true, Bloom: true },
  },
};
export const clock = new THREE.Clock();
let loadedImages = false;

export function finishedLoadingImages() {
  loadedImages = true;
}

let renderer;
export let camera;
let composer; // Use this to add render passes for different post processing effects
export let controls;
clock.start();

let orientationGizmo;

function updateCameraFocus(focusTarget) {
  const { target, instanceIndex } = focusTarget;
  const targetGroup = scene.getObjectById(target);

  if (!targetGroup) {
    const newPosition = new THREE.Vector3(0, 0, 0);
    camera.position.copy(newPosition);
    controls.target.set(0, 0, 0);
    controls.update();
    return;
  }

  const cameraFocus = scene.getObjectById(target);
  const focusPosition = new THREE.Vector3();
  let distance;
  if (!cameraFocus) return;
  if (instanceIndex !== undefined) {
    const groupWorldPosition = new THREE.Vector3();
    targetGroup.getWorldPosition(groupWorldPosition);
    let totalPosition = new THREE.Vector3();
    let meshCount = 0;

    targetGroup.children.forEach((child) => {
      if (child.isInstancedMesh) {
        const instanceMatrix = new THREE.Matrix4();
        const instancePosition = new THREE.Vector3();

        if (instanceIndex < child.count) {
          child.getMatrixAt(instanceIndex, instanceMatrix);
          instanceMatrix.decompose(
            instancePosition,
            new THREE.Quaternion(),
            new THREE.Vector3()
          );
          instancePosition.add(groupWorldPosition);
          totalPosition.add(instancePosition);
          meshCount++;
        }
      } else if (child.isPoints) {
        const positions = child.geometry.attributes.position.array;
        if (instanceIndex * 3 < positions.length) {
          const pointPosition = new THREE.Vector3(
            positions[instanceIndex * 3],
            positions[instanceIndex * 3 + 1],
            positions[instanceIndex * 3 + 2]
          );
          pointPosition.add(groupWorldPosition);
          totalPosition.add(pointPosition);
          meshCount++;
        }
      }
    });

    if (meshCount > 0) {
      totalPosition.divideScalar(meshCount);
    }

    focusPosition.copy(totalPosition);
    distance = camera.position.distanceTo(controls.target);
  } else {
    cameraFocus.getWorldPosition(focusPosition);
    distance = camera.position.distanceTo(controls.target);
  }

  const direction = new THREE.Vector3()
    .subVectors(camera.position, controls.target)
    .normalize();
  const newPosition = new THREE.Vector3()
    .copy(focusPosition)
    .add(direction.multiplyScalar(distance));

  gsap.to(camera.position, {
    duration: 1,
    x: newPosition.x,
    y: newPosition.y,
    z: newPosition.z,
    onUpdate: () => {
      orientationGizmo.update();
      controls.update();
    },
  });

  gsap.to(controls.target, {
    duration: 1,
    x: focusPosition.x,
    y: focusPosition.y,
    z: focusPosition.z,
    onUpdate: () => {
      orientationGizmo.update();
      controls.update();
    },
  });
}

let prevTime = performance.now();

function animate() {
  composer.render();
  if (controls.enabled && !orientationGizmo.animating) controls.update();
  let renderer_info = glState.get("rendererInfo");
  renderer_info.frames++;
  const time = performance.now();

  if (time >= prevTime + 1000) {
    renderer_info.fps = Math.round(
      (renderer_info.frames * 1000) / (time - prevTime)
    );

    renderer_info.frames = 0;
    prevTime = time;
  }
  glState.set({ rendererInfo: renderer_info, realTimeDump: renderer.info });
  orientationGizmo.render();
  publish("rendererUpdate");
  requestAnimationFrame(animate);

  if (loadedImages) {
    /*
    Now before anyone complains, some of the images are so big they 
    freeze the main thread waaay too much, I tried figuring out ways
    we could load images more efficiently, all the way down to creating a new format
    nothing worked since it seems to be an issue with threejs and how they load images.
    This timeout is there for the thread to cooldown and regain itself so that we can
    have a smooth fadeout on the loading screen
    */
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen");

      loadingScreen.classList.replace("opacity-100", "opacity-0");

      setTimeout(() => {
        loadingScreen.classList.add("hidden");
      }, 500);
    }, 1000);
  }
}

function initEffectComposer() {
  composer = new EffectComposer(renderer, {
    stencilBuffer: true,
    depthBuffer: true,
    frameBufferType: THREE.HalfFloatType,
  });
  const renderPass = new RenderPass(scene, camera);
  renderPass.clearPass.setClearFlags(true, true, true);
  composer.addPass(renderPass);

  const lensFlarePass = new LensFlarePass(scene, camera, [sun.getFlare()], {
    coverageScale: 2.0,
  });
  lensFlarePass.doTransparency = false;
  composer.addPass(lensFlarePass);

  if (glState.get("currentGraphics").optional_render_passes.SSAA) {
    composer.addPass(new EffectPass(camera, new SMAAEffect(SMAAPreset.ULTRA))); // Better than FXAA, remember all the homies hate FXAA
  }
  const gl_viewport = document.getElementById("gl_viewport");
  composer.setSize(gl_viewport.clientWidth, gl_viewport.clientHeight);
  if (glState.get("currentGraphics").optional_render_passes.Bloom) {
    composer.addPass(new EffectPass(camera, new BloomEffect()));
  }
}

function extractGPUContextValue(reg, str) {
  const matches = str.match(reg);
  return matches && matches[0];
}

function detectIdealSettings() {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl", { powerPreference: "high-performance" }) ||
    canvas.getContext("experimental-webgl", {
      powerPreference: "high-performance",
    });

  let vendor = gl.getParameter(gl.VENDOR) || "Unknown Vendor";
  let renderer = gl.getParameter(gl.RENDERER) || "Unknown Renderer";
  if (vendor === "Unknown Vendor" || renderer === "Unknown Renderer") {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  }
  const card =
    extractGPUContextValue(
      /((NVIDIA|AMD|Intel|Adreno|Mali|Apple|PowerVR)[^\d]*[^\s]+)/,
      renderer
    ) || "Unknown GPU";
  const manufacturer =
    extractGPUContextValue(
      /(NVIDIA|AMD|Intel|Adreno|Mali|Apple|PowerVR)/g,
      card
    ) || "Unknown Manufacturer";
  const integrated = manufacturer === "Intel" || manufacturer === "Apple";

  let isHardwareAccelerated =
    card !== "Unknown GPU" && manufacturer !== "Unknown Manufacturer";

  if (!isHardwareAccelerated) {
    console.warn(
      "Unknown GPU detected, chances are no hardware acceleration is enabled. The app will not run smooth without that turned on"
    );
  }

  let score = 0;

  if (manufacturer === "NVIDIA") score += scoreNvidiaGPU(card);
  else if (manufacturer === "AMD") score += scoreAmdGPU(card);
  else if (manufacturer === "Intel") score += scoreIntelGPU(card);
  else if (manufacturer === "Adreno") score += scoreAdrenoGPU(card);
  else if (manufacturer === "Mali") score += scoreMaliGPU(card);
  else if (manufacturer === "Apple")
    score += scoreAppleGPU(card); // Handles M1/M2 or A-series
  else if (manufacturer === "PowerVR") score += 10; // Lower score for PowerVR (used in older iPhones and Androids)

  if (integrated) score -= 10;
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  score += scoreForMaxTextureSize(maxTextureSize);
  const graphicalPreset = determinePreset(score);

  let renderer_info = glState.get("rendererInfo") || {};
  renderer_info.gpuContext = {
    card,
    manufacturer,
    integrated,
    vendor,
    renderer,
    maxTextureSize,
    score,
    graphicalPreset,
    isHardwareAccelerated,
  };
  glState.set({ rendererInfo: renderer_info });
  return graphicalSettings[graphicalPreset];
}

function scoreForMaxTextureSize(size) {
  if (size >= 8192) return 30; // High-end GPUs
  if (size >= 4096) return 20; // Mid-range GPUs
  if (size >= 2048) return 10; // Low-end GPUs
  return 0;
}

function scoreNvidiaGPU(card) {
  if (/RTX/.test(card)) return 50; // High-end
  if (/GTX/.test(card)) return 40; // Mid-range
  if (/MX/.test(card)) return 20; // Mobile/lower-end
  return 15;
}

function scoreAmdGPU(card) {
  if (/Radeon/.test(card)) {
    if (/RX/.test(card)) return 40; // High-end RX series
    return 30; // Other Radeon cards
  }
  return 15; // Lower-end AMD GPUs
}

function scoreIntelGPU(card) {
  if (/UHD/.test(card)) return 20; // Newer Intel integrated GPUs (UHD series)
  if (/Iris/.test(card)) return 25; // Iris GPUs (integrated but better)
  return 10; // Older Intel integrated GPUs
}

function scoreAppleGPU(card) {
  if (/M1|M2/.test(card)) return 45; // Apple Silicon (M1/M2 chips) are quite powerful
  if (/A\d/.test(card)) return 25; // A-series chips (mobile)
  return 15; // Older or unknown Apple GPUs
}

function scoreAdrenoGPU(card) {
  if (/Adreno 6/.test(card)) return 30; // Adreno 6xx series (high-end mobile)
  if (/Adreno 5/.test(card)) return 20; // Adreno 5xx series (mid-range mobile)
  return 10;
}

function scoreMaliGPU(card) {
  if (/Mali-G7/.test(card)) return 30;
  if (/Mali-G5/.test(card)) return 20;
  return 10;
}

// Note Ivan: Lets play around with the scoring system a bit after more testing
function determinePreset(score) {
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 25) return "low";
  return "ultra_low";
}

export function initRenderer() {
  subscribe("glStateChanged", onStateChanged);
  const gl_viewport = document.getElementById("gl_viewport");
  camera = new THREE.PerspectiveCamera(
    60,
    gl_viewport.clientWidth / gl_viewport.clientHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(gl_viewport.clientWidth, gl_viewport.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  orientationGizmo = new ViewportGizmo(camera, renderer, {
    container: document.getElementById("viewport-gizmo-container"),
    placement: "top-left",
    size: 110,
  });

  orientationGizmo.enabled = false; // Currently we get some weird gimbal lock issues...
  const viewport_div = document.getElementById("gl_viewport");
  viewport_div.appendChild(renderer.domElement);

  controls = new TrackballControls(camera, renderer.domElement);
  controls.noPan = true;
  controls.minDistance = 0.65;
  controls.maxDistance = 10;
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.15;
  controls.zoomSpeed = 0.3;
  controls.update();
  orientationGizmo.attachControls(controls);
  camera.position.set(0, 0, 3);
  let graphics_preset = detectIdealSettings();
  glState.set({ currentGraphics: graphics_preset });
  initEventListeners();
  initEffectComposer();
  animate();
}

function initEventListeners() {
  const gl_viewport = document.getElementById("gl_viewport");
  window.addEventListener("resize", function () {
    let SCREEN_WIDTH = gl_viewport.clientWidth,
      SCREEN_HEIGHT = gl_viewport.clientHeight;
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    composer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    orientationGizmo.update();
  });

  orientationGizmo.addEventListener("start", () => (controls.enabled = false));
  orientationGizmo.addEventListener("end", () => (controls.enabled = true));
}

function updateRenderer() {
  initEffectComposer();
  reloadScene();
}

function onStateChanged(changedStates) {
  if (changedStates["currentGraphics"]) {
    updateRenderer();
  } else if (changedStates["focusedTarget"]) {
    updateCameraFocus(glState.get("focusedTarget"));
  }
}
