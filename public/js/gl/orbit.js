import * as THREE from "three";
import { getEarth, glState } from "../gl/index.js";
import { subscribe } from "../eventBuss.js";
import { satellites } from "../gl/scene.js";
import { fetchOrbit } from "../api/satellites.js";

export let currentOrbitLine = null;

export function initOrbit() {
    subscribe("glStateChanged", onGlStateChanged);
  }
  
function onGlStateChanged(changedStates) {
if (changedStates["clickedSatellite"]) {
    const clicked_satellite = glState.get("clickedSatellite");
    if (clicked_satellite !== undefined && clicked_satellite !== null) {
    displayOrbit(satellites.getIdByInstanceId(clicked_satellite));
    } else {
    stopDisplayingOrbit()
    }
}
}

export async function displayOrbit(satellite) {
  stopDisplayingOrbit();

  // get data for this satellite from db
  const data = await fetchOrbit(satellite);

  const orbitPathGeometry = new THREE.BufferGeometry();
  const vertices = [];
  const tolerance = 0.005; // might have to update and scale according to startposition
  const loopPosition = {
      x: data[0].position.x,
      y: data[0].position.y,
      z: data[0].position.z,
  };
  let loopCompleted = false

  for (const entry of data) {
      if (entry.tsince > 30) {
          // go 30 steps forward before looking for the closing of the loop
          if (
              entry.position.x >= loopPosition.x - tolerance &&
              entry.position.x <= loopPosition.x + tolerance &&
              entry.position.y >= loopPosition.y - tolerance &&
              entry.position.y <= loopPosition.y + tolerance &&
              entry.position.z >= loopPosition.z - tolerance &&
              entry.position.z <= loopPosition.z + tolerance
          ) {
              loopCompleted = true
              break; // Exit the loop entirely
          }
      }

      vertices.push(
        entry.position.x,
        entry.position.y,
        entry.position.z
      );
}

// To close the loop
if (loopCompleted){
vertices.push(
  loopPosition.x,
  loopPosition.y,
  loopPosition.z
);
}

orbitPathGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x3CEBF0 }); // Light blue with green tint
const orbitLine = new THREE.Line(orbitPathGeometry, orbitMaterial);

currentOrbitLine = orbitLine;
getEarth().getGroup().add(orbitLine);
}

export function stopDisplayingOrbit() {
if (currentOrbitLine) {
  getEarth().getGroup().remove(currentOrbitLine);
}
}