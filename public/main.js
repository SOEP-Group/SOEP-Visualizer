import * as THREE from "three";
import { scene, InitScene, earth } from "./gl/scene.js";
import {
    composer,
    camera,
    renderer,
    InitRenderer,
    updateCameraFocus,
} from "./gl/renderer.js";

export const loadingManager = new THREE.LoadingManager();

const loadingScreen = document.getElementById('loading-screen');

loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url);
};

loadingManager.onLoad = function() {
    console.log('All assets loaded');
    loadingScreen.style.display = 'none';
};

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
};

loadingManager.onError = function(url) {
    console.error('There was an error loading ' + url);
};

// Should be in it own file later when we start getting more serious data in
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let currentOrbitLine = null;

const fakeSatelliteData = [
  { id: "satellite_1", position: { x: -6000, y: -3000, z: 1000 } },
  { id: "satellite_2", position: { x: 3000, y: 5000, z: 3000 } },
  { id: "satellite_3", position: { x: -3000, y: -5000, z: -4000 } },
  { id: "satellite_4", position: { x: 3789, y: 2012, z: -5277 } },
  { id: "satellite_5", position: { x: 3000, y: -1500, z: 1000 } }, 
  { id: "satellite_6", position: { x: 35000, y: 0, z: 0 } },  // High Earth orbit

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

function fetchOrbitData(id) {
    return fetch(`/orbit_data/${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Error fetching orbit data:", error);
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
  const geometry = new THREE.SphereGeometry(0.01, 64, 64);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
  const satelliteMesh = new THREE.Mesh(geometry, material);
  const scaledPosition = scalePosition(satellite.position)
  satelliteMesh.position.set(
    scaledPosition.x,
    scaledPosition.y,
    scaledPosition.z
  );
  satelliteMesh.name = satellite.id;

  // Note Ivan: Add now stuff to earth, that way if we update the earths position, we also update the satelites
  earth.getPlanet().add(satelliteMesh);
}

async function displayOrbit(satellite) {
    stopDisplayingOrbit();

    // get data for this satellite from db
    const data = await fetchOrbitData(satellite);

    const orbitPathGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const tolerance = 50; // might have to update and scale according to startposition
    const loopPosition = {
        x: data[0].position.x,
        y: data[0].position.y,
        z: data[0].position.z,
    };

    for (const entry of data) {
        if (entry.tsince > 30) {
            // go 30 steps forward before looking for the closing of the loop, could REDO THIS MECHANISM
            if (
                entry.position.x >= loopPosition.x - tolerance &&
                entry.position.x <= loopPosition.x + tolerance &&
                entry.position.y >= loopPosition.y - tolerance &&
                entry.position.y <= loopPosition.y + tolerance &&
                entry.position.z >= loopPosition.z - tolerance &&
                entry.position.z <= loopPosition.z + tolerance
            ) {
                console.log("Loop completed");
                break; // Exit the loop entirely
            }
        }

      const scaledEntryPosition = scalePosition(entry.position)
      vertices.push(
        scaledEntryPosition.x,
        scaledEntryPosition.y,
        scaledEntryPosition.z
      );
    }

  // To close the loop
  const scaledLoopPosition = scalePosition(loopPosition)
  vertices.push(
    scaledLoopPosition.x,
    scaledLoopPosition.y,
    scaledLoopPosition.z
  );

  orbitPathGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green
  const orbitLine = new THREE.Line(orbitPathGeometry, orbitMaterial);

  currentOrbitLine = orbitLine;
  earth.getPlanet().add(orbitLine);
}

function stopDisplayingOrbit() {
    if (currentOrbitLine) {
        earth.getPlanet().remove(currentOrbitLine);
    }
}

function scalePosition(satellitePosition) {
  const scaleFactor = 1 / (6378 * 2); // 1 unit is 6,378 (earth equatorial radius) *2 km
  const scaledPosition = {
    x: satellitePosition.x * scaleFactor,
    y: satellitePosition.y * scaleFactor,
    z: satellitePosition.z * scaleFactor
  };

  // Calculate absolut distance from center
  let distanceFromCenter = Math.sqrt(
    scaledPosition.x ** 2 +
    scaledPosition.y ** 2 +
    scaledPosition.z ** 2
  );

  // Sets minimal distance if too close
  if (distanceFromCenter < 0.52) {
    const scalingAdjustment = 0.52 / distanceFromCenter;
    scaledPosition.x *= scalingAdjustment;
    scaledPosition.y *= scalingAdjustment;
    scaledPosition.z *= scalingAdjustment;
  }

  return scaledPosition;
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
            displayOrbit(clickedObject.name);

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

document.addEventListener("DOMContentLoaded", async() => {
    InitRenderer();
    InitScene(loadingManager);
    updateCameraFocus(earth.getPlanet());
    loadSatellites();

    // Let everything load before adding events, otherwise you can get hit by undefined errors

    window.addEventListener("click", onMouseClick, false);

    window.addEventListener("resize", function() {
        let SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight;
        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        composer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    });
    //fetchSatellites();
});