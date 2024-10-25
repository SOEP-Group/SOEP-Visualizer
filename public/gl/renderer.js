import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SSAARenderPass } from "three/addons/postprocessing/SSAARenderPass.js";
import { scene, reloadScene } from "./scene.js";
import { updateDebugMenu } from "./debug.js";

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
    textures: {
      skybox: "/images/skybox/1k/",
      earth: "/images/earth/1k/",
    },
    resolution_divider: 2,
    optional_render_passes: { SSAA: false, Bloom: true },
  },
  medium: {
    textures: {
      skybox: "/images/skybox/2k/",
      earth: "/images/earth/2k/",
    },
    resolution_divider: 2,
    optional_render_passes: { SSAA: true, Bloom: true },
  },
  high: {
    textures: {
      skybox: "/images/skybox/2k/",
      earth: "/images/earth/4k/",
    },
    resolution_divider: 1,
    optional_render_passes: { SSAA: true, Bloom: true },
  },
};

export let currentGraphics = graphicalSettings.ultra_low;
export let rendererInfo = {frames: 0, fps: 0};
export let renderer;
export let controls;
export let camera;
export const clock = new THREE.Clock();
clock.start();
export let composer; // Use this to add render passes for different post processing effects

let cameraFocus;

export function updateCameraFocus(focusTarget) {
  if (focusTarget === null) {
    return;
  }
  cameraFocus = focusTarget;
  const distance = camera.position.distanceTo(controls.target);
  let focusPosition = new THREE.Vector3(0, 0, 0).copy(cameraFocus.position);
  controls.target.set(focusPosition.x, focusPosition.y, focusPosition.z);
  const direction = new THREE.Vector3()
    .subVectors(camera.position, controls.target)
    .normalize();
  const newPosition = new THREE.Vector3()
    .copy(controls.target)
    .add(direction.multiplyScalar(distance));
  camera.position.copy(newPosition);
  controls.update();
}

function updateControlsPos() {
  if (cameraFocus !== undefined) {
    let focusPosition = new THREE.Vector3(0, 0, 0).copy(cameraFocus.position);
    controls.target.set(focusPosition.x, focusPosition.y, focusPosition.z);
  }

  controls.update();
}

let prevTime = performance.now();

function animate() {
  composer.render();
  updateControlsPos();
  updateDebugMenu();

  rendererInfo.frames++;
  const time = performance.now();
  
  if ( time >= prevTime + 1000 ) {
  
    rendererInfo.fps = Math.round( ( rendererInfo.frames * 1000 ) / ( time - prevTime ) );
    
    rendererInfo.frames = 0;
    prevTime = time;
    
  }
  requestAnimationFrame(animate);
}

function InitEffectComposer() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  if (currentGraphics.optional_render_passes.SSAA) {
    const SSAAPass = new SSAARenderPass(
      scene,
      camera,
      new THREE.Vector3(1, 1, 1),
      1
    ); // Better than FXAA, remember all the homies hate FXAA

    composer.addPass(SSAAPass);
  }
  composer.setSize(
    window.innerWidth / currentGraphics.resolution_divider,
    window.innerHeight / currentGraphics.resolution_divider
  );
  if (currentGraphics.optional_render_passes.Bloom) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      1.1 // Everything that goes outside of this rgb threadhold will glow
    );
    composer.addPass(bloomPass);
  }
}

function extractGPUContextValue(reg, str) {
  const matches = str.match(reg);
  return matches && matches[0];
}

function detectIdealSettings() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext('webgl', { powerPreference: "high-performance" }) || canvas.getContext('experimental-webgl', { powerPreference: "high-performance" })

  let vendor = gl.getParameter(gl.VENDOR) || "Unknown Vendor";
  let renderer = gl.getParameter(gl.RENDERER) || "Unknown Renderer";
  if(vendor === "Unknown Vendor" || renderer === "Unknown Renderer"){
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
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

  rendererInfo.gpuContext = {
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

export function InitRenderer() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const viewport_div = document.getElementById("gl_viewport");
  viewport_div.appendChild(renderer.domElement);

  controls = new TrackballControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 1.3;
  controls.maxDistance = 5;
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.05;
  controls.zoomSpeed = 0.3;
  camera.position.set(0, 0, 3);
  currentGraphics = detectIdealSettings();
  console.log(rendererInfo.gpuContext)
  InitEffectComposer();
  animate();
}

// Run this if you have changed some crucial settings such as graphical settings
export function updateRenderer() {
  InitEffectComposer();
  reloadScene();
}
