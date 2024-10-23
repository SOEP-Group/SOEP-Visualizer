import * as THREE from "three";
import { scene, InitScene } from "./gl/scene.js";
import { composer, camera, renderer, InitRenderer } from "./gl/renderer.js";
import { Sun } from "./gl/sun.js";
import { Earth } from "./gl/earth.js";

// Should be in it own file later when we start getting more serious data in
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create sun
const sun = new Sun().getSun();

// Note Ivan: We should maybe rotate the satellites as well with the earth, but im not sure
const earth = new Earth({
  planetSize: 0.5,
  planetAngle: (-23.4 * Math.PI) / 180,
  planetRotationDirection: "counterclockwise",
  rotationSpeedMultiplier: 1,
  orbitalSpeedMultiplier: 1,
}).getPlanet();

const fakeSatelliteData = [
  { id: "satellite_1", position: { x: 0.5, y: -1, z: 0.1 } },
  { id: "satellite_2", position: { x: -2, y: 0.2, z: 0.2 } },
  { id: "satellite_3", position: { x: 0.3, y: 0.3, z: -1.5 } },
];

async function fetchSatelliteData() {
  try {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(fakeSatelliteData);
      }, 1000); // Simulate network delay
      // reject("Network Error: Unable to fetch satellite data"); Have this reject in future
    });
  } catch (error) {
    console.error("Error fetching satellite data:", error);
    return [];
  }
}

function fetchSatelliteInfo(id) {
  return fetch(`/satellite_info/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching satellite info:", error);
      throw error;
    });
}

function loadSatellites() {
  fetchSatelliteData()
    .then((data) => {
      data.forEach((satellite) => {
        addSatelliteToScene(satellite);
      });
    })
    .catch((error) => console.error("Error loading satellites:", error));
}

function addSatelliteToScene(satellite) {
  const geometry = new THREE.SphereGeometry(0.025, 64, 64);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const satelliteMesh = new THREE.Mesh(geometry, material);

  satelliteMesh.position.set(
    satellite.position.x,
    satellite.position.y,
    satellite.position.z
  );
  satelliteMesh.name = satellite.id;

  // Note Ivan: Add now stuff to earth, that way if we update the earths position, we also update the satelites
  earth.add(satelliteMesh);
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  const dynamicContentDiv = document.getElementById("dynamic-content");

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    if (clickedObject.name.startsWith("satellite_")) {
      console.log("Satellite clicked:", clickedObject.name);
      document.getElementById("loading-skeleton").classList.remove("hidden");

      fetchSatelliteInfo(clickedObject.name)
        .then((data) => {
          document.getElementById("loading-skeleton").classList.add("hidden");
          openPopup(data);
        })
        .catch((error) => {
          console.error("Error fetching satellite info:", error);
          openPopup({
            name: "Error",
            launchDate: "Error",
          });
        });
    }
  } else {
    dynamicContentDiv.classList.add("hidden");
  }
}

window.addEventListener("click", onMouseClick, false);

window.addEventListener("resize", function () {
  let SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  composer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
});

// Temp
function fetchSatellites() {
  fetch("/api/satellites")
    .then((response) => response.json())
    .then((data) => {
      console.log("Satellites:", data);
    })
    .catch((error) => {
      console.error("Error fetching satellites:", error);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  InitScene();

  scene.add(sun);
  scene.add(earth);
  InitRenderer(earth);
  loadSatellites();
  //fetchSatellites();
});
